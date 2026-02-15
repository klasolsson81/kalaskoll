import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createMockSupabaseClient, type MockSupabaseClient } from '../../helpers/supabase-mock';

let mockAdmin: MockSupabaseClient;

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdmin,
}));

// Stub env before importing the route
vi.stubEnv('CRON_SECRET', 'test-cron-secret');

// Dynamic import so mocks are in place
const { GET } = await import('@/app/api/cron/cleanup-allergy/route');

describe('GET /api/cron/cleanup-allergy', () => {
  beforeEach(() => {
    mockAdmin = createMockSupabaseClient();
  });

  it('rejects requests without valid authorization header', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/cleanup-allergy');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Ej behörig');
  });

  it('rejects requests with wrong bearer token', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/cleanup-allergy', {
      headers: { authorization: 'Bearer wrong-token' },
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('deletes expired allergy rows and returns count', async () => {
    mockAdmin.mockTable('allergy_data', {
      data: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
      error: null,
    });

    const req = new NextRequest('http://localhost:3000/api/cron/cleanup-allergy', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(3);
    expect(mockAdmin.from).toHaveBeenCalledWith('allergy_data');
  });

  it('returns 0 when no rows are expired', async () => {
    mockAdmin.mockTable('allergy_data', { data: [], error: null });

    const req = new NextRequest('http://localhost:3000/api/cron/cleanup-allergy', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(0);
  });

  it('returns 500 when database delete fails', async () => {
    mockAdmin.mockTable('allergy_data', {
      data: null,
      error: { message: 'db error' },
    });

    const req = new NextRequest('http://localhost:3000/api/cron/cleanup-allergy', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Cleanup failed');
  });
});
