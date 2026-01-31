'use client';

import { TemplateCard, TEMPLATE_IDS } from '@/components/templates';
import { cn } from '@/lib/utils';

interface TemplateColumnProps {
  activeTemplate: string | null;
  activeMode: 'template' | 'ai' | null;
  savingTemplate: boolean;
  onSelectTemplate: (templateId: string) => void;
  partyData: {
    childName: string;
    childAge: number;
    partyDate: string;
    partyTime: string;
    venueName: string;
    venueAddress?: string | null;
    rsvpDeadline?: string | null;
    description?: string | null;
    token: string;
  };
}

export function TemplateColumn({
  activeTemplate,
  activeMode,
  savingTemplate,
  onSelectTemplate,
  partyData,
}: TemplateColumnProps) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs">
          🎨
        </span>
        Gratis-mallar
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATE_IDS.map((id) => {
          const isSelected = activeMode === 'template' && activeTemplate === id;
          return (
            <button
              key={id}
              onClick={() => onSelectTemplate(id)}
              disabled={savingTemplate}
              className={cn(
                'relative overflow-hidden rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-muted hover:border-blue-300',
                savingTemplate && 'opacity-50',
              )}
            >
              <TemplateCard templateId={id} {...partyData} preview />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                    ✓
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {savingTemplate && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Sparar mall...
        </p>
      )}
    </div>
  );
}
