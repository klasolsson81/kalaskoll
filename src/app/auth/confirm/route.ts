import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Handles Supabase default email template which redirects to /auth/confirm
// with token_hash and type parameters
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email',
    });

    if (!error) {
      return NextResponse.redirect(`${origin}/confirmed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
