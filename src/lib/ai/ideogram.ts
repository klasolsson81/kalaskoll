import { MOCK_MODE } from '@/lib/constants';
import type { PartyDetails } from '@/types';

const MOCK_IMAGES: Record<string, string> = {
  dinosaurier: '/mock/invitation-dino.svg',
  prinsessor: '/mock/invitation-princess.svg',
  superhjältar: '/mock/invitation-superhero.svg',
  fotboll: '/mock/invitation-football.svg',
  default: '/mock/invitation-default.svg',
};

export async function generateInvitationImage(
  theme: string,
  _partyDetails: PartyDetails,
  options?: { forceLive?: boolean },
): Promise<string> {
  if (MOCK_MODE && !options?.forceLive) {
    console.log('[MOCK] Returning placeholder image for theme:', theme);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_IMAGES[theme] || MOCK_IMAGES.default;
  }

  // Production: call Ideogram API
  const response = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': process.env.IDEOGRAM_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt: `Children's birthday party invitation card, ${theme} theme, colorful, festive, Swedish text, high quality illustration`,
        model: 'V_2',
        magic_prompt_option: 'AUTO',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ideogram API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}
