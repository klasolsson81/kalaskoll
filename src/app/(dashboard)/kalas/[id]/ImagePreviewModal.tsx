'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PreviewImage {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

interface ImagePreviewModalProps {
  images: PreviewImage[];
  initialIndex: number;
  onSelect: (imageId: string) => void;
  onClose: () => void;
  selecting: boolean;
}

export function ImagePreviewModal({
  images,
  initialIndex,
  onSelect,
  onClose,
  selecting,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.max(0, Math.min(images.length - 1, currentIndex));
  const current = images[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < images.length - 1;

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(images.length - 1, index)));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goTo(safeIndex - 1);
      else if (e.key === 'ArrowRight') goTo(safeIndex + 1);
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, goTo, onClose]);

  if (!current) return null;

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    const threshold = 50;
    if (touchDeltaX.current < -threshold && hasNext) {
      goTo(currentIndex + 1);
    } else if (touchDeltaX.current > threshold && hasPrev) {
      goTo(currentIndex - 1);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            {/* Header with close button */}
            <div className="flex w-full items-center justify-between">
              <h2 className="text-lg font-bold text-amber-900 font-display">
                Välj bild
                <span className="ml-2 text-sm font-normal text-amber-600">
                  {currentIndex + 1} / {images.length}
                </span>
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image carousel area */}
            <div
              className="relative w-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Main image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-amber-200 shadow-md">
                <Image
                  src={current.imageUrl}
                  alt={`Bild ${currentIndex + 1} av ${images.length}`}
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority
                />
                {current.isSelected && (
                  <div className="absolute top-3 right-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    Aktiv
                  </div>
                )}
              </div>

              {/* Arrow buttons (desktop) */}
              {hasPrev && (
                <button
                  onClick={() => goTo(currentIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-amber-700 shadow-md transition-colors hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={() => goTo(currentIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-amber-700 shadow-md transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-6 bg-amber-500'
                        : 'w-2 bg-amber-300 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-2">
              {current.isSelected ? (
                <Button
                  disabled
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Redan vald
                </Button>
              ) : (
                <Button
                  onClick={() => onSelect(current.id)}
                  disabled={selecting}
                  className="w-full h-12 text-base font-semibold gradient-celebration text-white shadow-warm"
                  size="lg"
                >
                  {selecting ? 'Väljer...' : 'Använd bilden'}
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-10 border-amber-200 text-amber-800 hover:bg-amber-50"
              >
                Avbryt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
