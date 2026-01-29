import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const supabase = await createClient();

  // PKCE flow: Supabase redirects with a code parameter
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/confirmed`);
    }
  }

  // Email verification flow: Supabase sends token_hash + type directly
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email',
    });
    if (!error) {
      return NextResponse.redirect(`${origin}/confirmed`);
    }
  }

  // If both flows fail, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
