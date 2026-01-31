'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoCropDialog } from '@/components/shared/PhotoCropDialog';
import { AI_MAX_IMAGES_PER_PARTY } from '@/lib/constants';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

import { InvitationPreview } from './InvitationPreview';
import { PhotoUploadSection } from './PhotoUploadSection';
import { TemplateColumn } from './TemplateColumn';
import { AiColumn } from './AiColumn';
import { AiGenerateDialog } from './AiGenerateDialog';
import type { AiGenerateOptions } from './AiGenerateDialog';

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
  description?: string | null;
  theme: string | null;
  token: string;
  images: PartyImage[];
  isAdmin?: boolean;
  invitationTemplate: string | null;
  childPhotoUrl: string | null;
  childPhotoFrame: string | null;
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
  description,
  theme,
  token,
  images: initialImages,
  isAdmin = false,
  invitationTemplate,
  childPhotoUrl: initialPhotoUrl,
  childPhotoFrame: initialPhotoFrame,
}: InvitationSectionProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [images, setImages] = useState<PartyImage[]>(initialImages);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Template state
  const [activeTemplate, setActiveTemplate] = useState<string | null>(invitationTemplate);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [photoFrame, setPhotoFrame] = useState<PhotoFrameType>(
    (initialPhotoFrame as PhotoFrameType) || 'circle',
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine active mode
  const activeMode: 'template' | 'ai' | null = activeTemplate
    ? 'template'
    : currentImageUrl
      ? 'ai'
      : null;

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const maxImages = AI_MAX_IMAGES_PER_PARTY;
  const canGenerate = isAdmin || images.length < maxImages;

  // Party data shared across components
  const partyData = {
    childName,
    childAge,
    partyDate,
    partyTime,
    venueName,
    venueAddress,
    rsvpDeadline,
    description,
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
      setExpanded(true);
    } catch {
      setError('Något gick fel');
    } finally {
      setSavingTemplate(false);
    }
  }

  async function generateImage(options: AiGenerateOptions) {
    setGenerating(true);
    setShowGenerateDialog(false);
    setError(null);
    try {
      const res = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId,
          theme: options.theme,
          style: options.style,
          customPrompt: options.customPrompt || undefined,
        }),
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
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);

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

  async function handleCropSave(dataUrl: string, frame: PhotoFrameType) {
    setCropFile(null);
    setUploadingPhoto(true);
    setError(null);

    try {
      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, photoData: dataUrl, frame }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kunde inte ladda upp foto');
        return;
      }

      setPhotoUrl(dataUrl);
      setPhotoFrame(frame);
    } catch {
      setError('Något gick fel vid uppladdning');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleCropCancel() {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function removePhoto() {
    setUploadingPhoto(true);
    setError(null);

    try {
      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, photoData: null, frame: photoFrame }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunde inte ta bort foto');
        return;
      }

      setPhotoUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError('Något gick fel');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handlePrint() {
    const prev = document.title;
    document.title = `Inbjudan – ${childName}s kalas`;
    window.print();
    document.title = prev;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:hidden">
        <CardTitle>Inbjudningskort</CardTitle>
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

      {/* Full-size preview */}
      {expanded && activeMode && (
        <CardContent className="pb-2">
          {showSuccess && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 animate-in fade-in">
              <span>&#10003;</span> Din AI-bild är klar!
            </div>
          )}
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          <InvitationPreview
            activeMode={activeMode}
            activeTemplate={activeTemplate}
            currentImageUrl={currentImageUrl}
            photoUrl={photoUrl}
            photoFrame={photoFrame}
            {...partyData}
          />
        </CardContent>
      )}

      {/* Two-column picker */}
      <CardContent className="print:hidden">
        {!expanded && error && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}
        {!activeMode && error && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto_1fr]">
          <TemplateColumn
            activeTemplate={activeTemplate}
            activeMode={activeMode}
            savingTemplate={savingTemplate}
            onSelectTemplate={selectTemplate}
            partyData={partyData}
          />
          {/* Vertical divider (desktop) / horizontal divider (mobile) */}
          <div className="my-4 border-t md:my-0 md:mx-5 md:border-t-0 md:border-l" />
          <AiColumn
            images={images}
            activeMode={activeMode}
            selecting={selecting}
            generating={generating}
            canGenerate={canGenerate}
            isAdmin={isAdmin}
            maxImages={maxImages}
            onSelectImage={selectImage}
            onGenerate={() => setShowGenerateDialog(true)}
          />
        </div>
      </CardContent>

      {/* Photo upload — for both template and AI modes */}
      {activeMode && (
        <CardContent className="print:hidden">
          <PhotoUploadSection
            childName={childName}
            photoUrl={photoUrl}
            photoFrame={photoFrame}
            uploadingPhoto={uploadingPhoto}
            onFileSelect={(file) => setCropFile(file)}
            onRemovePhoto={removePhoto}
            onError={setError}
            fileInputRef={fileInputRef}
          />
        </CardContent>
      )}

      {/* AI style picker dialog */}
      {showGenerateDialog && (
        <AiGenerateDialog
          partyTheme={theme}
          generating={generating}
          onGenerate={generateImage}
          onCancel={() => setShowGenerateDialog(false)}
        />
      )}

      {/* Crop dialog */}
      {cropFile && (
        <PhotoCropDialog
          imageFile={cropFile}
          initialFrame={photoFrame}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}
    </Card>
  );
}
