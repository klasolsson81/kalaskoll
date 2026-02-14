'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/utils/validation';

export interface ProfileActionResult {
  error?: string;
  fieldError?: string;
  success?: boolean;
  successMessage?: string;
}

export async function updateProfile(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const raw = {
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || '',
    email: formData.get('email') as string,
    currentPassword: formData.get('currentPassword') as string,
    newPassword: (formData.get('newPassword') as string) || '',
    confirmPassword: (formData.get('confirmPassword') as string) || '',
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === 'confirmPassword') {
      return { fieldError: issue.message };
    }
    return { error: issue.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Du måste vara inloggad' };
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.currentPassword,
  });

  if (signInError) {
    return { error: 'Felaktigt lösenord' };
  }

  const messages: string[] = [];

  // Update name in auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (authError) {
    return { error: 'Kunde inte uppdatera profilen' };
  }

  // Upsert profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return { error: 'Kunde inte spara profildata' };
  }

  messages.push('Profilen har uppdaterats');

  // Update email if changed
  const emailChanged = parsed.data.email.toLowerCase() !== (user.email || '').toLowerCase();
  if (emailChanged) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });

    if (emailError) {
      return { error: 'Kunde inte uppdatera e-postadressen: ' + emailError.message };
    }

    messages.push('En bekräftelselänk har skickats till din nya e-postadress');
  }

  // Update password if provided
  if (parsed.data.newPassword) {
    const { error: pwError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (pwError) {
      if (pwError.message.includes('same_password')) {
        return { error: 'Det nya lösenordet måste skilja sig från det nuvarande' };
      }
      return { error: 'Kunde inte uppdatera lösenordet' };
    }

    messages.push('Lösenordet har ändrats');
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return {
    success: true,
    successMessage: messages.join('. ') + '!',
  };
}
