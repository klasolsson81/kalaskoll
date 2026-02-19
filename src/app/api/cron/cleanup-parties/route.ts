import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/utils/audit';

/**
 * GDPR: Daily cleanup of old parties.
 * Deletes non-deleted parties where party_date is more than 30 days ago.
 * CASCADE removes invitations, rsvp_responses, allergy_data, party_images, invited_guests.
 * Configured as Vercel Cron: runs daily at 04:00 UTC.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    // Find expired parties (not soft-deleted, party_date > 30 days ago)
    const { data: expiredParties, error: fetchError } = await admin
      .from('parties')
      .select('id, party_date, owner_id')
      .is('deleted_at', null)
      .lt('party_date', cutoffDate);

    if (fetchError) {
      console.error('[Cron] Party cleanup fetch failed:', fetchError);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    if (!expiredParties || expiredParties.length === 0) {
      console.log('[Cron] Party cleanup: no expired parties');
      return NextResponse.json({ deleted: 0 });
    }

    const partyIds = expiredParties.map((p) => p.id);

    const { error: deleteError } = await admin
      .from('parties')
      .delete()
      .in('id', partyIds);

    if (deleteError) {
      console.error('[Cron] Party cleanup delete failed:', deleteError);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    // Audit log each deletion
    for (const party of expiredParties) {
      logAudit(admin, {
        userId: party.owner_id,
        action: 'party.auto_deleted',
        resourceType: 'party',
        resourceId: party.id,
        metadata: { reason: 'expired', partyDate: party.party_date },
      });
    }

    console.log(`[Cron] Party cleanup: deleted ${expiredParties.length} expired parties`);

    return NextResponse.json({ deleted: expiredParties.length });
  } catch (err) {
    console.error('[Cron] Party cleanup error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
