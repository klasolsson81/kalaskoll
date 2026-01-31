-- Add photo columns to children table
ALTER TABLE children ADD COLUMN photo_url TEXT;
ALTER TABLE children ADD COLUMN photo_frame TEXT DEFAULT 'circle'
  CHECK (photo_frame IN ('circle', 'star', 'heart', 'diamond'));
