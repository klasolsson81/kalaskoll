'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const GENERATING_MESSAGES = [
  'Förbereder...',
  'AI skapar din bild...',
  'Snart klar...',
  'Bara lite till...',
];

interface GeneratedPreview {
  imageUrl: string;
  imageId: string;
}

interface AiGeneratingModalProps {
  generating: boolean;
  generatedPreview: GeneratedPreview | null;
  onAccept: () => void;
  onDismiss: () => void;
}

function RotatingMessage({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <p className="text-sm font-medium text-amber-700 transition-opacity duration-500">
      {GENERATING_MESSAGES[index]}
    </p>
  );
}

export function AiGeneratingModal({
  generating,
  generatedPreview,
  onAccept,
  onDismiss,
}: AiGeneratingModalProps) {
  if (!generating && !generatedPreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md">
        {generating && !generatedPreview ? (
          /* Generating state */
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" style={{ animationDuration: '2s' }} />
                {/* Inner pulsing sparkle */}
                <span className="animate-pulse text-4xl">✨</span>
              </div>
              <h2 className="text-lg font-bold text-amber-900 font-display">
                Skapar din AI-bild
              </h2>
              <RotatingMessage active={generating} />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : generatedPreview ? (
          /* Preview state */
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-lg font-bold text-amber-900 font-display">
                Din AI-bild är klar!
              </h2>

              {/* Image preview */}
              <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl border-2 border-amber-200 shadow-md">
                <Image
                  src={generatedPreview.imageUrl}
                  alt="Genererad AI-bild"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </div>

              {/* Action buttons */}
              <div className="flex w-full flex-col gap-2">
                <Button
                  onClick={onAccept}
                  className="w-full h-12 text-base font-semibold gradient-celebration text-white shadow-warm"
                  size="lg"
                >
                  Använd bilden
                </Button>
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  className="w-full h-10 border-amber-200 text-amber-800 hover:bg-amber-50"
                >
                  Spara till biblioteket
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
