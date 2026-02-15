import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '../../helpers/supabase-mock';

let mockServerClient: MockSupabaseClient;
let mockAdminClient: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockServerClient,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}));

vi.mock('@/lib/utils/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import('@/app/api/auth/delete-account/route');

describe('POST /api/auth/delete-account', () => {
  beforeEach(() => {
    mockServerClient = createMockSupabaseClient();
    mockAdminClient = createMockSupabaseClient();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const res = await POST();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Ej inloggad');
  });

  it('deletes user account successfully', async () => {
    const userId = 'user-123';
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: userId, email: 'test@example.com' } },
      error: null,
    });
    mockAdminClient.auth.admin.deleteUser.mockResolvedValue({ data: null, error: null });

    const res = await POST();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify admin deleted the user
    expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
    // Verify sign out was called
    expect(mockServerClient.auth.signOut).toHaveBeenCalled();
  });

  it('returns 500 when admin delete fails', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockAdminClient.auth.admin.deleteUser.mockRejectedValue(new Error('Admin error'));

    const res = await POST();

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('Kunde inte radera kontot');
  });
});
