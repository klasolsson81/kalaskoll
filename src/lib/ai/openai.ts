import { MOCK_MODE } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { buildPrompt } from './prompts';

/**
 * Fallback image generation via OpenAI DALL-E 3.
 * Used if fal.ai fails.
 */
export async function generateInvitationImageFallback(
  theme: string,
  style: AiStyle,
  options?: { forceLive?: boolean },
): Promise<string> {
  if (MOCK_MODE && !options?.forceLive) {
    console.log('[MOCK] OpenAI fallback - returning placeholder');
    return '/mock/invitation-default.svg';
  }

  const prompt = buildPrompt(style, theme);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}
