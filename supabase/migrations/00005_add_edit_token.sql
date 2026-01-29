-- Migration: Add edit_token to rsvp_responses
-- Purpose: Secure edit links for RSVP responses (no more upsert via email)

-- 1. Add edit_token column (nullable first for backfill)
ALTER TABLE rsvp_responses
  ADD COLUMN edit_token VARCHAR(64);

-- 2. Backfill existing rows with random tokens
UPDATE rsvp_responses
SET edit_token = encode(gen_random_bytes(32), 'hex')
WHERE edit_token IS NULL;

-- 3. Now set NOT NULL constraint
ALTER TABLE rsvp_responses
  ALTER COLUMN edit_token SET NOT NULL;

-- 4. Add UNIQUE constraint
ALTER TABLE rsvp_responses
  ADD CONSTRAINT rsvp_responses_edit_token_key UNIQUE (edit_token);

-- 5. Create index for fast lookups
CREATE INDEX idx_rsvp_edit_token ON rsvp_responses(edit_token);
