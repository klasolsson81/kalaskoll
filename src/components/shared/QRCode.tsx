'use client';

import { QRCodeSVG } from 'qrcode.react';
import { APP_URL } from '@/lib/constants';

interface QRCodeProps {
  token: string;
  size?: number;
}

export function QRCode({ token, size = 200 }: QRCodeProps) {
  const url = `${APP_URL}/r/${token}`;

  return (
    <div className="inline-block rounded-lg bg-white p-4" role="img" aria-label={`QR-kod för att svara på inbjudan: ${url}`}>
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
