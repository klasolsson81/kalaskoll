-- Migration: Allow multiple children per parent in a single RSVP submission
-- Parents with siblings can submit separate rows per child (same email + invitation)

-- 1. Drop the old unique constraint (one response per email per invitation)
ALTER TABLE rsvp_responses
  DROP CONSTRAINT IF EXISTS rsvp_responses_invitation_email_unique;

-- 2. New constraint: same child_name + email + invitation may not repeat
ALTER TABLE rsvp_responses
  ADD CONSTRAINT rsvp_responses_invitation_email_child_unique
  UNIQUE (invitation_id, parent_email, child_name);
