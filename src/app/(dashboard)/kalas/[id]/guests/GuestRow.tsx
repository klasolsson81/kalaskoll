'use client';

import { useState } from 'react';
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

  return (
    <li className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{guest.child_name}</p>
          {guest.parent_name && (
            <p className="text-sm text-muted-foreground">
              Förälder: {guest.parent_name}
            </p>
          )}
          {guest.message && (
            <p className="mt-1 text-sm italic text-muted-foreground">
              &quot;{guest.message}&quot;
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="text-right text-sm text-muted-foreground">
            {guest.parent_phone && <p>{guest.parent_phone}</p>}
            {guest.parent_email && !isManualEmail(guest.parent_email) && (
              <p>{guest.parent_email}</p>
            )}
          </div>
          {mode === 'confirm-delete' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ta bort {guest.child_name}?</span>
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
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setMode('edit')}>
                Redigera
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('confirm-delete')}>
                Ta bort
              </Button>
            </div>
          )}
        </div>
      </div>
      {allergy && (
        <div className="mt-2 rounded-md bg-amber-50 p-2">
          <p className="text-xs font-medium text-amber-800">Allergier:</p>
          <p className="text-sm text-amber-700">
            {allergy.allergies.join(', ')}
            {allergy.other_dietary && ` + ${allergy.other_dietary}`}
          </p>
        </div>
      )}
    </li>
  );
}
