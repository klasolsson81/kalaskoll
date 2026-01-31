-- TD-09: Tighten RSVP UPDATE RLS policy
-- Previously: USING (true) — any authenticated user could update any response
-- Now: Only party owners can update via authenticated client
-- Guest edits go through service-role API (bypasses RLS), validated by edit_token

DROP POLICY IF EXISTS "Anyone can update response" ON rsvp_responses;

CREATE POLICY "Owners can update responses"
  ON rsvp_responses FOR UPDATE
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    WHERE i.id = invitation_id
  ));

-- Also add DELETE policy for rsvp_responses (owner only)
CREATE POLICY "Owners can delete responses"
  ON rsvp_responses FOR DELETE
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    WHERE i.id = invitation_id
  ));

-- Allergy data: owners can update and delete
CREATE POLICY "Owners can update allergy data"
  ON allergy_data FOR UPDATE
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    JOIN rsvp_responses r ON r.invitation_id = i.id
    WHERE r.id = rsvp_id
  ));

CREATE POLICY "Owners can delete allergy data"
  ON allergy_data FOR DELETE
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    JOIN rsvp_responses r ON r.invitation_id = i.id
    WHERE r.id = rsvp_id
  ));
