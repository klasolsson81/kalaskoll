'use client';

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PreviewModalProps {
  itemCount: number;
  initialIndex: number;
  isSelected: (index: number) => boolean;
  renderItem: (index: number) => ReactNode;
  onSelect: (index: number) => void;
  onClose: () => void;
  selecting: boolean;
  title?: string;
}

export function ImagePreviewModal({
  itemCount,
  initialIndex,
  isSelected,
  renderItem,
  onSelect,
  onClose,
  selecting,
  title = 'Välj bild',
}: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const safeIndex = Math.max(0, Math.min(itemCount - 1, currentIndex));
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < itemCount - 1;
  const selected = isSelected(safeIndex);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(itemCount - 1, index)));
  }, [itemCount]);

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

  if (itemCount === 0) return null;

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
      goTo(safeIndex + 1);
    } else if (touchDeltaX.current > threshold && hasPrev) {
      goTo(safeIndex - 1);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 w-full max-w-sm">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-xl">
          <div className="flex flex-col items-center gap-3">
            {/* Header with close button */}
            <div className="flex w-full items-center justify-between">
              <h2 className="text-base font-bold text-amber-900 font-display">
                {title}
                <span className="ml-2 text-sm font-normal text-amber-600">
                  {safeIndex + 1} / {itemCount}
                </span>
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Carousel area */}
            <div
              className="relative w-full max-w-[280px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Content */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-amber-200 shadow-md">
                {renderItem(safeIndex)}
                {selected && (
                  <div className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                    Aktiv
                  </div>
                )}
              </div>

              {/* Arrow buttons (desktop) */}
              {hasPrev && (
                <button
                  onClick={() => goTo(safeIndex - 1)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-amber-700 shadow-md transition-colors hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={() => goTo(safeIndex + 1)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-amber-700 shadow-md transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Dot indicators */}
            {itemCount > 1 && (
              <div className="flex gap-1.5">
                {Array.from({ length: itemCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === safeIndex
                        ? 'w-5 bg-amber-500'
                        : 'w-2 bg-amber-300 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-2">
              {selected ? (
                <Button
                  disabled
                  className="w-full h-11 text-sm font-semibold"
                  size="lg"
                >
                  Redan vald
                </Button>
              ) : (
                <Button
                  onClick={() => onSelect(safeIndex)}
                  disabled={selecting}
                  className="w-full h-11 text-sm font-semibold gradient-celebration text-white shadow-warm"
                  size="lg"
                >
                  {selecting ? 'Väljer...' : 'Använd bilden'}
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-9 text-sm border-amber-200 text-amber-800 hover:bg-amber-50"
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
