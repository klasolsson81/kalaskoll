import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  // Determine post-auth redirect: use `next` if it's a safe relative path
  const successUrl = next && next.startsWith('/') ? `${origin}${next}` : `${origin}/confirmed`;

  const supabase = await createClient();

  // Flow 1: PKCE code exchange (normal Supabase redirect flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(successUrl);
    }
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);

    // Fallback: try as OTP token (some email templates send raw token as "code")
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'signup',
    });
    if (!otpError) {
      return NextResponse.redirect(successUrl);
    }
    console.error('[auth/callback] verifyOtp fallback failed:', otpError.message);
  }

  // Flow 2: token_hash + type parameters (Supabase default email template / invite)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email' | 'invite',
    });
    if (!error) {
      return NextResponse.redirect(successUrl);
    }
    console.error('[auth/callback] verifyOtp failed:', error.message);
  }

  // All flows failed
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
