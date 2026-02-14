import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: 6,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          K
        </span>
      </div>
    ),
    { ...size },
  );
}
