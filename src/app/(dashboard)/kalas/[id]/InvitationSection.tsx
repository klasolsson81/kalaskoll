'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationCard } from '@/components/cards/InvitationCard';
import { TemplateCard, TemplatePicker } from '@/components/templates';
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
  invitationTemplate: string | null;
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
  invitationTemplate,
}: InvitationSectionProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [images, setImages] = useState<PartyImage[]>(initialImages);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Template state
  const [activeTemplate, setActiveTemplate] = useState<string | null>(invitationTemplate);
  const [showPicker, setShowPicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Determine what mode we're in
  const hasTemplate = activeTemplate !== null;
  const hasAiImage = currentImageUrl !== null;
  const hasNothing = !hasTemplate && !hasAiImage && images.length === 0;

  const [expanded, setExpanded] = useState(hasNothing || showPicker);

  const maxImages = AI_MAX_IMAGES_PER_PARTY;
  const canGenerate = isAdmin || images.length < maxImages;

  async function selectTemplate(templateId: string) {
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation/select-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, templateId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte spara mall');
        return;
      }

      setActiveTemplate(templateId);
      setCurrentImageUrl(null);
      setShowPicker(false);
      setExpanded(true);
    } catch {
      setError('Något gick fel');
    } finally {
      setSavingTemplate(false);
    }
  }

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

      if (data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        setActiveTemplate(null);
        setExpanded(true);
        setShowPicker(false);

        if (data.imageId) {
          const isFirst = images.length === 0;
          const newImage: PartyImage = {
            id: data.imageId,
            imageUrl: data.imageUrl,
            isSelected: isFirst,
          };

          if (isFirst) {
            setImages([newImage]);
          } else {
            setImages((prev) => [...prev, newImage]);
          }
        }
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
      setActiveTemplate(null);
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

  // Party data shared across template and picker
  const partyData = {
    childName,
    childAge,
    partyDate,
    partyTime,
    venueName,
    venueAddress,
    rsvpDeadline,
    token,
  };

  // --- State: Nothing selected yet (no template, no AI image) ---
  if (hasNothing && !showPicker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inbjudan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Välj en gratis mall eller skapa en AI-genererad inbjudan.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <TemplatePicker
            {...partyData}
            selectedId={null}
            onSelect={selectTemplate}
          />

          {savingTemplate && (
            <p className="text-center text-sm text-muted-foreground">
              Sparar mall...
            </p>
          )}

          <div className="flex items-center gap-3 pt-2 print:hidden">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">eller</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="text-center print:hidden">
            <Button
              onClick={generateImage}
              disabled={generating}
              variant="outline"
            >
              {generating ? 'Genererar...' : 'Skapa med AI ✨'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- State: Picker open (switching template) ---
  if (showPicker) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Välj mall</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPicker(false)}
          >
            Avbryt
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <TemplatePicker
            {...partyData}
            selectedId={activeTemplate}
            onSelect={selectTemplate}
          />

          {savingTemplate && (
            <p className="text-center text-sm text-muted-foreground">
              Sparar mall...
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- State: Template selected (showing full-size template card) ---
  if (hasTemplate) {
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
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Full-size template card */}
            <div className="print:fixed print:inset-0 print:z-50 print:flex print:items-center print:justify-center print:bg-white">
              <TemplateCard templateId={activeTemplate} {...partyData} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPicker(true)}
              >
                Byt mall
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateImage}
                disabled={generating}
              >
                {generating ? 'Genererar...' : 'Skapa med AI ✨'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // --- State: AI image selected (existing flow) ---
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

            {/* Switch to free templates */}
            <div className="mt-3">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-muted-foreground"
                onClick={() => setShowPicker(true)}
              >
                Byt till gratis mall
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
