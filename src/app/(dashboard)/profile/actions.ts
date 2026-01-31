'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileSchema, passwordSchema } from '@/lib/utils/validation';

export interface ProfileActionResult {
  error?: string;
  fieldError?: string;
  success?: boolean;
}

export async function updateProfile(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const raw = {
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || '',
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Du måste vara inloggad' };
  }

  // Update auth user metadata
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

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true };
}

export async function updatePassword(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const raw = {
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = passwordSchema.safeParse(raw);
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

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    if (error.message.includes('same_password')) {
      return { error: 'Det nya lösenordet måste skilja sig från det nuvarande' };
    }
    return { error: 'Kunde inte uppdatera lösenordet' };
  }

  return { success: true };
}
