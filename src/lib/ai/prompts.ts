import type { AiStyle } from '@/lib/constants';

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

export function buildPrompt({ style, theme, customPrompt }: BuildPromptOptions): string {
  const prefix = STYLE_PREFIX[style];
  const themeDesc = THEME_DESCRIPTION[theme] || THEME_DESCRIPTION.default;
  const quality = STYLE_QUALITY[style];

  const parts = [
    `${prefix} of a children's birthday party invitation background.`,
  ];

  if (customPrompt) {
    // Custom prompt is the PRIMARY instruction — theme is secondary context
    parts.push(
      `The scene MUST prominently show: ${customPrompt}.`,
      `Use these as supporting theme elements: ${themeDesc}.`,
    );
  } else {
    parts.push(`Featuring ${themeDesc}.`);
  }

  parts.push(
    'Leave the center area relatively clear for text overlay.',
    'No text, no letters, no numbers, no words anywhere in the image.',
    'Vertical portrait orientation.',
    'Joyful, festive, and child-friendly mood.',
    quality,
  );

  return parts.join(' ');
}
