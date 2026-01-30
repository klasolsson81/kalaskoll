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

  // Determine active mode
  const activeMode: 'template' | 'ai' | null = activeTemplate
    ? 'template'
    : currentImageUrl
      ? 'ai'
      : null;

  const hasAnything = activeMode !== null || images.length > 0;

  const [expanded, setExpanded] = useState(!hasAnything || showPicker);

  const maxImages = AI_MAX_IMAGES_PER_PARTY;
  const canGenerate = isAdmin || images.length < maxImages;

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
      setImages((prev) => prev.map((img) => ({ ...img, isSelected: false })));
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
    if (!image) return;

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
      setExpanded(true);
    } catch {
      setError('Något gick fel');
    } finally {
      setSelecting(null);
    }
  }

  function handlePrint() {
    const prev = document.title;
    document.title = `Inbjudan – ${childName}s kalas`;
    window.print();
    document.title = prev;
  }

  // --- State: Nothing selected yet (no template, no AI image, no images at all) ---
  if (!hasAnything && !showPicker) {
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

  // --- State: Has something selected OR picker open ---
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:hidden">
        <CardTitle>Inbjudan</CardTitle>
        <div className="flex gap-2">
          {activeMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▲ Dölj' : '▼ Visa'}
            </Button>
          )}
          {activeMode && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Skriv ut
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Full-size card — only when expanded */}
      {expanded && !showPicker && activeMode && (
        <CardContent className="pb-2">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {activeMode === 'template' && activeTemplate && (
            <div data-print-area>
              <TemplateCard templateId={activeTemplate} {...partyData} />
            </div>
          )}

          {activeMode === 'ai' && currentImageUrl && (
            <div data-print-area>
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
        </CardContent>
      )}

      {/* Picker overlay — replaces full-size card when open */}
      {showPicker && (
        <CardContent className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Välj mall</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPicker(false)}
            >
              Avbryt
            </Button>
          </div>

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
      )}

      {/* Thumbnail strip — ALWAYS visible (even collapsed) */}
      <CardContent className="print:hidden">
        {!showPicker && error && !expanded && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}

        {!isAdmin && images.length > 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            {images.length} av {maxImages} AI-bilder
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Template thumbnail */}
          {activeTemplate && (
            <button
              onClick={() => {
                if (activeMode !== 'template') {
                  selectTemplate(activeTemplate);
                } else {
                  setExpanded(true);
                }
              }}
              disabled={savingTemplate}
              className={cn(
                'relative w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-24',
                activeMode === 'template'
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-muted hover:border-blue-300',
              )}
            >
              <TemplateCard templateId={activeTemplate} {...partyData} preview />
              {activeMode === 'template' && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                    ✓
                  </span>
                </div>
              )}
            </button>
          )}

          {/* AI image thumbnails */}
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => selectImage(img.id)}
              disabled={selecting !== null}
              className={cn(
                'relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-24',
                activeMode === 'ai' && img.isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-muted hover:border-blue-300',
                selecting === img.id && 'opacity-50',
              )}
            >
              <Image
                src={img.imageUrl}
                alt="AI-inbjudningsbild"
                fill
                className="object-cover"
                sizes="96px"
              />
              {activeMode === 'ai' && img.isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                    ✓
                  </span>
                </div>
              )}
            </button>
          ))}

          {/* Generate new AI image */}
          {canGenerate && (
            <button
              onClick={generateImage}
              disabled={generating}
              className="flex aspect-[3/4] w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground disabled:opacity-50 sm:w-24"
            >
              {generating ? (
                <span className="text-[10px]">Genererar...</span>
              ) : (
                <>
                  <span className="text-lg">+</span>
                  <span className="text-[10px]">Ny AI-bild</span>
                </>
              )}
            </button>
          )}

          {/* Switch template button */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex aspect-[3/4] w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground sm:w-24"
          >
            <span className="text-lg">🎨</span>
            <span className="text-[10px]">Byt mall</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
