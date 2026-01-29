-- RSVP responses
CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  message TEXT,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id)
);

-- Allergy data (SEPARATE table for GDPR - health data)
CREATE TABLE allergy_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID REFERENCES rsvp_responses(id) ON DELETE CASCADE NOT NULL,
  allergies JSONB,
  other_dietary TEXT,
  consent_given_at TIMESTAMPTZ NOT NULL,
  auto_delete_at TIMESTAMPTZ NOT NULL,
  UNIQUE(rsvp_id)
);

-- Indexes
CREATE INDEX idx_rsvp_invitation ON rsvp_responses(invitation_id);
CREATE INDEX idx_allergy_delete ON allergy_data(auto_delete_at);

-- Enable RLS
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergy_data ENABLE ROW LEVEL SECURITY;

-- rsvp_responses: owners can read
CREATE POLICY "Owners can read responses"
  ON rsvp_responses FOR SELECT
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    WHERE i.id = invitation_id
  ));

-- rsvp_responses: anyone can insert (rate limited in API)
CREATE POLICY "Anyone can insert response"
  ON rsvp_responses FOR INSERT
  WITH CHECK (true);

-- rsvp_responses: token holder can update own response
CREATE POLICY "Anyone can update response"
  ON rsvp_responses FOR UPDATE
  USING (true);

-- allergy_data: ONLY owners can read (health data!)
CREATE POLICY "Only owners can read allergy data"
  ON allergy_data FOR SELECT
  USING (auth.uid() = (
    SELECT p.owner_id FROM parties p
    JOIN invitations i ON i.party_id = p.id
    JOIN rsvp_responses r ON r.invitation_id = i.id
    WHERE r.id = rsvp_id
  ));

-- allergy_data: anyone can insert with consent
CREATE POLICY "Anyone can insert allergy data with consent"
  ON allergy_data FOR INSERT
  WITH CHECK (consent_given_at IS NOT NULL);

-- Auto-update updated_at on rsvp_responses
CREATE TRIGGER rsvp_responses_updated_at
  BEFORE UPDATE ON rsvp_responses
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
