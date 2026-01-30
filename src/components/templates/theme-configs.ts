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
  default: {
    id: 'default',
    label: 'Klassiskt kalas',
    bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    patternStyle: {
      backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.15) 1px, transparent 1px)',
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

  dinosaurier: {
    id: 'dinosaurier',
    label: 'Dinosaurier',
    bgGradient: 'bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50',
    patternStyle: {
      backgroundImage: 'radial-gradient(ellipse, rgba(34,197,94,0.1) 2px, transparent 2px)',
      backgroundSize: '30px 30px',
    },
    headlineColor: 'text-green-800',
    subtitleColor: 'text-lime-600',
    detailColor: 'text-green-900',
    accentBorder: 'border-green-300',
    emoji: '🦕🌿🦖🌿🦕',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-green-500 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  prinsessor: {
    id: 'prinsessor',
    label: 'Prinsessor',
    bgGradient: 'bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50',
    patternStyle: {
      backgroundImage: 'radial-gradient(circle, rgba(236,72,153,0.1) 1px, transparent 1px), radial-gradient(circle, rgba(168,85,247,0.08) 1px, transparent 1px)',
      backgroundSize: '24px 24px, 36px 36px',
      backgroundPosition: '0 0, 12px 12px',
    },
    headlineColor: 'text-fuchsia-800',
    subtitleColor: 'text-pink-500',
    detailColor: 'text-fuchsia-900',
    accentBorder: 'border-pink-300',
    emoji: '👑✨🏰✨👑',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-fuchsia-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  superhjältar: {
    id: 'superhjältar',
    label: 'Superhjältar',
    bgGradient: 'bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50',
    patternStyle: {
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.05) 0px, rgba(239,68,68,0.05) 2px, transparent 2px, transparent 20px)',
      backgroundSize: '28px 28px',
    },
    headlineColor: 'text-red-700',
    subtitleColor: 'text-blue-600',
    detailColor: 'text-gray-800',
    accentBorder: 'border-red-300',
    emoji: '⚡💥⭐💥⚡',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight uppercase',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-red-500 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  fotboll: {
    id: 'fotboll',
    label: 'Fotboll',
    bgGradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    patternStyle: {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,197,94,0.08) 0px, rgba(34,197,94,0.08) 1px, transparent 1px, transparent 24px)',
      backgroundSize: '100% 24px',
    },
    headlineColor: 'text-green-800',
    subtitleColor: 'text-emerald-600',
    detailColor: 'text-green-900',
    accentBorder: 'border-emerald-300',
    emoji: '⚽🏆⚽🏆⚽',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-emerald-500 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  rymden: {
    id: 'rymden',
    label: 'Rymden',
    bgGradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900',
    patternStyle: {
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
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

  djungel: {
    id: 'djungel',
    label: 'Djungel',
    bgGradient: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100',
    patternStyle: {
      backgroundImage: 'radial-gradient(ellipse 60% 40%, rgba(20,184,166,0.1) 0%, transparent 70%)',
      backgroundSize: '50px 50px',
    },
    headlineColor: 'text-emerald-800',
    subtitleColor: 'text-teal-600',
    detailColor: 'text-emerald-900',
    accentBorder: 'border-teal-300',
    emoji: '🦁🌴🐒🌴🦁',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-teal-500 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  enhörningar: {
    id: 'enhörningar',
    label: 'Enhörningar',
    bgGradient: 'bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50',
    patternStyle: {
      backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.1) 1px, transparent 1px), radial-gradient(circle, rgba(236,72,153,0.07) 1.5px, transparent 1.5px)',
      backgroundSize: '22px 22px, 44px 44px',
      backgroundPosition: '0 0, 11px 11px',
    },
    headlineColor: 'text-purple-700',
    subtitleColor: 'text-pink-500',
    detailColor: 'text-purple-900',
    accentBorder: 'border-purple-300',
    emoji: '🦄🌈✨🌈🦄',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-purple-400 rounded-2xl',
    qrBgClass: 'bg-white',
  },

  pirater: {
    id: 'pirater',
    label: 'Pirater',
    bgGradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-sky-50',
    patternStyle: {
      backgroundImage: 'repeating-linear-gradient(135deg, rgba(180,83,9,0.05) 0px, rgba(180,83,9,0.05) 2px, transparent 2px, transparent 16px)',
      backgroundSize: '22px 22px',
    },
    headlineColor: 'text-amber-900',
    subtitleColor: 'text-amber-700',
    detailColor: 'text-amber-950',
    accentBorder: 'border-amber-400',
    emoji: '🏴‍☠️💎🗺️💎🏴‍☠️',
    headlineClass: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    subtitleClass: 'text-lg sm:text-xl italic font-medium',
    borderClass: 'border-4 border-amber-600 rounded-2xl',
    qrBgClass: 'bg-white',
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATE_THEMES);

export function getThemeConfig(templateId: string): TemplateThemeConfig {
  return TEMPLATE_THEMES[templateId] ?? TEMPLATE_THEMES.default;
}
