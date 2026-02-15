import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '../../helpers/supabase-mock';

let mockServerClient: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockServerClient,
}));

vi.mock('@/lib/sms/elks', () => ({
  sendPartySms: vi.fn().mockResolvedValue({ id: 'sms-1' }),
  SmsApiError: class SmsApiError extends Error {
    statusCode: number;
    responseBody: string;
    constructor(statusCode: number, responseBody: string) {
      super(`46elks API error: ${statusCode}`);
      this.name = 'SmsApiError';
      this.statusCode = statusCode;
      this.responseBody = responseBody;
    }
  },
}));

vi.mock('@/lib/beta-config', () => ({
  BETA_CONFIG: { freeSmsInvites: 5, freeAiImages: 3 },
}));

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
vi.stubEnv('ELKS_API_USERNAME', 'test-user');
vi.stubEnv('ELKS_API_PASSWORD', 'test-pass');

const { POST } = await import('@/app/api/invitation/send-sms/route');

const PARTY_ID = 'a0000000-0000-4000-8000-000000000001';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/invitation/send-sms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  partyId: PARTY_ID,
  phones: ['+46701234567'],
};

describe('POST /api/invitation/send-sms', () => {
  beforeEach(() => {
    mockServerClient = createMockSupabaseClient();
    vi.stubEnv('ELKS_API_USERNAME', 'test-user');
    vi.stubEnv('ELKS_API_PASSWORD', 'test-pass');
  });

  it('returns 401 when user is not authenticated', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid request body (missing phones)', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });

    const res = await POST(makeRequest({ partyId: PARTY_ID }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid partyId format', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });

    const res = await POST(makeRequest({ partyId: 'not-a-uuid', phones: ['+46701234567'] }));

    expect(res.status).toBe(400);
  });

  it('returns 404 when party not found', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });
    mockServerClient.mockTable('parties', { data: null, error: { code: 'PGRST116' } });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(404);
  });

  it('returns 404 when party owner does not match', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });
    mockServerClient.mockTable('parties', {
      data: {
        id: PARTY_ID,
        owner_id: 'other-user',
        child_name: 'Max',
        child_age: 5,
        party_date: '2026-06-01',
        party_time: '14:00',
        venue_name: 'Hemma',
        venue_address: null,
        rsvp_deadline: null,
      },
      error: null,
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(404);
  });

  it('returns 503 when SMS credentials are not configured', async () => {
    vi.stubEnv('ELKS_API_USERNAME', '');
    vi.stubEnv('ELKS_API_PASSWORD', '');

    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });
    mockServerClient.mockTable('parties', {
      data: {
        id: PARTY_ID,
        owner_id: 'u-1',
        child_name: 'Max',
        child_age: 5,
        party_date: '2026-06-01',
        party_time: '14:00',
        venue_name: 'Hemma',
        venue_address: null,
        rsvp_deadline: null,
      },
      error: null,
    });
    mockServerClient.mockTable('invitations', {
      data: { token: 'inv-token' },
      error: null,
    });
    mockServerClient.mockTable('profiles', {
      data: { role: 'user', beta_sms_used: 0 },
      error: null,
    });
    mockServerClient.mockTable('sms_usage', { data: null, error: { code: 'PGRST116' } });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toContain('SMS-tjänsten');
  });

  it('sends SMS successfully and returns sent count', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'test@example.com' } },
      error: null,
    });

    mockServerClient.mockTable('parties', {
      data: {
        id: PARTY_ID,
        owner_id: 'u-1',
        child_name: 'Max',
        child_age: 5,
        party_date: '2026-06-01',
        party_time: '14:00',
        venue_name: 'Hemma',
        venue_address: null,
        rsvp_deadline: null,
      },
      error: null,
    });
    mockServerClient.mockTable('invitations', {
      data: { token: 'inv-token' },
      error: null,
    });
    mockServerClient.mockTableSequence('profiles', [
      { data: { role: 'user', beta_sms_used: 0 }, error: null },
      { data: { role: 'user', beta_sms_used: 0 }, error: null },
    ]);
    mockServerClient.mockTableSequence('sms_usage', [
      { data: null, error: { code: 'PGRST116' } },   // no existing usage
      { data: null, error: { code: 'PGRST116' } },   // check existing for update
      { data: { sms_count: 1 }, error: null },         // updated usage read
    ]);
    mockServerClient.mockTable('invited_guests', { data: null, error: null });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sent).toBe(1);
    expect(json.failed).toBe(0);
  });
});
