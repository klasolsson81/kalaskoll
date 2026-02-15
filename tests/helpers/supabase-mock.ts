/**
 * Supabase chainable mock builder for integration tests.
 *
 * Usage:
 *   const mock = createMockSupabaseClient();
 *   mock.mockTable('parties', { data: [...], error: null });
 *   // mock.from('parties').select(...).eq(...).single() → resolves with mocked data
 */

import { vi } from 'vitest';

type MockResult = { data: unknown; error: unknown; count?: number | null };

/**
 * Creates a chain object where every method returns itself,
 * and the chain resolves to the provided result (via `then()`).
 */
function createChain(result: MockResult) {
  const chain: Record<string, unknown> = {};
  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'lt', 'gt', 'lte', 'gte', 'in',
    'single', 'maybeSingle', 'order', 'limit', 'range',
    'is', 'not', 'or', 'filter', 'match', 'contains',
  ];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // Make the chain thenable so `await supabase.from(...).select(...)` resolves
  chain.then = (resolve: (v: MockResult) => void) => resolve(result);
  return chain;
}

export interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    admin: {
      deleteUser: ReturnType<typeof vi.fn>;
    };
  };
  storage: {
    from: ReturnType<typeof vi.fn>;
  };
  /** Set the result for a specific table. */
  mockTable: (table: string, result: MockResult) => void;
  /** Set per-call results for a table (consumed in order). */
  mockTableSequence: (table: string, results: MockResult[]) => void;
}

export function createMockSupabaseClient(): MockSupabaseClient {
  const tableResults = new Map<string, MockResult>();
  const tableSequences = new Map<string, MockResult[]>();

  const fromFn = vi.fn((table: string) => {
    // Check sequence first
    const seq = tableSequences.get(table);
    if (seq && seq.length > 0) {
      return createChain(seq.shift()!);
    }
    const result = tableResults.get(table) ?? { data: null, error: null };
    return createChain(result);
  });

  return {
    from: fromFn,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/img.png' } })),
      })),
    },
    mockTable(table: string, result: MockResult) {
      tableResults.set(table, result);
    },
    mockTableSequence(table: string, results: MockResult[]) {
      tableSequences.set(table, [...results]);
    },
  };
}
