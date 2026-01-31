'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AI_STYLES } from '@/lib/constants';
import type { AiStyle } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AiGenerateDialogProps {
  theme: string | null;
  generating: boolean;
  onGenerate: (style: AiStyle) => void;
  onCancel: () => void;
}

export function AiGenerateDialog({
  theme,
  generating,
  onGenerate,
  onCancel,
}: AiGenerateDialogProps) {
  const [selectedStyle, setSelectedStyle] = useState<AiStyle>('cartoon');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Skapa AI-bild</h3>
        <p className="mt-1 text-sm text-gray-600">
          Välj stil för din inbjudan
        </p>
        {theme && theme !== 'default' && (
          <p className="mt-1 text-xs text-amber-700">
            Tema: <span className="font-medium capitalize">{theme}</span>
          </p>
        )}

        {/* Style grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {AI_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={generating}
              onClick={() => setSelectedStyle(s.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-4 transition-all',
                selectedStyle === s.value
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/40'
                  : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50',
                generating && 'opacity-50',
              )}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-sm font-medium text-gray-900">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
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
            onClick={() => onGenerate(selectedStyle)}
            disabled={generating}
          >
            {generating ? 'Genererar...' : 'Skapa bild ✨'}
          </Button>
        </div>
      </div>
    </div>
  );
}
