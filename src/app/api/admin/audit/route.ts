import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const actionFilter = searchParams.get('action') ?? null;

    const offset = (page - 1) * limit;

    let query = adminClient
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (actionFilter) {
      query = query.eq('action', actionFilter);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    // ── Collect all IDs we need to resolve ──────────────────────
    const userIds = new Set<string>();
    const partyIds = new Set<string>();
    const rsvpIds = new Set<string>();
    const invitationIds = new Set<string>();

    for (const log of data ?? []) {
      if (log.user_id) userIds.add(log.user_id);
      if (log.resource_type === 'user' && log.resource_id) userIds.add(log.resource_id);
      if (log.resource_type === 'party' && log.resource_id) partyIds.add(log.resource_id);
      if (log.resource_type === 'rsvp_response' && log.resource_id) rsvpIds.add(log.resource_id);

      const meta = log.metadata as Record<string, unknown> | null;
      if (meta?.invitationId && typeof meta.invitationId === 'string') {
        invitationIds.add(meta.invitationId);
      }
    }

    // ── Resolve users ───────────────────────────────────────────
    const userMap: Record<string, string> = {};
    if (userIds.size > 0) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers();
      const emailMap: Record<string, string> = {};
      for (const u of authUsers) {
        if (u.email) emailMap[u.id] = u.email;
      }

      for (const id of userIds) {
        const name = profiles?.find((p) => p.id === id)?.full_name;
        const email = emailMap[id];
        userMap[id] = name || email || id.slice(0, 8);
      }
    }

    // ── Resolve RSVP responses ──────────────────────────────────
    const rsvpMap: Record<string, { childName: string; attending: boolean; invitationId: string }> = {};
    if (rsvpIds.size > 0) {
      const { data: rsvps } = await adminClient
        .from('rsvp_responses')
        .select('id, child_name, attending, invitation_id')
        .in('id', Array.from(rsvpIds));

      for (const r of rsvps ?? []) {
        rsvpMap[r.id] = { childName: r.child_name, attending: r.attending, invitationId: r.invitation_id };
        invitationIds.add(r.invitation_id);
      }
    }

    // ── Resolve invitations → party IDs ─────────────────────────
    const invitationMap: Record<string, { partyId: string }> = {};
    if (invitationIds.size > 0) {
      const { data: invitations } = await adminClient
        .from('invitations')
        .select('id, party_id')
        .in('id', Array.from(invitationIds));

      for (const inv of invitations ?? []) {
        invitationMap[inv.id] = { partyId: inv.party_id };
        partyIds.add(inv.party_id);
      }
    }

    // ── Resolve parties ─────────────────────────────────────────
    const partyMap: Record<string, string> = {};
    if (partyIds.size > 0) {
      const { data: parties } = await adminClient
        .from('parties')
        .select('id, child_name')
        .in('id', Array.from(partyIds));

      for (const p of parties ?? []) {
        partyMap[p.id] = p.child_name;
      }
    }

    // ── Also resolve all child names per invitation (multi-child) ─
    const invitationChildNames: Record<string, string[]> = {};
    if (invitationIds.size > 0) {
      const { data: allRsvps } = await adminClient
        .from('rsvp_responses')
        .select('invitation_id, child_name, attending')
        .in('invitation_id', Array.from(invitationIds));

      for (const r of allRsvps ?? []) {
        if (!invitationChildNames[r.invitation_id]) {
          invitationChildNames[r.invitation_id] = [];
        }
        invitationChildNames[r.invitation_id].push(r.child_name);
      }
    }

    // ── Build human-readable summaries per log entry ────────────
    const summaries: Record<string, string> = {};

    for (const log of data ?? []) {
      const meta = log.metadata as Record<string, unknown> | null;

      if (log.action === 'rsvp.submit' && log.resource_id) {
        const rsvp = rsvpMap[log.resource_id];
        if (rsvp) {
          const inv = invitationMap[rsvp.invitationId];
          const partyName = inv ? partyMap[inv.partyId] : null;
          const status = rsvp.attending ? 'JA' : 'NEJ';

          // Get all child names for this invitation
          const allChildren = invitationChildNames[rsvp.invitationId];
          const childNames = allChildren && allChildren.length > 1
            ? allChildren.join(' och ')
            : rsvp.childName;

          let desc = `${childNames} svarade ${status}`;
          if (partyName) desc += ` — ${partyName}s kalas`;
          summaries[log.id] = desc;
        }
      } else if (log.action === 'party.create' && log.resource_id) {
        const partyName = partyMap[log.resource_id];
        summaries[log.id] = partyName ? `Skapade ${partyName}s kalas` : 'Skapade nytt kalas';
      } else if (log.action === 'account.delete') {
        const userName = log.user_id ? userMap[log.user_id] : null;
        summaries[log.id] = userName ? `${userName} raderade sitt konto` : 'Konto raderat';
      } else if (log.action === 'admin.user.delete' && log.resource_id) {
        const targetName = userMap[log.resource_id] || 'Okänd användare';
        summaries[log.id] = `Raderade ${targetName}`;
      } else if (log.action === 'admin.user.role_change' && log.resource_id) {
        const targetName = userMap[log.resource_id] || 'Okänd användare';
        const newRole = (meta?.newRole as string) || 'okänd';
        summaries[log.id] = `Ändrade ${targetName} till ${newRole}`;
      } else if (log.action === 'admin.user.invite') {
        const email = (meta?.email as string) || 'okänd';
        summaries[log.id] = `Bjöd in ${email}`;
      }
    }

    return NextResponse.json({
      logs: data,
      total: count ?? 0,
      page,
      limit,
      users: userMap,
      parties: partyMap,
      summaries,
    });
  } catch (error) {
    console.error('Admin audit error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
