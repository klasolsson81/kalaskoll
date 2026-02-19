import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search')?.toLowerCase() ?? '';
    const sort = searchParams.get('sort') ?? 'deleted_at';
    const order = searchParams.get('order') === 'asc' ? true : false;

    // Fetch soft-deleted parties with owner info
    const query = adminClient
      .from('parties')
      .select('id, child_name, child_age, party_date, owner_id, deleted_at')
      .not('deleted_at', 'is', null)
      .order(
        ['deleted_at', 'party_date', 'child_name'].includes(sort) ? sort : 'deleted_at',
        { ascending: order },
      );

    const { data: parties, error } = await query;

    if (error) {
      console.error('[Admin] Failed to fetch deleted parties:', error);
      return NextResponse.json({ error: 'Failed to fetch deleted parties' }, { status: 500 });
    }

    if (!parties || parties.length === 0) {
      return NextResponse.json({ parties: [] });
    }

    // Fetch owner profiles
    const ownerIds = [...new Set(parties.map((p) => p.owner_id))];
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .in('id', ownerIds);

    // Fetch owner emails via auth admin
    const { data: usersListRes } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const authUsers = usersListRes?.users ?? [];

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const emailMap = new Map(authUsers.map((u) => [u.id, u.email]));

    let result = parties.map((p) => ({
      id: p.id,
      childName: p.child_name,
      childAge: p.child_age,
      partyDate: p.party_date,
      deletedAt: p.deleted_at,
      ownerName: profileMap.get(p.owner_id)?.full_name ?? null,
      ownerEmail: emailMap.get(p.owner_id) ?? null,
    }));

    // Client-side search filtering (on name, owner, email)
    if (search) {
      result = result.filter(
        (p) =>
          p.childName?.toLowerCase().includes(search) ||
          p.ownerName?.toLowerCase().includes(search) ||
          p.ownerEmail?.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ parties: result });
  } catch (error) {
    console.error('[Admin] Deleted parties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
