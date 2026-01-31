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
  customPrompt?: string;
  forceLive?: boolean;
}

export async function generateWithReplicate({
  theme,
  style,
  customPrompt,
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

  const prompt = buildPrompt({ style, theme, customPrompt });

  const output = await replicate.run('black-forest-labs/flux-dev', {
    input: {
      prompt,
      aspect_ratio: '3:4',
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 90,
      guidance_scale: 3.5,
      num_inference_steps: 28,
    },
  });

  // SDK v1+ returns FileOutput objects (ReadableStream with .url())
  // Extract the URL string from the first output
  const items = output as unknown[];
  if (!items || items.length === 0) {
    throw new Error('Replicate returned no images');
  }

  const first = items[0];
  let tempUrl: string;

  if (typeof first === 'string') {
    tempUrl = first;
  } else if (first && typeof first === 'object' && 'url' in first) {
    // FileOutput object — .url() returns a URL object
    const urlResult = (first as { url: () => URL }).url();
    tempUrl = urlResult.href;
  } else {
    // Fallback: try String() conversion
    tempUrl = String(first);
  }

  if (!tempUrl || !tempUrl.startsWith('http')) {
    throw new Error('Replicate returned invalid URL');
  }

  return tempUrl;
}
