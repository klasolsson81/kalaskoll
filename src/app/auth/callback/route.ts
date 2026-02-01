import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  const successUrl = next && next.startsWith('/') ? `${origin}${next}` : `${origin}/confirmed`;

  // Collect cookies set by Supabase auth so we can attach them to the
  // redirect response. Using cookies() from next/headers does NOT work
  // because NextResponse.redirect() creates a new response object and
  // the cookies from the implicit response are lost.
  const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const header = request.headers.get('cookie') ?? '';
          if (!header) return [];
          return header.split('; ').map((c) => {
            const idx = c.indexOf('=');
            return { name: c.slice(0, idx), value: c.slice(idx + 1) };
          });
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
        },
      },
    },
  );

  let verified = false;

  // Flow 1: PKCE code exchange (normal Supabase redirect flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      verified = true;
    } else {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message);

      // Fallback: try as OTP token (some email templates send raw token as "code")
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'signup',
      });
      if (!otpError) {
        verified = true;
      } else {
        console.error('[auth/callback] verifyOtp fallback failed:', otpError.message);
      }
    }
  }

  // Flow 2: token_hash + type parameters (invite magic link, signup, etc.)
  if (!verified && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email' | 'invite' | 'magiclink',
    });
    if (!error) {
      verified = true;
    } else {
      console.error('[auth/callback] verifyOtp failed:', error.message);
    }
  }

  const redirectUrl = verified ? successUrl : `${origin}/login?error=verification_failed`;
  const response = NextResponse.redirect(redirectUrl);

  // Apply session cookies to the redirect response
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }

  return response;
}
