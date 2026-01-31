'use client';

import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface PhotoFrameProps {
  src: string;
  alt: string;
  shape: PhotoFrameType;
  size?: number;
  className?: string;
}

const CLIP_PATHS: Record<Exclude<PhotoFrameType, 'heart'>, string> = {
  circle: 'circle(50% at 50% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
};

export function PhotoFrame({ src, alt, shape, size = 96, className }: PhotoFrameProps) {
  if (shape === 'heart') {
    return (
      <div className={className} style={{ width: size, height: size }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1 1"
          role="img"
          aria-label={alt}
        >
          <defs>
            <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
              <path d="M0.5,0.92 C0.5,0.92 0.02,0.6 0.02,0.34 C0.02,0.16 0.16,0.04 0.32,0.04 C0.4,0.04 0.46,0.08 0.5,0.16 C0.54,0.08 0.6,0.04 0.68,0.04 C0.84,0.04 0.98,0.16 0.98,0.34 C0.98,0.6 0.5,0.92 0.5,0.92 Z" />
            </clipPath>
          </defs>
          <image
            href={src}
            width="1"
            height="1"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#heart-clip)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data-URL source, not a remote image */}
      <img
        src={src}
        alt={alt}
        style={{
          clipPath: CLIP_PATHS[shape],
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}
