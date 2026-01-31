import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { randomBytes } from 'crypto';

// Generate a test key
const TEST_KEY = randomBytes(32).toString('base64');

describe('crypto utils', () => {
  beforeAll(() => {
    vi.stubEnv('ALLERGY_ENCRYPTION_KEY', TEST_KEY);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('encrypt and decrypt round-trips correctly', async () => {
    // Dynamic import to pick up env var
    const { encrypt, decrypt } = await import('@/lib/utils/crypto');
    const plaintext = 'Hello, World!';
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // base64
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('encrypt produces different ciphertext for same plaintext (random IV)', async () => {
    const { encrypt } = await import('@/lib/utils/crypto');
    const plaintext = 'same data';
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);
    expect(enc1).not.toBe(enc2);
  });

  it('encryptAllergyData encrypts arrays and strings', async () => {
    const { encryptAllergyData, decryptAllergyData } = await import('@/lib/utils/crypto');
    const allergies = ['laktos', 'gluten', 'nötter'];
    const other = 'vegetarian';

    const encrypted = encryptAllergyData(allergies, other);
    expect(encrypted.allergies_enc).not.toContain('laktos');
    expect(encrypted.other_dietary_enc).not.toContain('vegetarian');

    const decrypted = decryptAllergyData(encrypted.allergies_enc, encrypted.other_dietary_enc);
    expect(decrypted.allergies).toEqual(allergies);
    expect(decrypted.other_dietary).toBe(other);
  });

  it('encryptAllergyData handles null other_dietary', async () => {
    const { encryptAllergyData, decryptAllergyData } = await import('@/lib/utils/crypto');
    const encrypted = encryptAllergyData(['gluten'], null);
    expect(encrypted.other_dietary_enc).toBeNull();

    const decrypted = decryptAllergyData(encrypted.allergies_enc, null);
    expect(decrypted.other_dietary).toBeNull();
  });

  it('decryptAllergyData handles legacy array data', async () => {
    const { decryptAllergyData } = await import('@/lib/utils/crypto');
    // Legacy: stored as JSONB array (not encrypted)
    const legacyAllergies = ['laktos', 'ägg'];
    const result = decryptAllergyData(legacyAllergies, 'vegan');
    expect(result.allergies).toEqual(legacyAllergies);
    expect(result.other_dietary).toBe('vegan');
  });

  it('decryptAllergyData handles legacy JSON string data', async () => {
    const { decryptAllergyData } = await import('@/lib/utils/crypto');
    const legacyJson = JSON.stringify(['gluten']);
    const result = decryptAllergyData(legacyJson, null);
    expect(result.allergies).toEqual(['gluten']);
  });
});

describe('crypto utils without key', () => {
  beforeAll(() => {
    vi.stubEnv('ALLERGY_ENCRYPTION_KEY', '');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('encryptAllergyData falls back to plaintext when key missing', async () => {
    // Re-import to pick up empty env
    const mod = await import('@/lib/utils/crypto');
    const result = mod.encryptAllergyData(['laktos'], 'vegan');
    // Should be plain JSON (fallback)
    expect(result.allergies_enc).toBe('["laktos"]');
    expect(result.other_dietary_enc).toBe('vegan');
  });
});
