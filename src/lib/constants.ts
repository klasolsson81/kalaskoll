// App-wide constants

export const APP_NAME = 'KalasFix';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AI === 'true';

// Under utveckling: använd alltid samma test-token
export const TEST_INVITATION_TOKEN = 'test1234';
export const TEST_RSVP_URL = `${APP_URL}/r/${TEST_INVITATION_TOKEN}`;

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
