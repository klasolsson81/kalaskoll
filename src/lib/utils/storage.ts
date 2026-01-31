import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'child-photos';

/**
 * Upload a base64 data-URL image to Supabase Storage.
 * Returns the public URL on success, or null if storage is unavailable.
 */
export async function uploadPhotoToStorage(
  supabase: SupabaseClient,
  userId: string,
  resourceId: string,
  dataUrl: string,
): Promise<string | null> {
  try {
    // Parse data-URL
    const match = dataUrl.match(/^data:image\/(webp|jpeg|png);base64,(.+)$/);
    if (!match) return null;

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    // Validate magic bytes to ensure buffer is actually an image
    const MAGIC: Record<string, number[]> = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png:  [0x89, 0x50, 0x4E, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46],
    };
    const expected = MAGIC[ext === 'jpg' ? 'jpeg' : ext];
    if (!expected?.every((b, i) => buffer[i] === b)) {
      return null;
    }

    const path = `${userId}/${resourceId}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: `image/${match[1]}`,
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Upload failed:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[Storage] Upload error:', err);
    return null;
  }
}

/**
 * Delete a photo from Supabase Storage.
 */
export async function deletePhotoFromStorage(
  supabase: SupabaseClient,
  userId: string,
  resourceId: string,
): Promise<void> {
  try {
    // Try common extensions
    const paths = ['webp', 'jpg', 'png'].map(
      (ext) => `${userId}/${resourceId}.${ext}`,
    );
    await supabase.storage.from(BUCKET).remove(paths);
  } catch {
    // Non-critical — ignore
  }
}
