-- Add invitation_template column to parties table
-- Stores the selected free template ID (e.g. 'dinosaurier', 'rymden')
-- NULL = no template selected
-- Mutually exclusive with invitation_image_url as active invitation style

ALTER TABLE parties ADD COLUMN invitation_template TEXT;
