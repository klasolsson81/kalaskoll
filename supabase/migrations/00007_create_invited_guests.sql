-- Saved guest list per party (for tracking invitations sent via email)
CREATE TABLE invited_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(party_id, email)
);

ALTER TABLE invited_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage invited guests"
  ON invited_guests FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM parties WHERE id = party_id));

CREATE INDEX idx_invited_guests_party ON invited_guests(party_id);
