import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { logAudit } from '@/lib/utils/audit';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { user: adminUser, adminClient } = guard;

    const { id } = await params;

    // Verify party exists and is soft-deleted
    const { data: party, error: fetchError } = await adminClient
      .from('parties')
      .select('id, child_name, deleted_at')
      .eq('id', id)
      .not('deleted_at', 'is', null)
      .single();

    if (fetchError || !party) {
      return NextResponse.json(
        { error: 'Kalaset hittades inte eller är inte raderat' },
        { status: 404 },
      );
    }

    // Restore: set deleted_at to null
    const { error: updateError } = await adminClient
      .from('parties')
      .update({ deleted_at: null })
      .eq('id', id);

    if (updateError) {
      console.error('[Admin] Failed to restore party:', updateError);
      return NextResponse.json({ error: 'Kunde inte återställa kalaset' }, { status: 500 });
    }

    logAudit(adminClient, {
      userId: adminUser.id,
      action: 'party.restore',
      resourceType: 'party',
      resourceId: id,
      metadata: { childName: party.child_name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin] Restore party error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
