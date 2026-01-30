'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationCard } from '@/components/cards/InvitationCard';
import { AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PartyImage {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

interface InvitationSectionProps {
  partyId: string;
  imageUrl: string | null;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  theme: string | null;
  token: string;
  images: PartyImage[];
  isAdmin?: boolean;
}

export function InvitationSection({
  partyId,
  imageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  theme,
  token,
  images: initialImages,
  isAdmin = false,
}: InvitationSectionProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [images, setImages] = useState<PartyImage[]>(initialImages);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(initialImages.length === 0);
  const [error, setError] = useState<string | null>(null);

  const maxImages = AI_MAX_IMAGES_PER_PARTY;
  const canGenerate = isAdmin || images.length < maxImages;

  async function generateImage() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, theme: theme || 'default' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte generera bild');
        return;
      }

      if (data.imageUrl && data.imageId) {
        const isFirst = images.length === 0;
        const newImage: PartyImage = {
          id: data.imageId,
          imageUrl: data.imageUrl,
          isSelected: isFirst,
        };

        if (isFirst) {
          setCurrentImageUrl(data.imageUrl);
          setImages([newImage]);
        } else {
          setImages((prev) => [...prev, newImage]);
        }

        setExpanded(true);
      }
    } catch {
      setError('Något gick fel vid bildgenerering');
    } finally {
      setGenerating(false);
    }
  }

  async function selectImage(imageId: string) {
    const image = images.find((img) => img.id === imageId);
    if (!image || image.isSelected) return;

    setSelecting(imageId);
    setError(null);
    try {
      const res = await fetch('/api/invitation/select-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, imageId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte välja bild');
        return;
      }

      setCurrentImageUrl(data.imageUrl);
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isSelected: img.id === imageId,
        })),
      );
    } catch {
      setError('Något gick fel');
    } finally {
      setSelecting(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  // No images yet — show generate prompt (always expanded)
  if (!currentImageUrl && images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inbjudan</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Ingen inbjudningsbild ännu. Generera en!
          </p>
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          <Button onClick={generateImage} disabled={generating}>
            {generating ? 'Genererar...' : 'Generera inbjudan'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Inbjudan</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲ Dölj' : '▼ Visa'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Skriv ut
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Selected invitation card (large) */}
          {currentImageUrl && (
            <div className="print:fixed print:inset-0 print:z-50 print:bg-white">
              <InvitationCard
                imageUrl={currentImageUrl}
                childName={childName}
                childAge={childAge}
                partyDate={partyDate}
                partyTime={partyTime}
                venueName={venueName}
                venueAddress={venueAddress}
                rsvpDeadline={rsvpDeadline}
                token={token}
              />
            </div>
          )}

          {/* Image gallery */}
          <div className="print:hidden">
            {!isAdmin && (
              <p className="mb-2 text-sm text-muted-foreground">
                {images.length} av {maxImages} bilder genererade
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => selectImage(img.id)}
                  disabled={selecting !== null}
                  className={cn(
                    'relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all',
                    img.isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-muted hover:border-blue-300',
                    selecting === img.id && 'opacity-50',
                  )}
                >
                  <Image
                    src={img.imageUrl}
                    alt="Inbjudningsbild"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                  />
                  {img.isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                      <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              ))}

              {/* Generate new image button */}
              {canGenerate && (
                <button
                  onClick={generateImage}
                  disabled={generating}
                  className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground disabled:opacity-50"
                >
                  {generating ? (
                    <span className="text-sm">Genererar...</span>
                  ) : (
                    <>
                      <span className="text-2xl">+</span>
                      <span className="text-xs">Ny bild</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
