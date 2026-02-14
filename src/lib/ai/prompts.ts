import type { AiStyle } from '@/lib/constants';
import { chatCompletion } from './openai-chat';

const STYLE_PREFIX: Record<AiStyle, string> = {
  cartoon:
    'A flat colorful cartoon illustration in a friendly children\'s book style',
  '3d':
    'A Pixar-style 3D rendered scene with soft lighting and rounded shapes',
  watercolor:
    'A delicate watercolor painting with soft edges and pastel washes',
  photorealistic:
    'A photorealistic high-resolution photograph with vivid colors',
};

const THEME_DESCRIPTION: Record<string, string> = {
  dinosaurier:
    'friendly cartoon dinosaurs, jungle leaves, prehistoric volcanoes, tropical ferns',
  prinsessor:
    'a fairy-tale castle, roses, golden crowns, sparkling tiaras, pink ribbons',
  'superhjältar':
    'comic-book style superhero capes, lightning bolts, city skyline, action stars',
  fotboll:
    'a green football pitch, soccer balls, golden trophies, cheering crowd',
  rymden:
    'outer space with colorful planets, rockets, stars, nebulae, a smiling moon',
  djungel:
    'tropical jungle with parrots, monkeys, lush green vines, exotic flowers',
  'enhörningar':
    'magical unicorns, rainbow arcs, pastel clouds, glittering stars',
  pirater:
    'a pirate treasure map, wooden ship, compass rose, treasure chest, ocean waves',
  cirkus:
    'a colorful circus tent, acrobats, juggling balls, popcorn, carnival lights',
  safari:
    'African savanna with friendly lions, giraffes, elephants, acacia trees, sunset sky',
  blommor:
    'a lush garden with colorful wildflowers, butterflies, ladybugs, green meadow',
  'regnbåge':
    'a bright rainbow arching across a blue sky with fluffy clouds and sunshine',
  default:
    'colorful balloons, confetti, streamers, wrapped presents, party hats',
};

const STYLE_QUALITY: Record<AiStyle, string> = {
  cartoon: 'bold outlines, vibrant flat colors, clean vector-like shapes',
  '3d': 'subsurface scattering, ambient occlusion, depth of field',
  watercolor: 'visible brush strokes, paper texture, pigment bleeding',
  photorealistic: 'sharp focus, professional studio lighting, bokeh background',
};

interface BuildPromptOptions {
  style: AiStyle;
  theme: string;
  customPrompt?: string;
}

/**
 * Translate and enrich a custom prompt to English for better AI image results.
 * Uses GPT-4o-mini for fast, cheap translation. Falls back to original on failure.
 */
export async function enhanceCustomPrompt(prompt: string): Promise<string> {
  try {
    const result = await chatCompletion({
      systemPrompt:
        'You are an image prompt translator. Translate the user\'s image description from Swedish to English. ' +
        'Add specific visual details that help an image generation AI create an accurate result ' +
        '(e.g. for cities: mention famous landmarks, architecture, scenery). ' +
        'Keep it concise (max 2 sentences). Return ONLY the translated prompt, nothing else.',
      userMessage: prompt,
      maxTokens: 150,
    });
    return result.trim();
  } catch (err) {
    console.error('[AI] Prompt enhancement failed, using original:', err);
    return prompt;
  }
}

export function buildPrompt({ style, theme, customPrompt }: BuildPromptOptions): string {
  const prefix = STYLE_PREFIX[style];
  const themeDesc = THEME_DESCRIPTION[theme] || theme || THEME_DESCRIPTION.default;
  const quality = STYLE_QUALITY[style];

  const parts: string[] = [];

  if (customPrompt) {
    // Custom prompt: user's description is the PRIMARY subject
    // The style prefix already carries the visual feel (cartoon/3D/watercolor)
    parts.push(
      `${prefix} of: ${customPrompt}.`,
      'The image is for a children\'s birthday party invitation card.',
      'Leave the center area relatively clear for text overlay.',
    );
  } else {
    // No custom prompt: theme drives the image with full party context
    parts.push(
      `${prefix} of a children's birthday party invitation background.`,
      `Featuring ${themeDesc}.`,
      'Leave the center area relatively clear for text overlay.',
      'Joyful, festive, and child-friendly mood.',
    );
  }

  parts.push(
    'No text, no letters, no numbers, no words anywhere in the image.',
    'Vertical portrait orientation.',
    quality,
  );

  return parts.join(' ');
}
