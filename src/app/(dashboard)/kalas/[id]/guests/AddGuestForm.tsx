'use client';

import { useActionState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { createGuest, type GuestActionResult } from './actions';

interface AddGuestFormProps {
  partyId: string;
  onDone: () => void;
}

export function AddGuestForm({ partyId, onDone }: AddGuestFormProps) {
  const boundAction = createGuest.bind(null, partyId);
  const [state, formAction] = useActionState<GuestActionResult, FormData>(boundAction, {});

  if (state.success) {
    onDone();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="add-childName">Barnets namn *</Label>
              <Input id="add-childName" name="childName" required />
            </div>
            <div className="space-y-1">
              <Label>Kommer</Label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="attending" value="yes" defaultChecked className="accent-green-600" />
                  Ja
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="radio" name="attending" value="no" className="accent-red-600" />
                  Nej
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-parentName">Förälders namn</Label>
              <Input id="add-parentName" name="parentName" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-parentPhone">Telefon</Label>
              <Input id="add-parentPhone" name="parentPhone" type="tel" placeholder="0701234567" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-parentEmail">E-post</Label>
              <Input id="add-parentEmail" name="parentEmail" type="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-message">Meddelande</Label>
              <Input id="add-message" name="message" placeholder="T.ex. allergiinfo" />
            </div>
          </div>
          <div className="flex gap-2">
            <SubmitButton size="sm">Lägg till</SubmitButton>
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Avbryt
            </Button>
          </div>
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
