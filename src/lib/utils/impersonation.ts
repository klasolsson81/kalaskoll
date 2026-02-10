import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_EMAILS } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';

export const IMPERSONATE_COOKIE = 'kk_impersonate';

interface ImpersonationContext {
  isImpersonating: boolean;
  effectiveUserId: string;
  client: SupabaseClient;
  /** The real admin user's ID */
  realUserId: string;
  /** Display info about the impersonated user (null when not impersonating) */
  impersonatedName: string | null;
  impersonatedEmail: string | null;
}

/**
 * Reads the impersonation cookie, verifies the caller is admin,
 * and returns the appropriate client + effective user ID.
 *
 * When impersonating: returns admin client (bypasses RLS) + target user ID.
 * When not impersonating: returns normal supabase client + real user ID.
 */
export async function getImpersonationContext(): Promise<ImpersonationContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const cookieStore = await cookies();
  const targetUserId = cookieStore.get(IMPERSONATE_COOKIE)?.value;

  // Not impersonating or not admin — return normal context
  if (!targetUserId || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return {
      isImpersonating: false,
      effectiveUserId: user.id,
      client: supabase,
      realUserId: user.id,
      impersonatedName: null,
      impersonatedEmail: null,
    };
  }

  // Impersonating — use admin client and fetch target user info
  const adminClient = createAdminClient();

  const { data: targetUser } = await adminClient.auth.admin.getUserById(targetUserId);
  if (!targetUser?.user) {
    // Target user doesn't exist — ignore cookie, return normal context
    return {
      isImpersonating: false,
      effectiveUserId: user.id,
      client: supabase,
      realUserId: user.id,
      impersonatedName: null,
      impersonatedEmail: null,
    };
  }

  // Fetch display name from profiles
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', targetUserId)
    .single();

  return {
    isImpersonating: true,
    effectiveUserId: targetUserId,
    client: adminClient,
    realUserId: user.id,
    impersonatedName: profile?.full_name ?? targetUser.user.user_metadata?.full_name ?? null,
    impersonatedEmail: targetUser.user.email ?? null,
  };
}
