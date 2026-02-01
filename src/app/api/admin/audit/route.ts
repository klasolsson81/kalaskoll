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

    // Resolve user IDs and resource IDs to readable names
    const userIds = new Set<string>();
    const partyIds = new Set<string>();

    for (const log of data ?? []) {
      if (log.user_id) userIds.add(log.user_id);
      if (log.resource_type === 'user' && log.resource_id) userIds.add(log.resource_id);
      if (log.resource_type === 'party' && log.resource_id) partyIds.add(log.resource_id);
    }

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

    return NextResponse.json({
      logs: data,
      total: count ?? 0,
      page,
      limit,
      users: userMap,
      parties: partyMap,
    });
  } catch (error) {
    console.error('Admin audit error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
