'use client';

import { useState } from 'react';
import { Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteGuest } from './actions';
import { EditGuestForm } from './EditGuestForm';
import type { Guest, AllergyInfo } from './types';

function isManualEmail(email: string | null): boolean {
  return !!email && email.endsWith('@kalaskoll.local');
}

interface GuestRowProps {
  partyId: string;
  guest: Guest;
  allergy?: AllergyInfo;
}

export function GuestRow({ partyId, guest, allergy }: GuestRowProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');

  if (mode === 'edit') {
    return (
      <li>
        <EditGuestForm partyId={partyId} guest={guest} onDone={() => setMode('view')} />
      </li>
    );
  }

  const hasEmail = guest.parent_email && !isManualEmail(guest.parent_email);
  const hasPhone = !!guest.parent_phone;

  return (
    <li className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-medium">{guest.child_name}</p>
          {guest.parent_name && (
            <p className="text-sm text-muted-foreground">
              Förälder: {guest.parent_name}
            </p>
          )}
          {(hasEmail || hasPhone) && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {hasEmail && (
                <>
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{guest.parent_email}</span>
                </>
              )}
              {hasEmail && hasPhone && <span>·</span>}
              {hasPhone && (
                <>
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{guest.parent_phone}</span>
                </>
              )}
            </p>
          )}
          {guest.message && (
            <p className="text-sm italic text-muted-foreground">
              &quot;{guest.message}&quot;
            </p>
          )}
          {allergy && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {allergy.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  {a}
                </span>
              ))}
              {allergy.other_dietary && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {allergy.other_dietary}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-0.5">
          {mode === 'confirm-delete' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ta bort?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await deleteGuest(partyId, guest.id);
                }}
              >
                Ja
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('view')}>
                Avbryt
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMode('edit')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMode('confirm-delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
