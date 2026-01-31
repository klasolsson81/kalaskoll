import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

if (typeof window !== 'undefined') {
  throw new Error('Admin client can only be used server-side');
}

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
