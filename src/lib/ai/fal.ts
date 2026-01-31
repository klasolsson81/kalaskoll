import { fal } from '@fal-ai/client';
import { MOCK_MODE } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { buildPrompt } from './prompts';

// Configure fal.ai with server-side API key
fal.config({
  credentials: () => process.env.FAL_KEY ?? '',
});

const MOCK_IMAGES: Record<string, string> = {
  dinosaurier: '/mock/invitation-dino.svg',
  prinsessor: '/mock/invitation-princess.svg',
  'superhjältar': '/mock/invitation-superhero.svg',
  fotboll: '/mock/invitation-football.svg',
  default: '/mock/invitation-default.svg',
};

interface GenerateWithFalOptions {
  theme: string;
  style: AiStyle;
  forceLive?: boolean;
}

export async function generateWithFal({
  theme,
  style,
  forceLive,
}: GenerateWithFalOptions): Promise<string> {
  if (MOCK_MODE && !forceLive) {
    console.log('[MOCK] fal.ai — returning placeholder for theme:', theme);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_IMAGES[theme] || MOCK_IMAGES.default;
  }

  const prompt = buildPrompt(style, theme);

  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt,
      image_size: { width: 768, height: 1024 },
      num_images: 1,
      num_inference_steps: 4,
      enable_safety_checker: true,
    },
  });

  const images = result.data?.images;
  if (!images || images.length === 0) {
    throw new Error('fal.ai returned no images');
  }

  return images[0].url;
}
