import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createMockSupabaseClient, type MockSupabaseClient } from '../../helpers/supabase-mock';

let mockServiceClient: MockSupabaseClient;

// Mock @supabase/supabase-js which the RSVP route imports directly
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockServiceClient,
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  isRateLimited: vi.fn().mockResolvedValue(false),
}));

vi.mock('@/lib/email/resend', () => ({
  sendRsvpConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/utils/crypto', () => ({
  encryptAllergyData: vi.fn((allergies: string[], other: string | null) => ({
    allergies_enc: JSON.stringify(allergies),
    other_dietary_enc: other,
  })),
}));

vi.mock('@/lib/utils/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
vi.stubEnv('ALLERGY_ENCRYPTION_KEY', '');

const { POST } = await import('@/app/api/rsvp/route');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/rsvp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  token: 'inv-token-abc',
  children: [{ childName: 'Alice', attending: true }],
  parentName: 'Anna',
  parentEmail: 'anna@example.com',
};

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    mockServiceClient = createMockSupabaseClient();
  });

  it('rejects invalid body (missing required fields)', async () => {
    const req = makeRequest({ token: 'abc' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('rejects when token is missing', async () => {
    const req = makeRequest({
      children: [{ childName: 'Alice', attending: true }],
      parentEmail: 'anna@example.com',
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 404 when invitation token is invalid', async () => {
    // invitations lookup returns nothing
    mockServiceClient.mockTable('invitations', { data: null, error: { code: 'PGRST116' } });

    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Ogiltig inbjudan');
  });

  it('returns 409 when email has already responded', async () => {
    // 1. invitations lookup
    // 2. parties (deadline check)
    // 3. rsvp_responses (duplicate check) — returns existing
    // 4. parties (party details) — not reached
    mockServiceClient.mockTable('invitations', {
      data: { id: 'inv-1', party_id: 'p-1', token: 'inv-token-abc' },
      error: null,
    });
    mockServiceClient.mockTableSequence('parties', [
      { data: { rsvp_deadline: null }, error: null },
      { data: { child_name: 'Max', party_date: '2026-06-01', party_time: '14:00', venue_name: 'Hemma' }, error: null },
    ]);
    mockServiceClient.mockTable('rsvp_responses', {
      data: [{ id: 'rsvp-existing', child_name: 'Alice' }],
      error: null,
    });

    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain('redan svarat');
  });

  it('submits RSVP successfully for a single child', async () => {
    // Sequence: invitations → parties(deadline) → rsvp_responses(dup check) → parties(details) → rsvp_responses(insert)
    mockServiceClient.mockTable('invitations', {
      data: { id: 'inv-1', party_id: 'p-1', token: 'inv-token-abc' },
      error: null,
    });
    mockServiceClient.mockTableSequence('parties', [
      { data: { rsvp_deadline: null }, error: null },
      { data: { child_name: 'Max', party_date: '2026-06-01', party_time: '14:00', venue_name: 'Hemma' }, error: null },
    ]);
    mockServiceClient.mockTableSequence('rsvp_responses', [
      { data: [], error: null },        // duplicate check: empty
      { data: { id: 'rsvp-new-1' }, error: null }, // insert result
    ]);

    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.rsvpIds).toEqual(['rsvp-new-1']);
  });

  it('returns 400 when RSVP deadline has passed', async () => {
    mockServiceClient.mockTable('invitations', {
      data: { id: 'inv-1', party_id: 'p-1', token: 'inv-token-abc' },
      error: null,
    });
    mockServiceClient.mockTable('parties', {
      data: { rsvp_deadline: '2020-01-01' }, // past date
      error: null,
    });

    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Sista svarsdatum har passerat');
  });

  it('returns 429 when rate limited', async () => {
    const { isRateLimited } = await import('@/lib/utils/rate-limit');
    vi.mocked(isRateLimited).mockResolvedValueOnce(true);

    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(429);
    vi.mocked(isRateLimited).mockResolvedValue(false);
  });

  it('handles malformed JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: 'not-json{{{',
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Ogiltigt format');
  });
});
