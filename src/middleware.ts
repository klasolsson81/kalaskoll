import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isIpBlocked } from '@/lib/utils/bot-block';

export async function middleware(request: NextRequest) {
  // Bot block check — redirect blocked IPs before anything else
  if (!request.nextUrl.pathname.startsWith('/blocked')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (await isIpBlocked(ip)) {
      const url = request.nextUrl.clone();
      url.pathname = '/blocked';
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
