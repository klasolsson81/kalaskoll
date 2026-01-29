'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCode } from '@/components/shared/QRCode';
import { APP_URL } from '@/lib/constants';

interface QRCodeSectionProps {
  token: string;
}

export function QRCodeSection({ token }: QRCodeSectionProps) {
  const [copied, setCopied] = useState(false);
  const rsvpUrl = `${APP_URL}/r/${token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for mobile
      const input = document.createElement('input');
      input.value = rsvpUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR-kod för OSA</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <QRCode token={token} size={200} />
        <p className="text-sm text-muted-foreground">
          Skriv ut eller dela denna QR-kod med gästerna
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <code className="flex-1 rounded bg-muted px-3 py-2 text-center text-sm">
            {rsvpUrl}
          </code>
          <Button variant="outline" onClick={copyLink}>
            {copied ? 'Kopierad!' : 'Kopiera länk'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
