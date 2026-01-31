'use client';

import { InvitationCard } from '@/components/cards/InvitationCard';
import { TemplateCard } from '@/components/templates';
import type { PhotoFrame as PhotoFrameType } from '@/lib/constants';

interface InvitationPreviewProps {
  activeMode: 'template' | 'ai';
  activeTemplate: string | null;
  currentImageUrl: string | null;
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  description?: string | null;
  token: string;
  photoUrl: string | null;
  photoFrame: PhotoFrameType;
}

export function InvitationPreview({
  activeMode,
  activeTemplate,
  currentImageUrl,
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  description,
  token,
  photoUrl,
  photoFrame,
}: InvitationPreviewProps) {
  if (activeMode === 'template' && activeTemplate) {
    return (
      <div data-print-area>
        <TemplateCard
          templateId={activeTemplate}
          childName={childName}
          childAge={childAge}
          partyDate={partyDate}
          partyTime={partyTime}
          venueName={venueName}
          venueAddress={venueAddress}
          rsvpDeadline={rsvpDeadline}
          description={description}
          token={token}
          childPhotoUrl={photoUrl}
          childPhotoFrame={photoFrame}
        />
      </div>
    );
  }

  if (activeMode === 'ai' && currentImageUrl) {
    return (
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
          description={description}
          token={token}
        />
      </div>
    );
  }

  return null;
}
