import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { IMPERSONATE_COOKIE } from '@/lib/utils/impersonation';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Åtkomst nekad' }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId krävs' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE);

  return NextResponse.json({ ok: true });
}
