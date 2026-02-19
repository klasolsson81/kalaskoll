-- Soft-delete for parties: mark as deleted instead of hard delete
-- Allows admin to restore deleted parties within 30 days

-- 1. Add deleted_at column
ALTER TABLE parties ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Index for fast filtering on deleted_at
CREATE INDEX idx_parties_deleted_at ON parties(deleted_at) WHERE deleted_at IS NOT NULL;

-- 3. Replace RLS policy so regular users never see soft-deleted parties
DROP POLICY IF EXISTS "Owners can CRUD own parties" ON parties;

CREATE POLICY "Owners can CRUD own parties"
  ON parties FOR ALL
  USING (auth.uid() = owner_id AND deleted_at IS NULL);

-- 4. Hard-delete after 30 days via pg_cron (runs daily at 05:00 UTC)
-- Note: pg_cron must be enabled in Supabase dashboard (Extensions → pg_cron)
-- The CASCADE on invitations/rsvp_responses/allergy_data will clean up related data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'hard-delete-soft-deleted-parties',
      '0 5 * * *',
      $cron$
        DELETE FROM parties
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '30 days';
      $cron$
    );
  END IF;
END $$;
