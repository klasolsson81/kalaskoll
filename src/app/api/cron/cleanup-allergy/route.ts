import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GDPR: Daily cleanup of expired allergy data.
 * Deletes rows where auto_delete_at has passed.
 * Configured as Vercel Cron: runs daily at 03:00 UTC.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await admin
      .from('allergy_data')
      .delete()
      .lt('auto_delete_at', now)
      .select('id');

    if (error) {
      console.error('[Cron] Allergy cleanup failed:', error);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    const count = data?.length ?? 0;
    console.log(`[Cron] Allergy cleanup: deleted ${count} expired rows`);

    return NextResponse.json({ deleted: count });
  } catch (err) {
    console.error('[Cron] Allergy cleanup error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
