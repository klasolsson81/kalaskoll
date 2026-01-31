-- Add child photo columns to parties table
-- Photo stored as base64 data-URL (400x400 WebP ~30-60KB)
-- Frame shape for decorative clip-path rendering

ALTER TABLE parties ADD COLUMN child_photo_url TEXT;
ALTER TABLE parties ADD COLUMN child_photo_frame TEXT DEFAULT 'circle'
  CHECK (child_photo_frame IN ('circle', 'star', 'heart', 'diamond'));
