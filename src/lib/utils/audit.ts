import type { SupabaseClient } from '@supabase/supabase-js';

interface AuditEntry {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event. Fire-and-forget — failures are logged but don't
 * interrupt the calling flow.
 */
export async function logAudit(
  supabase: SupabaseClient,
  entry: AuditEntry,
): Promise<void> {
  try {
    await supabase.from('audit_log').insert({
      user_id: entry.userId ?? null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error('[Audit] Failed to log event:', entry.action, err);
  }
}
