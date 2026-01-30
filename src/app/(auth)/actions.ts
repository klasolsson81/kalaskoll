'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/utils/validation';

export interface AuthResult {
  error?: string;
}

export async function login(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: 'Fel e-post eller lösenord' };
  }

  redirect('/dashboard');
}

export async function register(formData: FormData): Promise<AuthResult> {
  const raw = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const headersList = await headers();
  const origin = (headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('[register] Supabase signUp error:', error.message, error.status);
    return { error: `Kunde inte skapa konto: ${error.message}` };
  }

  redirect('/check-email');
}

