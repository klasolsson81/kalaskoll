import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete account:', err);
    return NextResponse.json(
      { error: 'Kunde inte radera kontot. Försök igen senare.' },
      { status: 500 },
    );
  }
}
