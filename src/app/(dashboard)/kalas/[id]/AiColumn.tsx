'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const GENERATING_MESSAGES = [
  'Förbereder...',
  'AI skapar din bild...',
  'Snart klar...',
  'Bara lite till...',
];

function GeneratingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="mt-2 text-xs font-medium text-amber-700">
      {GENERATING_MESSAGES[index]}
    </p>
  );
}

interface PartyImage {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

interface AiColumnProps {
  images: PartyImage[];
  activeMode: 'template' | 'ai' | null;
  selecting: string | null;
  generating: boolean;
  canGenerate: boolean;
  isAdmin: boolean;
  maxImages: number;
  onSelectImage: (imageId: string) => void;
  onGenerate: () => void;
}

export function AiColumn({
  images,
  activeMode,
  selecting,
  generating,
  canGenerate,
  isAdmin,
  maxImages,
  onSelectImage,
  onGenerate,
}: AiColumnProps) {
  const remainingCount = maxImages - images.length;

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/80 to-amber-50/30 p-4">
      {/* Premium heading */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-xs">
          ✨
        </span>
        <h3 className="text-sm font-semibold text-amber-900">
          AI-kort
        </h3>
        <span className="rounded-full border border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 shadow-sm">
          Guldkalas
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* AI image thumbnails */}
        {images.map((img) => {
          const isSelected = activeMode === 'ai' && img.isSelected;
          return (
            <button
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              disabled={selecting !== null}
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-400/40'
                  : 'border-amber-200 hover:border-amber-400',
                selecting === img.id && 'opacity-50',
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="text-2xl">🖼️</span>
              </div>
              <Image
                src={img.imageUrl}
                alt="AI-inbjudningsbild"
                fill
                className="object-cover"
                sizes="128px"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20">
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    ✓
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {/* Generate new AI image button / loading shimmer */}
        {generating ? (
          <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 animate-pulse">
            <span className="text-2xl">✨</span>
            <GeneratingText />
          </div>
        ) : canGenerate ? (
          <button
            onClick={onGenerate}
            className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-300 text-amber-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800"
          >
            <span className="text-lg">+</span>
            <span className="text-[10px] font-medium">Ny AI-bild</span>
          </button>
        ) : null}
      </div>

      {/* Counter / upgrade text */}
      <div className="mt-3 border-t border-amber-200/60 pt-2">
        {isAdmin ? (
          <p className="text-xs font-medium text-amber-700">
            Superadmin — inga begränsningar
          </p>
        ) : remainingCount > 0 ? (
          <p className="text-xs text-amber-700">
            Genereringar kvar: <span className="font-semibold">{remainingCount}/{maxImages}</span>
          </p>
        ) : (
          <p className="text-xs font-medium text-amber-700">
            Uppgradera till Guldkalas för fler AI-genereringar
          </p>
        )}
      </div>
    </div>
  );
}
