'use client';

import { cn } from '@/lib/utils';
import { TemplateCard } from './TemplateCard';
import { TEMPLATE_IDS } from './theme-configs';

interface TemplatePickerProps {
  childName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  venueName: string;
  venueAddress?: string | null;
  rsvpDeadline?: string | null;
  description?: string | null;
  token: string;
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

export function TemplatePicker({
  childName,
  childAge,
  partyDate,
  partyTime,
  venueName,
  venueAddress,
  rsvpDeadline,
  description,
  token,
  selectedId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TEMPLATE_IDS.map((id) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={cn(
            'rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            selectedId === id
              ? 'ring-2 ring-primary ring-offset-2'
              : 'hover:ring-2 hover:ring-primary/40 hover:ring-offset-1',
          )}
        >
          <TemplateCard
            templateId={id}
            childName={childName}
            childAge={childAge}
            partyDate={partyDate}
            partyTime={partyTime}
            venueName={venueName}
            venueAddress={venueAddress}
            rsvpDeadline={rsvpDeadline}
            description={description}
            token={token}
            preview
          />
        </button>
      ))}
    </div>
  );
}
