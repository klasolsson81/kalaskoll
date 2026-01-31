'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { updateGuest, type GuestActionResult } from './actions';
import type { Guest } from './types';

function isManualEmail(email: string | null): boolean {
  return !!email && email.endsWith('@kalaskoll.local');
}

interface EditGuestFormProps {
  partyId: string;
  guest: Guest;
  onDone: () => void;
}

export function EditGuestForm({ partyId, guest, onDone }: EditGuestFormProps) {
  const boundAction = updateGuest.bind(null, partyId, guest.id);
  const [state, formAction] = useActionState<GuestActionResult, FormData>(boundAction, {});

  if (state.success) {
    onDone();
  }

  const displayEmail = isManualEmail(guest.parent_email) ? '' : (guest.parent_email ?? '');

  return (
    <form action={formAction} className="space-y-3 rounded-md border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`edit-childName-${guest.id}`}>Barnets namn *</Label>
          <Input
            id={`edit-childName-${guest.id}`}
            name="childName"
            defaultValue={guest.child_name}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Kommer</Label>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="attending"
                value="yes"
                defaultChecked={guest.attending}
                className="accent-green-600"
              />
              Ja
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="attending"
                value="no"
                defaultChecked={!guest.attending}
                className="accent-red-600"
              />
              Nej
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-parentName-${guest.id}`}>Förälders namn</Label>
          <Input
            id={`edit-parentName-${guest.id}`}
            name="parentName"
            defaultValue={guest.parent_name ?? ''}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-parentPhone-${guest.id}`}>Telefon</Label>
          <Input
            id={`edit-parentPhone-${guest.id}`}
            name="parentPhone"
            type="tel"
            defaultValue={guest.parent_phone ?? ''}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-parentEmail-${guest.id}`}>E-post</Label>
          <Input
            id={`edit-parentEmail-${guest.id}`}
            name="parentEmail"
            type="email"
            defaultValue={displayEmail}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-message-${guest.id}`}>Meddelande</Label>
          <Input
            id={`edit-message-${guest.id}`}
            name="message"
            defaultValue={guest.message ?? ''}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <SubmitButton size="sm">Spara</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Avbryt
        </Button>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
