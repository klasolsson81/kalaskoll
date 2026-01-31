import type { CSSProperties } from 'react';

export interface TemplateThemeConfig {
  id: string;
  label: string;
  bgImage: string;
  bgGradient: string;
  patternStyle?: CSSProperties;
  headlineColor: string;
  subtitleColor: string;
  detailColor: string;
  accentBorder: string;
  textShadow?: string;
  emoji: string;
  headlineClass: string;
  subtitleClass: string;
  borderClass: string;
  qrBgClass: string;
}

export const TEMPLATE_THEMES: Record<string, TemplateThemeConfig> = {
  // 1. WARM AMBER — balloons, confetti, party hats
  default: {
    id: 'default',
    label: 'Klassiskt kalas',
    bgImage: '/assets/templates/default.png',
    bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    headlineColor: 'text-amber-800',
    subtitleColor: 'text-orange-600',
    detailColor: 'text-amber-900',
    accentBorder: 'border-amber-400/60',
    emoji: '🎈🎉🎈🎉🎈',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-amber-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 2. DINOSAURIER — jungle leaves, friendly dinos
  dinosaurier: {
    id: 'dinosaurier',
    label: 'Dinosaurier',
    bgImage: '/assets/templates/dinosaurier.png',
    bgGradient: 'bg-gradient-to-b from-lime-200 via-green-300 to-emerald-400',
    headlineColor: 'text-green-950',
    subtitleColor: 'text-green-800',
    detailColor: 'text-green-950',
    accentBorder: 'border-green-700/40',
    emoji: '🦕🌿🦖🌿🦕',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-green-700 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 3. PRINSESSOR — castle, roses, crowns, sparkle
  prinsessor: {
    id: 'prinsessor',
    label: 'Prinsessor',
    bgImage: '/assets/templates/prinsessor.png',
    bgGradient: 'bg-gradient-to-b from-pink-200 via-fuchsia-200 to-pink-300',
    headlineColor: 'text-fuchsia-900',
    subtitleColor: 'text-pink-700',
    detailColor: 'text-fuchsia-950',
    accentBorder: 'border-pink-400/60',
    emoji: '👑✨🏰✨👑',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-fuchsia-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 4. SUPERHJÄLTAR — comic-book burst, capes, masks
  superhjältar: {
    id: 'superhjältar',
    label: 'Superhjältar',
    bgImage: '/assets/templates/superhjaltar.png',
    bgGradient: 'bg-gradient-to-br from-red-500 via-yellow-400 to-blue-600',
    headlineColor: 'text-white',
    subtitleColor: 'text-yellow-100',
    detailColor: 'text-white',
    accentBorder: 'border-yellow-300/60',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
    emoji: '⚡💥⭐💥⚡',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight uppercase',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-yellow-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 5. FOTBOLL — pitch, trophies, balls, cleats
  fotboll: {
    id: 'fotboll',
    label: 'Fotboll',
    bgImage: '/assets/templates/fotboll.png',
    bgGradient: 'bg-gradient-to-b from-green-700 via-green-600 to-green-700',
    headlineColor: 'text-white',
    subtitleColor: 'text-green-100',
    detailColor: 'text-white',
    accentBorder: 'border-white/40',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
    emoji: '⚽🏆⚽🏆⚽',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-white/30 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 6. RYMDEN — planets, rocket, stars, moon
  rymden: {
    id: 'rymden',
    label: 'Rymden',
    bgImage: '/assets/templates/rymden.png',
    bgGradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
    headlineColor: 'text-yellow-300',
    subtitleColor: 'text-purple-200',
    detailColor: 'text-indigo-100',
    accentBorder: 'border-indigo-400/40',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
    emoji: '🚀🪐⭐🪐🚀',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-indigo-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 7. DJUNGEL — tropical leaves, lion, monkey, giraffe
  djungel: {
    id: 'djungel',
    label: 'Djungel',
    bgImage: '/assets/templates/djungel.png',
    bgGradient: 'bg-gradient-to-b from-teal-800 via-emerald-700 to-green-900',
    headlineColor: 'text-yellow-300',
    subtitleColor: 'text-emerald-200',
    detailColor: 'text-teal-100',
    accentBorder: 'border-yellow-500/40',
    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
    emoji: '🦁🌴🐒🌴🦁',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-yellow-600/40 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 8. ENHÖRNINGAR — rainbow, pastel clouds, unicorns
  enhörningar: {
    id: 'enhörningar',
    label: 'Enhörningar',
    bgImage: '/assets/templates/enhorningar.png',
    bgGradient: 'bg-gradient-to-br from-pink-300 via-violet-300 to-cyan-200',
    headlineColor: 'text-purple-900',
    subtitleColor: 'text-fuchsia-700',
    detailColor: 'text-purple-950',
    accentBorder: 'border-purple-300/60',
    emoji: '🦄🌈✨🌈🦄',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-purple-300 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 9. PIRATER — treasure map, ship, compass, chest
  pirater: {
    id: 'pirater',
    label: 'Pirater',
    bgImage: '/assets/templates/pirater.png',
    bgGradient: 'bg-gradient-to-b from-amber-900 via-yellow-900 to-amber-950',
    headlineColor: 'text-amber-900',
    subtitleColor: 'text-amber-700',
    detailColor: 'text-amber-800',
    accentBorder: 'border-amber-700/40',
    emoji: '🏴‍☠️💎🗺️💎🏴‍☠️',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-amber-700 rounded-2xl',
    qrBgClass: 'bg-white',
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATE_THEMES);

export function getThemeConfig(templateId: string): TemplateThemeConfig {
  return TEMPLATE_THEMES[templateId] ?? TEMPLATE_THEMES.default;
}
