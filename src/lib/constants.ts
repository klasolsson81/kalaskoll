// App-wide constants

export const APP_NAME = 'KalasKoll';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AI === 'true';

// Under utveckling: använd alltid samma test-token
export const TEST_INVITATION_TOKEN = 'test1234';
export const TEST_RSVP_URL = `${APP_URL}/r/${TEST_INVITATION_TOKEN}`;

// Email
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KalasKoll <noreply@kalaskoll.se>';

// SMS (46elks)
export const SMS_SENDER_ID = 'KalasKoll';
export const SMS_MAX_PER_PARTY = 15;

// AI image generation
export const AI_MAX_IMAGES_PER_PARTY = 5;

// Admin emails – bypass all SMS limits
export const ADMIN_EMAILS = ['klasolsson81@gmail.com', 'zeback_@hotmail.com'];

// Swedish allergies commonly found at children's parties
export const COMMON_ALLERGIES = [
  'Laktos',
  'Gluten',
  'Nötter',
  'Ägg',
  'Mjölkprotein',
  'Soja',
  'Fisk',
  'Skaldjur',
] as const;

// Child photo on invitation
export const PHOTO_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before resize
export const PHOTO_OUTPUT_SIZE = 400;
export const PHOTO_QUALITY = 0.85;
export const PHOTO_MAX_DATA_URL_SIZE = 100_000; // ~100KB safety limit
export const PHOTO_CROP_SIZE = 300; // Viewport size in crop dialog
export const VALID_PHOTO_FRAMES = ['circle', 'star', 'heart', 'diamond'] as const;
export type PhotoFrame = (typeof VALID_PHOTO_FRAMES)[number];

// AI image styles
export const AI_STYLES = [
  { value: 'cartoon', label: 'Tecknat', emoji: '🖍️' },
  { value: '3d', label: '3D-render', emoji: '🎮' },
  { value: 'watercolor', label: 'Akvarell', emoji: '🎨' },
  { value: 'photorealistic', label: 'Fotorealistisk', emoji: '📸' },
] as const;

export type AiStyle = (typeof AI_STYLES)[number]['value'];

// Party themes
export const PARTY_THEMES = [
  { value: 'dinosaurier', label: 'Dinosaurier' },
  { value: 'prinsessor', label: 'Prinsessor' },
  { value: 'superhjältar', label: 'Superhjältar' },
  { value: 'fotboll', label: 'Fotboll' },
  { value: 'rymden', label: 'Rymden' },
  { value: 'djungel', label: 'Djungel' },
  { value: 'enhörningar', label: 'Enhörningar' },
  { value: 'pirater', label: 'Pirater' },
] as const;
