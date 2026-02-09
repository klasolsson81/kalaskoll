import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import type { CookieOptions } from '@supabase/ssr';

/** Verify the HMAC signature from the invite URL. */
function verifyInviteSignature(
  email: string,
  uid: string,
  expires: number,
  sig: string,
): boolean {
  const data = `${email}:${uid}:${expires}`;
  const expected = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(data)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  // Signed invite parameters
  const inviteEmail = searchParams.get('invite_email');
  const inviteUid = searchParams.get('invite_uid');
  const expires = searchParams.get('expires');
  const sig = searchParams.get('sig');

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
  let lastError = '';

  // Flow 1: PKCE code exchange (normal Supabase redirect flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      verified = true;
    } else {
      lastError = `pkce: ${error.message}`;
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
    }
  }

  // Flow 2: HMAC-signed invite (admin tester invites)
  // The token is generated and verified in the SAME request, so it can never
  // expire or be invalidated between generation and the user clicking the link.
  if (!verified && inviteEmail && inviteUid && expires && sig) {
    const expiresNum = Number(expires);
    if (Number.isNaN(expiresNum) || expiresNum < Date.now() / 1000) {
      lastError = 'invite: link expired';
      console.error('[auth/callback] invite link expired');
    } else if (!verifyInviteSignature(inviteEmail, inviteUid, expiresNum, sig)) {
      lastError = 'invite: invalid signature';
      console.error('[auth/callback] invite signature invalid');
    } else {
      // Signature valid — generate a fresh magic link and immediately verify it
      try {
        const adminClient = createAdminClient();
        const { data: magicData, error: magicError } =
          await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email: inviteEmail,
          });

        if (magicError || !magicData) {
          lastError = `invite_gen: ${magicError?.message ?? 'no data'}`;
          console.error('[auth/callback] generateLink failed:', magicError?.message);
        } else {
          // Try token_hash form first
          const { error: hashError } = await supabase.auth.verifyOtp({
            token_hash: magicData.properties.hashed_token,
            type: 'magiclink',
          });

          if (!hashError) {
            verified = true;
          } else {
            console.error('[auth/callback] verifyOtp(hash) failed:', hashError.message);

            // Fallback: try email + token form
            const { error: otpError } = await supabase.auth.verifyOtp({
              email: inviteEmail,
              token: magicData.properties.email_otp,
              type: 'magiclink',
            });

            if (!otpError) {
              verified = true;
            } else {
              lastError = `invite_otp: hash=${hashError.message}, email=${otpError.message}`;
              console.error('[auth/callback] verifyOtp(email) failed:', otpError.message);
            }
          }
        }
      } catch (err) {
        lastError = `invite_err: ${err instanceof Error ? err.message : 'unknown'}`;
        console.error('[auth/callback] invite flow error:', err);
      }
    }
  }

  // Flow 3: token_hash + type (legacy Supabase email links, signup confirmation)
  if (!verified && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email' | 'invite' | 'magiclink' | 'recovery',
    });
    if (!error) {
      verified = true;
    } else {
      lastError = `otp_hash: ${error.message}`;
      console.error('[auth/callback] verifyOtp(token_hash) failed:', error.message);
    }
  }

  const errorParams = new URLSearchParams({
    error: 'verification_failed',
    detail: lastError,
  });
  if (inviteEmail) {
    errorParams.set('email', inviteEmail);
  }
  const redirectUrl = verified
    ? successUrl
    : `${origin}/login?${errorParams.toString()}`;
  const response = NextResponse.redirect(redirectUrl);

  // Apply session cookies to the redirect response
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }

  return response;
}
