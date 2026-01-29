-- Migration: Allow multiple RSVP responses per invitation
-- parent_email becomes the identifier (one response per email per invitation)

-- 1. Drop the old unique constraint (one response per invitation)
ALTER TABLE rsvp_responses DROP CONSTRAINT IF EXISTS rsvp_responses_invitation_id_key;

-- 2. Backfill NULL parent_email on any existing rows
UPDATE rsvp_responses
SET parent_email = 'unknown-' || id || '@placeholder.local'
WHERE parent_email IS NULL;

-- 3. Make parent_email NOT NULL
ALTER TABLE rsvp_responses ALTER COLUMN parent_email SET NOT NULL;

-- 4. Add new composite unique constraint (one response per email per invitation)
ALTER TABLE rsvp_responses
  ADD CONSTRAINT rsvp_responses_invitation_email_unique
  UNIQUE (invitation_id, parent_email);

-- 5. Index for case-insensitive email lookup
CREATE INDEX idx_rsvp_email_lower
  ON rsvp_responses (invitation_id, lower(parent_email));
