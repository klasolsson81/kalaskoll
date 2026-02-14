import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isBetaEnded, PROTECTED_TESTERS } from '@/lib/beta-config';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET (Vercel sends this automatically for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 401 });
    }

    if (!isBetaEnded()) {
      return NextResponse.json({ message: 'Beta not ended yet, skipping cleanup' });
    }

    const adminClient = createAdminClient();

    // Get all tester user IDs
    const { data: testers, error: fetchError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'tester');

    if (fetchError) {
      console.error('[cron/cleanup-testers] Failed to fetch testers:', fetchError.message);
      return NextResponse.json({ error: 'Failed to fetch testers' }, { status: 500 });
    }

    if (!testers || testers.length === 0) {
      return NextResponse.json({ message: 'No testers to clean up', deleted: 0 });
    }

    // Filter out protected testers whose extended date hasn't passed yet
    const now = new Date();
    const protectedIds = new Set(
      PROTECTED_TESTERS
        .filter((p) => now <= new Date(`${p.until}T23:59:59`))
        .map((p) => p.id)
    );
    const testersToDelete = testers.filter((t) => !protectedIds.has(t.id));

    if (protectedIds.size > 0) {
      console.log(`[cron/cleanup-testers] Skipping ${protectedIds.size} protected tester(s)`);
    }

    // Delete each tester's auth user (cascades to profiles → parties → etc.)
    let deleted = 0;
    const errors: string[] = [];

    for (const tester of testersToDelete) {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(tester.id);
      if (deleteError) {
        errors.push(`${tester.id}: ${deleteError.message}`);
      } else {
        deleted++;
      }
    }

    console.log(`[cron/cleanup-testers] Deleted ${deleted}/${testers.length} testers`);

    if (errors.length > 0) {
      console.error('[cron/cleanup-testers] Errors:', errors);
    }

    return NextResponse.json({
      message: `Cleanup complete: ${deleted}/${testers.length} testers deleted`,
      deleted,
      total: testers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[cron/cleanup-testers] Unexpected error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
