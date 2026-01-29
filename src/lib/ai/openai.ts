import { MOCK_MODE } from '@/lib/constants';
import type { PartyDetails } from '@/types';

/**
 * Fallback image generation via OpenAI DALL-E.
 * Only used if Ideogram fails.
 */
export async function generateInvitationImageFallback(
  theme: string,
  _partyDetails: PartyDetails,
): Promise<string> {
  if (MOCK_MODE) {
    console.log('[MOCK] OpenAI fallback - returning placeholder');
    return '/mock/invitation-default.jpg';
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `Children's birthday party invitation card, ${theme} theme, colorful, festive, high quality illustration`,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}
