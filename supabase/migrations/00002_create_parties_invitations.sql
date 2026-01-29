-- Create parties table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age > 0 AND child_age < 20),
  party_date DATE NOT NULL,
  party_time TIME NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  description TEXT,
  theme TEXT,
  invitation_image_url TEXT,
  rsvp_deadline DATE,
  max_guests INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invitations table (unique QR tokens)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(8) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_parties_owner ON parties(owner_id);
CREATE INDEX idx_invitations_party ON invitations(party_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Enable RLS
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Parties: owners have full access
CREATE POLICY "Owners can CRUD own parties"
  ON parties FOR ALL
  USING (auth.uid() = owner_id);

-- Invitations: owners can manage
CREATE POLICY "Owners can manage invitations"
  ON invitations FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM parties WHERE id = party_id));

-- Invitations: anyone can read by token (for RSVP)
CREATE POLICY "Anyone can read invitation by token"
  ON invitations FOR SELECT
  USING (true);

-- Auto-update updated_at on parties
CREATE TRIGGER parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
