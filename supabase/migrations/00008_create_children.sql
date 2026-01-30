-- Children table: saved children on user profile
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_children_owner ON children(owner_id);
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can CRUD own children"
  ON children FOR ALL
  USING (auth.uid() = owner_id);

-- Add optional child_id FK on parties (backwards-compatible)
ALTER TABLE parties
  ADD COLUMN child_id UUID REFERENCES children(id) ON DELETE SET NULL;
