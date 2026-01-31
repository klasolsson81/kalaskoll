import { z } from 'zod';
import { MOCK_MODE } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { buildPrompt } from './prompts';

const openAiImageResponseSchema = z.object({
  data: z.array(z.object({ url: z.string().url() })).min(1),
});

/**
 * Fallback image generation via OpenAI DALL-E 3.
 * Used if Replicate fails.
 */
export async function generateInvitationImageFallback(
  theme: string,
  style: AiStyle,
  options?: { customPrompt?: string; forceLive?: boolean },
): Promise<string> {
  if (MOCK_MODE && !options?.forceLive) {
    console.log('[MOCK] OpenAI fallback - returning placeholder');
    return '/mock/invitation-default.svg';
  }

  const prompt = buildPrompt({ style, theme, customPrompt: options?.customPrompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/images/generations', {
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
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = openAiImageResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Unexpected OpenAI API response format');
  }
  return parsed.data.data[0].url;
}
