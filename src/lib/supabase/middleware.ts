import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isBetaEnded, isBetaEndedForUser } from '@/lib/beta-config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access protected routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/kalas') ||
      request.nextUrl.pathname.startsWith('/admin'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // After beta ends, redirect testers to farewell page on protected routes
  if (
    user &&
    isBetaEnded() &&
    !request.nextUrl.pathname.startsWith('/beta-ended') &&
    !request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/kalas'))
  ) {
    // Check if user is a tester (admins are exempt)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'tester' && isBetaEndedForUser(user.id)) {
      const url = request.nextUrl.clone();
      url.pathname = '/beta-ended';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
