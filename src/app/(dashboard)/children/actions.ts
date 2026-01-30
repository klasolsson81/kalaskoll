'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { childSchema } from '@/lib/utils/validation';

export interface ChildActionResult {
  error?: string;
  success?: boolean;
}

export async function createChild(
  _prev: ChildActionResult,
  formData: FormData,
): Promise<ChildActionResult> {
  const raw = {
    name: formData.get('name') as string,
    birthDate: formData.get('birthDate') as string,
  };

  const parsed = childSchema.safeParse(raw);
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

  const { error } = await supabase.from('children').insert({
    owner_id: user.id,
    name: parsed.data.name,
    birth_date: parsed.data.birthDate,
  });

  if (error) {
    return { error: 'Kunde inte lägga till barn. Försök igen.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateChild(
  childId: string,
  _prev: ChildActionResult,
  formData: FormData,
): Promise<ChildActionResult> {
  const raw = {
    name: formData.get('name') as string,
    birthDate: formData.get('birthDate') as string,
  };

  const parsed = childSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('children')
    .update({
      name: parsed.data.name,
      birth_date: parsed.data.birthDate,
    })
    .eq('id', childId);

  if (error) {
    return { error: 'Kunde inte uppdatera barn. Försök igen.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteChild(childId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('children').delete().eq('id', childId);
  revalidatePath('/dashboard');
}
