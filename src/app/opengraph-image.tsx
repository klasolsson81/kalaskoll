import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KalasKoll – Smarta barnkalas-inbjudningar med QR-kod';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #86efac 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -40,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 100,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.08)',
            display: 'flex',
          }}
        />

        {/* Emoji confetti */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 48,
            marginBottom: 24,
          }}
        >
          <span>🎈</span>
          <span>🎂</span>
          <span>🎉</span>
          <span>🎁</span>
          <span>🎊</span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: '#065f46',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          KalasKoll
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 500,
            color: '#047857',
            marginBottom: 32,
          }}
        >
          Smarta barnkalas-inbjudningar med QR-kod
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          {['AI-inbjudningar', 'QR-kod OSA', 'Realtids-gastlista', 'GDPR-sakert'].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '10px 20px',
                  borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#065f46',
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            fontWeight: 600,
            color: '#10b981',
          }}
        >
          Gratis att borja — kalaskoll.se
        </div>
      </div>
    ),
    { ...size },
  );
}
