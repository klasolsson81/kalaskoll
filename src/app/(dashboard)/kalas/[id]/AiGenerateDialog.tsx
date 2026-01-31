'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AI_STYLES, PARTY_THEMES } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { cn } from '@/lib/utils';

const AI_MOTIFS = [
  { value: 'default', label: 'Ballonger & konfetti' },
  ...PARTY_THEMES,
  { value: 'cirkus', label: 'Cirkus' },
  { value: 'safari', label: 'Safari' },
  { value: 'blommor', label: 'Blommor' },
  { value: 'regnbåge', label: 'Regnbåge' },
  { value: '_custom', label: 'Eget tema...' },
] as const;

const BLOCKED_WORDS = [
  // Våld (sv + en)
  'vapen', 'pistol', 'gevär', 'kniv', 'blod', 'krig', 'mord', 'döda', 'skjut',
  'weapon', 'gun', 'knife', 'blood', 'kill', 'murder', 'violence', 'war', 'gore', 'dead',
  // Sexuellt
  'sex', 'porr', 'naken', 'bröst', 'xxx', 'nsfw', 'nude', 'naked', 'porn', 'erotic', 'hentai',
  // Droger
  'narkotika', 'kokain', 'heroin', 'cannabis', 'crack', 'meth', 'drug',
  // Hat
  'rasism', 'nazism', 'hitler', 'terrorist', 'hate',
];

function validateThemeInput(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Skriv minst 2 tecken' };
  }
  if (trimmed.length > 80) {
    return { valid: false, error: 'Max 80 tecken' };
  }
  const lower = trimmed.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      return { valid: false, error: 'Temat innehåller otillåtet innehåll' };
    }
  }
  return { valid: true };
}

export interface AiGenerateOptions {
  style: AiStyle;
  theme: string;
  customPrompt: string;
}

interface AiGenerateDialogProps {
  partyTheme: string | null;
  generating: boolean;
  onGenerate: (options: AiGenerateOptions) => void;
  onCancel: () => void;
}

export function AiGenerateDialog({
  partyTheme,
  generating,
  onGenerate,
  onCancel,
}: AiGenerateDialogProps) {
  const defaultMotif = partyTheme && partyTheme !== 'default' ? partyTheme : 'default';
  const [selectedStyle, setSelectedStyle] = useState<AiStyle>('cartoon');
  const [selectedMotif, setSelectedMotif] = useState(defaultMotif);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [themeError, setThemeError] = useState<string | null>(null);

  const isCustom = selectedMotif === '_custom';
  const customValidation = isCustom ? validateThemeInput(customTheme) : { valid: true };
  const canSubmit = !generating && (!isCustom || (customTheme.trim().length > 0 && customValidation.valid));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Skapa AI-bild</h3>
        <p className="mt-1 text-sm text-gray-600">
          Designa din inbjudningsbild
        </p>

        {/* 1. Style */}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Stil
        </label>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {AI_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={generating}
              onClick={() => setSelectedStyle(s.value)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border-2 px-1 py-2 transition-all',
                selectedStyle === s.value
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                  : 'border-gray-200 hover:border-amber-300',
                generating && 'opacity-50',
              )}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-[10px] font-medium text-gray-800">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* 2. Motif/Theme */}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Motiv
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {AI_MOTIFS.map((m) => (
            <button
              key={m.value}
              type="button"
              disabled={generating}
              onClick={() => setSelectedMotif(m.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                selectedMotif === m.value
                  ? 'border-amber-500 bg-amber-100 text-amber-900'
                  : 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50',
                generating && 'opacity-50',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 2b. Custom theme text input */}
        {isCustom && (
          <div className="mt-2">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => {
                setCustomTheme(e.target.value);
                const result = validateThemeInput(e.target.value);
                setThemeError(e.target.value.trim().length > 0 && !result.valid ? (result.error ?? null) : null);
              }}
              disabled={generating}
              placeholder="T.ex. vikingaskepp, pokemon, bondgård..."
              maxLength={80}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50',
                themeError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-400/30'
                  : 'border-gray-200 focus:border-amber-400 focus:ring-amber-400/30',
              )}
            />
            {themeError && (
              <p className="mt-1 text-xs text-red-600">{themeError}</p>
            )}
            <p className="mt-0.5 text-right text-[10px] text-gray-400">
              {customTheme.length}/80
            </p>
          </div>
        )}

        {/* 3. Custom description */}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Beskriv din bild <span className="font-normal normal-case text-gray-400">(valfritt)</span>
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          disabled={generating}
          placeholder='T.ex. "en enhörning som flyger över en regnbåge med glitter"'
          maxLength={200}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:opacity-50"
        />
        <p className="mt-0.5 text-right text-[10px] text-gray-400">
          {customPrompt.length}/200
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={generating}
          >
            Avbryt
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 font-semibold text-white hover:from-amber-600 hover:to-yellow-600"
            onClick={() =>
              onGenerate({
                style: selectedStyle,
                theme: isCustom ? customTheme.trim() : selectedMotif,
                customPrompt: customPrompt.trim(),
              })
            }
            disabled={!canSubmit}
          >
            {generating ? 'Genererar...' : 'Skapa bild ✨'}
          </Button>
        </div>
      </div>
    </div>
  );
}
