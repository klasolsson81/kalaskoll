'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        AI-kort
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Guldkalas
        </span>
      </h3>

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
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-muted hover:border-blue-300',
                selecting === img.id && 'opacity-50',
              )}
            >
              <Image
                src={img.imageUrl}
                alt="AI-inbjudningsbild"
                fill
                className="object-cover"
                sizes="128px"
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                    ✓
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {/* Generate new AI image button */}
        {canGenerate && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground disabled:opacity-50"
          >
            {generating ? (
              <span className="text-[10px]">Genererar...</span>
            ) : (
              <>
                <span className="text-lg">+</span>
                <span className="text-[10px]">Ny AI-bild</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Counter / upgrade text */}
      <div className="mt-2">
        {isAdmin ? (
          <p className="text-xs text-amber-600">
            Superadmin — inga begränsningar
          </p>
        ) : remainingCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            Genereringar kvar: {remainingCount}/{maxImages}
          </p>
        ) : (
          <p className="text-xs text-amber-600">
            Uppgradera till Guldkalas för fler AI-genereringar
          </p>
        )}
      </div>
    </div>
  );
}
