'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { PARTY_THEMES } from '@/lib/constants';

interface PartyFormProps {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  defaultValues?: {
    childName?: string;
    childAge?: number;
    partyDate?: string;
    partyTime?: string;
    partyTimeEnd?: string;
    venueName?: string;
    venueAddress?: string;
    description?: string;
    theme?: string;
    rsvpDeadline?: string;
    maxGuests?: number;
  };
  submitLabel: string;
}

export function PartyForm({ action, defaultValues, submitLabel }: PartyFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Om barnet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="childName">Barnets namn</Label>
              <Input
                id="childName"
                name="childName"
                placeholder="t.ex. Klas"
                defaultValue={defaultValues?.childName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childAge">Ålder (fyller)</Label>
              <Input
                id="childAge"
                name="childAge"
                type="number"
                min={1}
                max={19}
                placeholder="t.ex. 7"
                defaultValue={defaultValues?.childAge}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datum & Plats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="partyDate">Datum</Label>
              <Input
                id="partyDate"
                name="partyDate"
                type="date"
                defaultValue={defaultValues?.partyDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyTime">Starttid</Label>
              <Input
                id="partyTime"
                name="partyTime"
                type="time"
                defaultValue={defaultValues?.partyTime}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyTimeEnd">Sluttid (valfritt)</Label>
              <Input
                id="partyTimeEnd"
                name="partyTimeEnd"
                type="time"
                defaultValue={defaultValues?.partyTimeEnd}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueName">Plats</Label>
            <Input
              id="venueName"
              name="venueName"
              placeholder="t.ex. Leo's Lekland"
              defaultValue={defaultValues?.venueName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Adress (valfritt)</Label>
            <Input
              id="venueAddress"
              name="venueAddress"
              placeholder="t.ex. Storgatan 1, Stockholm"
              defaultValue={defaultValues?.venueAddress}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detaljer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <select
              id="theme"
              name="theme"
              defaultValue={defaultValues?.theme || ''}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Inget tema</option>
              {PARTY_THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning (valfritt)</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Extra info till gästerna..."
              defaultValue={defaultValues?.description}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rsvpDeadline">Sista OSA-datum (valfritt)</Label>
              <Input
                id="rsvpDeadline"
                name="rsvpDeadline"
                type="date"
                defaultValue={defaultValues?.rsvpDeadline}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max antal gäster (valfritt)</Label>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min={1}
                max={100}
                placeholder="t.ex. 15"
                defaultValue={defaultValues?.maxGuests}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <SubmitButton className="w-full">{submitLabel}</SubmitButton>
    </form>
  );
}
