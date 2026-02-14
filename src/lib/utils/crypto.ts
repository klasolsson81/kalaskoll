import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ALLERGY_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ALLERGY_ENCRYPTION_KEY is not configured');
  }
  // Key must be 32 bytes (256 bits) for AES-256
  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) {
    throw new Error('ALLERGY_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  }
  return buf;
}

/**
 * Encrypt a string using AES-256-GCM.
 * Returns a base64 string containing: IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Pack: IV (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt a base64 string produced by encrypt().
 * Returns the original plaintext.
 */
export function decrypt(packed: string): string {
  const key = getKey();
  const buf = Buffer.from(packed, 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

/**
 * Encrypt allergy data (JSON array + optional text).
 * Returns encrypted versions safe for database storage.
 * Falls back to plaintext if encryption key is not configured.
 */
export function encryptAllergyData(
  allergies: string[],
  otherDietary: string | null,
): { allergies_enc: string; other_dietary_enc: string | null } {
  try {
    return {
      allergies_enc: encrypt(JSON.stringify(allergies)),
      other_dietary_enc: otherDietary ? encrypt(otherDietary) : null,
    };
  } catch {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ALLERGY_ENCRYPTION_KEY is required in production');
    }
    // Fallback: store unencrypted if key not configured (dev/test)
    console.warn('[Crypto] Encryption key not configured, storing allergy data unencrypted');
    return {
      allergies_enc: JSON.stringify(allergies),
      other_dietary_enc: otherDietary,
    };
  }
}

/**
 * Decrypt allergy data from database.
 * Falls back to parsing as plaintext if decryption fails (migration period).
 */
export function decryptAllergyData(
  allergiesEnc: unknown,
  otherDietaryEnc: string | null,
): { allergies: string[]; other_dietary: string | null } {
  // Handle JSONB arrays (legacy unencrypted data)
  if (Array.isArray(allergiesEnc)) {
    return { allergies: allergiesEnc as string[], other_dietary: otherDietaryEnc };
  }

  try {
    const allergiesStr = typeof allergiesEnc === 'string' ? allergiesEnc : JSON.stringify(allergiesEnc);
    const decryptedAllergies = decrypt(allergiesStr);
    return {
      allergies: JSON.parse(decryptedAllergies) as string[],
      other_dietary: otherDietaryEnc ? decrypt(otherDietaryEnc) : null,
    };
  } catch (decryptErr) {
    console.error('[Crypto] Decryption failed, trying plaintext fallback:', decryptErr);
    // Fallback: try parsing as plain JSON (legacy data)
    try {
      const parsed = typeof allergiesEnc === 'string' ? JSON.parse(allergiesEnc) : allergiesEnc;
      return {
        allergies: Array.isArray(parsed) ? (parsed as string[]) : [],
        other_dietary: otherDietaryEnc,
      };
    } catch {
      console.error('[Crypto] Plaintext fallback also failed — returning empty');
      return { allergies: [], other_dietary: otherDietaryEnc };
    }
  }
}
