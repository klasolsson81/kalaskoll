'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/templates';
import { InvitationCard } from '@/components/cards/InvitationCard';

interface InvitationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  activeMode: 'template' | 'ai';
  templateId?: string | null;
  imageUrl?: string | null;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  description?: string | null;
  token: string;
}

export function InvitationPreviewDialog({
  open,
  onOpenChange,
  onPrint,
  activeMode,
  templateId,
  imageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  description,
  token,
}: InvitationPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-full gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Förhandsgranskning av inbjudan
        </DialogTitle>

        {/* A4 preview area */}
        <div className="aspect-[210/297] w-full overflow-hidden bg-white">
          {activeMode === 'template' && templateId && (
            <TemplateCard
              templateId={templateId}
              childName={childName}
              childAge={childAge}
              partyDate={partyDate}
              partyTime={partyTime}
              venueName={venueName}
              venueAddress={venueAddress}
              rsvpDeadline={rsvpDeadline}
              description={description}
              token={token}
              previewMode
            />
          )}

          {activeMode === 'ai' && imageUrl && (
            <InvitationCard
              imageUrl={imageUrl}
              childName={childName}
              childAge={childAge}
              partyDate={partyDate}
              partyTime={partyTime}
              venueName={venueName}
              venueAddress={venueAddress}
              rsvpDeadline={rsvpDeadline}
              description={description}
              token={token}
              previewMode
            />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Stäng
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              // Small delay so dialog closes before print dialog opens
              setTimeout(onPrint, 150);
            }}
          >
            Skriv ut
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
