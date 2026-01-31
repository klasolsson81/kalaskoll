-- TD-10: Audit trail for key events
-- Tracks party CRUD, RSVP submissions, allergy data access, and account changes

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,          -- e.g. 'party.create', 'rsvp.submit', 'allergy.read'
  resource_type TEXT NOT NULL,   -- e.g. 'party', 'rsvp_response', 'allergy_data'
  resource_id UUID,              -- ID of the affected row
  metadata JSONB DEFAULT '{}',   -- Additional context (ip, user_agent, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user and by time
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- RLS: users can read their own audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit log"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (no INSERT policy needed for service role)
-- Anonymous inserts for RSVP events (user_id is null)
CREATE POLICY "Anyone can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Auto-cleanup: remove audit entries older than 90 days
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 4 * * *',
  $$DELETE FROM public.audit_log WHERE created_at < NOW() - INTERVAL '90 days'$$
);
