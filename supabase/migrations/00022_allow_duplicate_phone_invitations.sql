-- Migration: Allow duplicate phone invitations + track send failures
--
-- Fixes two user-reported issues:
-- 1. Families with multiple children (e.g. twins) can now receive multiple
--    SMS invitations to the same phone number without the duplicates disappearing
-- 2. Failed SMS are now tracked with status and error message so users can see
--    which invitations didn't go through

-- 1. Drop the partial unique index that prevents duplicate phone invitations
DROP INDEX IF EXISTS idx_invited_guests_party_phone;

-- 2. Recreate as non-unique index for query performance
CREATE INDEX idx_invited_guests_party_phone
  ON invited_guests(party_id, phone)
  WHERE phone IS NOT NULL;

-- 3. Add send status tracking
ALTER TABLE invited_guests
  ADD COLUMN IF NOT EXISTS send_status TEXT NOT NULL DEFAULT 'sent';

ALTER TABLE invited_guests
  ADD COLUMN IF NOT EXISTS error_message TEXT;
