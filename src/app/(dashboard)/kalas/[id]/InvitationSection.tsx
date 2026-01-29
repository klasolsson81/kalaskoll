'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationCard } from '@/components/cards/InvitationCard';

interface InvitationSectionProps {
  partyId: string;
  imageUrl: string | null;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  theme: string | null;
  token: string;
}

export function InvitationSection({
  partyId,
  imageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  theme,
  token,
}: InvitationSectionProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [generating, setGenerating] = useState(false);

  async function generateImage() {
    setGenerating(true);
    try {
      const res = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, theme: theme || 'default' }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
      }
    } catch {
      // Ignore
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (!currentImageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inbjudan</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Ingen inbjudningsbild ännu. Generera en!
          </p>
          <Button onClick={generateImage} disabled={generating}>
            {generating ? 'Genererar...' : 'Generera inbjudan'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Inbjudan</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateImage} disabled={generating}>
            {generating ? 'Genererar...' : 'Ny bild'}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Skriv ut
          </Button>
        </div>
      </div>

      <div className="print:fixed print:inset-0 print:z-50 print:bg-white">
        <InvitationCard
          imageUrl={currentImageUrl}
          childName={childName}
          childAge={childAge}
          partyDate={partyDate}
          partyTime={partyTime}
          venueName={venueName}
          token={token}
        />
      </div>
    </div>
  );
}
