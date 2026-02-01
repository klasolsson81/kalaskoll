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

    return NextResponse.json({
      logs: data,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Admin audit error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
