'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoCropDialog } from '@/components/shared/PhotoCropDialog';

import { InvitationPreview } from './InvitationPreview';
import { PhotoUploadSection } from './PhotoUploadSection';
import { TemplateColumn } from './TemplateColumn';
import { AiColumn } from './AiColumn';
import { AiGenerateDialog } from './AiGenerateDialog';
import { useInvitation } from './useInvitation';

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
  childPhotoUrl,
  childPhotoFrame,
}: InvitationSectionProps) {
  const inv = useInvitation({
    partyId,
    imageUrl,
    images: initialImages,
    isAdmin,
    invitationTemplate,
    childPhotoUrl,
    childPhotoFrame,
  });

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
          {inv.activeMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => inv.setExpanded(!inv.expanded)}
            >
              {inv.expanded ? '▲ Dölj' : '▼ Visa'}
            </Button>
          )}
          {inv.activeMode && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Skriv ut
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Full-size preview */}
      {inv.expanded && inv.activeMode && (
        <CardContent className="pb-2">
          {inv.showSuccess && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 animate-in fade-in">
              <span>&#10003;</span> Din AI-bild är klar!
            </div>
          )}
          {inv.error && <p role="alert" className="mb-2 text-sm text-red-600">{inv.error}</p>}

          <InvitationPreview
            activeMode={inv.activeMode}
            activeTemplate={inv.activeTemplate}
            currentImageUrl={inv.currentImageUrl}
            photoUrl={inv.photoUrl}
            photoFrame={inv.photoFrame}
            {...partyData}
          />
        </CardContent>
      )}

      {/* Two-column picker */}
      <CardContent className="print:hidden">
        {!inv.expanded && inv.error && (
          <p role="alert" className="mb-2 text-sm text-red-600">{inv.error}</p>
        )}
        {!inv.activeMode && inv.error && (
          <p role="alert" className="mb-2 text-sm text-red-600">{inv.error}</p>
        )}

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto_1fr]">
          <TemplateColumn
            activeTemplate={inv.activeTemplate}
            activeMode={inv.activeMode}
            savingTemplate={inv.savingTemplate}
            onSelectTemplate={inv.selectTemplate}
            partyData={partyData}
          />
          {/* Vertical divider (desktop) / horizontal divider (mobile) */}
          <div className="my-4 border-t md:my-0 md:mx-5 md:border-t-0 md:border-l" />
          <AiColumn
            images={inv.images}
            activeMode={inv.activeMode}
            selecting={inv.selecting}
            generating={inv.generating}
            canGenerate={inv.canGenerate}
            isAdmin={isAdmin}
            maxImages={inv.maxImages}
            onSelectImage={inv.selectImage}
            onGenerate={() => inv.setShowGenerateDialog(true)}
          />
        </div>
      </CardContent>

      {/* Photo upload — for both template and AI modes */}
      {inv.activeMode && (
        <CardContent className="print:hidden">
          <PhotoUploadSection
            childName={childName}
            photoUrl={inv.photoUrl}
            photoFrame={inv.photoFrame}
            uploadingPhoto={inv.uploadingPhoto}
            onFileSelect={(file) => inv.setCropFile(file)}
            onRemovePhoto={inv.removePhoto}
            onError={inv.setError}
            fileInputRef={inv.fileInputRef}
          />
        </CardContent>
      )}

      {/* AI style picker dialog */}
      {inv.showGenerateDialog && (
        <AiGenerateDialog
          partyTheme={theme}
          generating={inv.generating}
          onGenerate={inv.generateImage}
          onCancel={() => inv.setShowGenerateDialog(false)}
        />
      )}

      {/* Crop dialog */}
      {inv.cropFile && (
        <PhotoCropDialog
          imageFile={inv.cropFile}
          initialFrame={inv.photoFrame}
          onSave={inv.handleCropSave}
          onCancel={inv.handleCropCancel}
        />
      )}
    </Card>
  );
}
