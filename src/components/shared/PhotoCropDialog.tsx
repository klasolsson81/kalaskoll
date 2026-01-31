'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  PHOTO_OUTPUT_SIZE,
  PHOTO_QUALITY,
  PHOTO_CROP_SIZE,
  VALID_PHOTO_FRAMES,
} from '@/lib/constants';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PhotoCropDialogProps {
  imageFile: File;
  initialFrame: PhotoFrameType;
  onSave: (dataUrl: string, frame: PhotoFrameType) => void;
  onCancel: () => void;
}

const FRAME_LABELS: Record<PhotoFrameType, string> = {
  circle: 'Cirkel',
  star: 'Stjärna',
  heart: 'Hjärta',
  diamond: 'Diamant',
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

/**
 * SVG path data for frame shape cutouts, drawn inside a 0–CROP_SIZE coordinate system.
 * Combined with an outer rectangle using evenodd fill-rule to create a "darkened outside" overlay.
 */
function getOverlayPath(frame: PhotoFrameType, s: number): string {
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.45; // slightly smaller than half to give a small margin

  // Outer rectangle (clockwise)
  const outer = `M0,0 L${s},0 L${s},${s} L0,${s} Z`;

  let inner: string;
  switch (frame) {
    case 'circle': {
      // Approximate circle with 4 cubic bezier arcs
      const k = r * 0.5523; // magic number for cubic bezier circle
      inner = [
        `M${cx},${cy - r}`,
        `C${cx + k},${cy - r} ${cx + r},${cy - k} ${cx + r},${cy}`,
        `C${cx + r},${cy + k} ${cx + k},${cy + r} ${cx},${cy + r}`,
        `C${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r},${cy}`,
        `C${cx - r},${cy - k} ${cx - k},${cy - r} ${cx},${cy - r}`,
        'Z',
      ].join(' ');
      break;
    }
    case 'star': {
      // 5-pointed star
      const outerR = r;
      const innerR = r * 0.38;
      const points: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
        const radius = i % 2 === 0 ? outerR : innerR;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
      }
      inner = points.join(' ') + ' Z';
      break;
    }
    case 'heart': {
      // Heart path scaled to the viewport
      const hs = r * 2; // heart size
      const ox = cx - hs / 2;
      const oy = cy - hs * 0.4;
      inner = [
        `M${cx},${oy + hs * 0.88}`,
        `C${cx},${oy + hs * 0.88} ${ox + hs * 0.02},${oy + hs * 0.56} ${ox + hs * 0.02},${oy + hs * 0.3}`,
        `C${ox + hs * 0.02},${oy + hs * 0.12} ${ox + hs * 0.16},${oy} ${ox + hs * 0.32},${oy}`,
        `C${ox + hs * 0.4},${oy} ${ox + hs * 0.46},${oy + hs * 0.04} ${cx},${oy + hs * 0.12}`,
        `C${ox + hs * 0.54},${oy + hs * 0.04} ${ox + hs * 0.6},${oy} ${ox + hs * 0.68},${oy}`,
        `C${ox + hs * 0.84},${oy} ${ox + hs * 0.98},${oy + hs * 0.12} ${ox + hs * 0.98},${oy + hs * 0.3}`,
        `C${ox + hs * 0.98},${oy + hs * 0.56} ${cx},${oy + hs * 0.88} ${cx},${oy + hs * 0.88}`,
        'Z',
      ].join(' ');
      break;
    }
    case 'diamond': {
      inner = `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`;
      break;
    }
  }

  return `${outer} ${inner}`;
}

export function PhotoCropDialog({
  imageFile,
  initialFrame,
  onSave,
  onCancel,
}: PhotoCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState<PhotoFrameType>(initialFrame);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const cropSize = PHOTO_CROP_SIZE;

  // Load file into data URL
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Track natural image size once loaded
  const handleImageLoad = useCallback(() => {
    if (!imgRef.current) return;
    setImageSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
  }, []);

  // Calculate the minimum scale so the image covers the viewport
  const minCoverScale = imageSize.w > 0 && imageSize.h > 0
    ? Math.max(cropSize / imageSize.w, cropSize / imageSize.h)
    : 1;

  // The displayed image size in the viewport
  // scale=1 means image just covers the viewport; scale=3 means 3x zoom
  const effectiveScale = minCoverScale * scale;
  const displayW = imageSize.w * effectiveScale;
  const displayH = imageSize.h * effectiveScale;

  // Clamp offset so image always covers the viewport
  const clampOffset = useCallback(
    (ox: number, oy: number, dw: number, dh: number) => {
      const maxX = Math.max(0, (dw - cropSize) / 2);
      const maxY = Math.max(0, (dh - cropSize) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, ox)),
        y: Math.max(-maxY, Math.min(maxY, oy)),
      };
    },
    [cropSize],
  );

  // Re-clamp offset when scale changes
  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, displayW, displayH));
  }, [scale, displayW, displayH, clampOffset]);

  // --- Drag handlers ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [offset],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const nx = e.clientX - dragStart.x;
      const ny = e.clientY - dragStart.y;
      setOffset(clampOffset(nx, ny, displayW, displayH));
    },
    [dragging, dragStart, displayW, displayH, clampOffset],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // --- Canvas export ---
  const handleSave = useCallback(async () => {
    if (!imgRef.current || !imageSize.w || !imageSize.h) return;
    setSaving(true);

    try {
      // The viewport center in image-display space (offset moves image, so invert)
      const vpCenterXInDisplay = displayW / 2 - offset.x;
      const vpCenterYInDisplay = displayH / 2 - offset.y;

      const vpLeftInDisplay = vpCenterXInDisplay - cropSize / 2;
      const vpTopInDisplay = vpCenterYInDisplay - cropSize / 2;

      // Convert display coords to source (natural) pixel coords
      const ratio = imageSize.w / displayW;
      const srcX = vpLeftInDisplay * ratio;
      const srcY = vpTopInDisplay * ratio;
      const srcW = cropSize * ratio;
      const srcH = cropSize * ratio;

      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_OUTPUT_SIZE;
      canvas.height = PHOTO_OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        imgRef.current,
        srcX, srcY, srcW, srcH,
        0, 0, PHOTO_OUTPUT_SIZE, PHOTO_OUTPUT_SIZE,
      );

      let dataUrl = canvas.toDataURL('image/webp', PHOTO_QUALITY);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
      }

      onSave(dataUrl, frame);
    } finally {
      setSaving(false);
    }
  }, [offset, displayW, displayH, cropSize, imageSize, frame, onSave]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-xl bg-white p-6 text-center">
          <p className="text-sm text-muted-foreground">Laddar bild...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-center text-lg font-semibold">Beskär foto</h3>

        {/* Viewport */}
        <div
          ref={viewportRef}
          className="relative mx-auto cursor-grab overflow-hidden rounded-lg active:cursor-grabbing"
          style={{ width: cropSize, height: cropSize }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* The draggable image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Beskär"
            draggable={false}
            onLoad={handleImageLoad}
            className="pointer-events-none absolute select-none"
            style={{
              width: displayW || 'auto',
              height: displayH || 'auto',
              maxWidth: 'none', // Override Tailwind Preflight img { max-width: 100% }
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />

          {/* Shape overlay */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={cropSize}
            height={cropSize}
            viewBox={`0 0 ${cropSize} ${cropSize}`}
          >
            <path
              d={getOverlayPath(frame, cropSize)}
              fillRule="evenodd"
              fill="rgba(0,0,0,0.5)"
            />
          </svg>
        </div>

        {/* Zoom slider */}
        <div className="mt-4 flex items-center gap-3 px-2">
          <span className="text-xs text-muted-foreground">-</span>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-500"
          />
          <span className="text-xs text-muted-foreground">+</span>
        </div>

        {/* Frame picker */}
        <div className="mt-3 flex justify-center gap-1.5">
          {VALID_PHOTO_FRAMES.map((f) => (
            <button
              key={f}
              onClick={() => setFrame(f)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs capitalize transition-colors',
                frame === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {FRAME_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={saving}
          >
            Avbryt
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={saving || !imageSize.w}
          >
            {saving ? 'Sparar...' : 'Spara'}
          </Button>
        </div>
      </div>
    </div>
  );
}
