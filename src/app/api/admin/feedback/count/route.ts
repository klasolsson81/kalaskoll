import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/admin-guard';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;
    const { adminClient } = guard;

    const { count, error } = await adminClient
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error('Admin feedback count error:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
