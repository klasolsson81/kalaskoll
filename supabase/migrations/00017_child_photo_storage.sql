-- TD-03: Create Supabase Storage bucket for child photos
-- Migrates from base64 data-URLs in TEXT columns to object storage

-- Create public bucket for child photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('child-photos', 'child-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'child-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read access for child photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'child-photos');

-- Allow owners to delete their photos
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'child-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
