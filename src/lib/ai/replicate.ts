import Replicate from 'replicate';
import { MOCK_MODE } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { buildPrompt } from './prompts';

const MOCK_IMAGES: Record<string, string> = {
  dinosaurier: '/mock/invitation-dino.svg',
  prinsessor: '/mock/invitation-princess.svg',
  'superhjältar': '/mock/invitation-superhero.svg',
  fotboll: '/mock/invitation-football.svg',
  default: '/mock/invitation-default.svg',
};

interface GenerateWithReplicateOptions {
  theme: string;
  style: AiStyle;
  forceLive?: boolean;
}

export async function generateWithReplicate({
  theme,
  style,
  forceLive,
}: GenerateWithReplicateOptions): Promise<string> {
  if (MOCK_MODE && !forceLive) {
    console.log('[MOCK] Replicate — returning placeholder for theme:', theme);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_IMAGES[theme] || MOCK_IMAGES.default;
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompt = buildPrompt(style, theme);

  const output = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      aspect_ratio: '3:4',
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 90,
    },
  });

  // Flux Schnell returns an array of file URLs
  const urls = output as string[];
  if (!urls || urls.length === 0) {
    throw new Error('Replicate returned no images');
  }

  return urls[0];
}
