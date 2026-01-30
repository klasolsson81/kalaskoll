import type { CSSProperties } from 'react';

export interface TemplateThemeConfig {
  id: string;
  label: string;
  bgGradient: string;
  patternStyle?: CSSProperties;
  headlineColor: string;
  subtitleColor: string;
  detailColor: string;
  accentBorder: string;
  emoji: string;
  headlineClass: string;
  subtitleClass: string;
  borderClass: string;
  qrBgClass: string;
}

export const TEMPLATE_THEMES: Record<string, TemplateThemeConfig> = {
  // 1. WARM AMBER — light festive gold with confetti dots
  default: {
    id: 'default',
    label: 'Klassiskt kalas',
    bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    patternStyle: {
      backgroundImage:
        'radial-gradient(circle, rgba(251,191,36,0.15) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
    headlineColor: 'text-amber-800',
    subtitleColor: 'text-orange-600',
    detailColor: 'text-amber-900',
    accentBorder: 'border-amber-300',
    emoji: '🎈🎉🎈🎉🎈',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-amber-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 2. MEDIUM GREEN — saturated lime-to-emerald with leaf veins
  dinosaurier: {
    id: 'dinosaurier',
    label: 'Dinosaurier',
    bgGradient: 'bg-gradient-to-b from-lime-200 via-green-300 to-emerald-400',
    patternStyle: {
      backgroundImage:
        'repeating-linear-gradient(160deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 18px)',
      backgroundSize: '18px 18px',
    },
    headlineColor: 'text-green-950',
    subtitleColor: 'text-green-800',
    detailColor: 'text-green-950',
    accentBorder: 'border-green-700/40',
    emoji: '🦕🌿🦖🌿🦕',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-green-700 rounded-2xl',
    qrBgClass: 'bg-white/90',
  },

  // 3. SATURATED PINK — rich pink/magenta with sparkle shimmer
  prinsessor: {
    id: 'prinsessor',
    label: 'Prinsessor',
    bgGradient: 'bg-gradient-to-b from-pink-200 via-fuchsia-200 to-pink-300',
    patternStyle: {
      backgroundImage:
        'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle, rgba(236,72,153,0.15) 1px, transparent 1px)',
      backgroundSize: '16px 16px, 32px 32px',
      backgroundPosition: '0 0, 8px 8px',
    },
    headlineColor: 'text-fuchsia-900',
    subtitleColor: 'text-pink-700',
    detailColor: 'text-fuchsia-950',
    accentBorder: 'border-pink-400',
    emoji: '👑✨🏰✨👑',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-fuchsia-400 rounded-2xl',
    qrBgClass: 'bg-white/90',
  },

  // 4. BOLD RED+BLUE — vivid comic-book gradient with action lines
  superhjältar: {
    id: 'superhjältar',
    label: 'Superhjältar',
    bgGradient: 'bg-gradient-to-br from-red-500 via-yellow-400 to-blue-600',
    patternStyle: {
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 4px, transparent 4px, transparent 20px)',
      backgroundSize: '28px 28px',
    },
    headlineColor: 'text-white',
    subtitleColor: 'text-yellow-100',
    detailColor: 'text-white',
    accentBorder: 'border-yellow-300',
    emoji: '⚡💥⭐💥⚡',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight uppercase',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-yellow-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 5. FOOTBALL PITCH GREEN — deep green field with pitch lines
  fotboll: {
    id: 'fotboll',
    label: 'Fotboll',
    bgGradient: 'bg-gradient-to-b from-green-700 via-green-600 to-green-700',
    patternStyle: {
      backgroundImage:
        'linear-gradient(to bottom, transparent 18%, rgba(255,255,255,0.12) 18%, rgba(255,255,255,0.12) 82%, transparent 82%), repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.04) 28px, rgba(255,255,255,0.04) 30px)',
      backgroundSize: '100% 100%, 100% 30px',
    },
    headlineColor: 'text-white',
    subtitleColor: 'text-green-100',
    detailColor: 'text-white',
    accentBorder: 'border-white/40',
    emoji: '⚽🏆⚽🏆⚽',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-white/30 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 6. DARK SPACE — deep indigo/purple with stars (keep as-is)
  rymden: {
    id: 'rymden',
    label: 'Rymden',
    bgGradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
    patternStyle: {
      backgroundImage:
        'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '40px 40px, 90px 90px',
      backgroundPosition: '0 0, 20px 30px',
    },
    headlineColor: 'text-yellow-300',
    subtitleColor: 'text-purple-300',
    detailColor: 'text-indigo-100',
    accentBorder: 'border-indigo-500',
    emoji: '🚀🪐⭐🪐🚀',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-indigo-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 7. DARK TROPICAL — deep teal/emerald with gold accents
  djungel: {
    id: 'djungel',
    label: 'Djungel',
    bgGradient: 'bg-gradient-to-b from-teal-800 via-emerald-700 to-green-900',
    patternStyle: {
      backgroundImage:
        'radial-gradient(ellipse 80% 60%, rgba(255,255,255,0.05) 0%, transparent 70%), radial-gradient(circle, rgba(255,255,255,0.06) 2px, transparent 2px)',
      backgroundSize: '80px 80px, 50px 50px',
      backgroundPosition: '0 0, 25px 25px',
    },
    headlineColor: 'text-yellow-300',
    subtitleColor: 'text-emerald-200',
    detailColor: 'text-teal-100',
    accentBorder: 'border-yellow-500/40',
    emoji: '🦁🌴🐒🌴🦁',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-yellow-600/40 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  // 8. RAINBOW PASTEL — multi-color gradient (pink→violet→cyan)
  enhörningar: {
    id: 'enhörningar',
    label: 'Enhörningar',
    bgGradient: 'bg-gradient-to-br from-pink-300 via-violet-300 to-cyan-200',
    patternStyle: {
      backgroundImage:
        'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
    },
    headlineColor: 'text-purple-900',
    subtitleColor: 'text-fuchsia-700',
    detailColor: 'text-purple-950',
    accentBorder: 'border-white/50',
    emoji: '🦄🌈✨🌈🦄',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-purple-300 rounded-2xl',
    qrBgClass: 'bg-white/90',
  },

  // 9. DARK BROWN/NAVY — old parchment treasure map feel
  pirater: {
    id: 'pirater',
    label: 'Pirater',
    bgGradient: 'bg-gradient-to-b from-amber-900 via-yellow-900 to-amber-950',
    patternStyle: {
      backgroundImage:
        'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 16px), radial-gradient(circle, rgba(255,200,100,0.08) 1px, transparent 1px)',
      backgroundSize: '22px 22px, 30px 30px',
    },
    headlineColor: 'text-amber-200',
    subtitleColor: 'text-yellow-400',
    detailColor: 'text-amber-100',
    accentBorder: 'border-amber-600',
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
