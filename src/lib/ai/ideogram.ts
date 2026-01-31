import { MOCK_MODE } from '@/lib/constants';

const MOCK_IMAGES: Record<string, string> = {
  dinosaurier: '/mock/invitation-dino.svg',
  prinsessor: '/mock/invitation-princess.svg',
  'superhjältar': '/mock/invitation-superhero.svg',
  fotboll: '/mock/invitation-football.svg',
  default: '/mock/invitation-default.svg',
};

/**
 * @deprecated Use generateWithFal() from fal.ts instead.
 * Kept for backwards compatibility — only returns mock images.
 */
export async function generateInvitationImage(
  theme: string,
  options?: { forceLive?: boolean },
): Promise<string> {
  if (MOCK_MODE && !options?.forceLive) {
    console.log('[MOCK] Returning placeholder image for theme:', theme);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_IMAGES[theme] || MOCK_IMAGES.default;
  }

  // Deprecated: no longer calls Ideogram API
  // Fall through to let the caller try the next provider
  throw new Error('Ideogram API deprecated — use fal.ai instead');
}
