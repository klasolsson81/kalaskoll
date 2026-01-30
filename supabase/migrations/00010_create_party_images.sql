-- Migration: Create party_images table for AI image gallery
-- Each party can have multiple generated images, one selected as active

CREATE TABLE party_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_party_images_party ON party_images(party_id);

-- RLS: only party owner can manage images
ALTER TABLE party_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage party images"
  ON party_images FOR ALL
  USING (auth.uid() = (SELECT owner_id FROM parties WHERE id = party_id));
