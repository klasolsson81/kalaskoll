'use client';

import { useCallback, useEffect, useState, useActionState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import {
  createGuest,
  updateGuest,
  deleteGuest,
  type GuestActionResult,
} from './actions';

interface Guest {
  id: string;
  child_name: string;
  attending: boolean;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  message: string | null;
  responded_at: string;
}

interface AllergyInfo {
  rsvp_id: string;
  allergies: string[];
  other_dietary: string | null;
}

interface InvitedGuest {
  email: string | null;
  phone: string | null;
  invite_method: string;
  name: string | null;
  invited_at: string;
  hasResponded: boolean;
}

interface GuestListRealtimeProps {
  partyId: string;
  invitationId: string;
  initialGuests: Guest[];
  initialAllergies: AllergyInfo[];
  invitedGuests: InvitedGuest[];
}

function isManualEmail(email: string | null): boolean {
  return !!email && email.endsWith('@kalaskoll.local');
}

function AddGuestForm({ partyId, onDone }: { partyId: string; onDone: () => void }) {
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
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

function EditGuestForm({
  partyId,
  guest,
  onDone,
}: {
  partyId: string;
  guest: Guest;
  onDone: () => void;
}) {
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
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

function GuestRow({
  partyId,
  guest,
  allergy,
}: {
  partyId: string;
  guest: Guest;
  allergy?: AllergyInfo;
}) {
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

export function GuestListRealtime({
  partyId,
  invitationId,
  initialGuests,
  initialAllergies,
  invitedGuests,
}: GuestListRealtimeProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [allergies] = useState<AllergyInfo[]>(initialAllergies);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchGuests = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('rsvp_responses')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('responded_at', { ascending: false });

    if (data) setGuests(data);
  }, [invitationId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('rsvp-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvp_responses',
          filter: `invitation_id=eq.${invitationId}`,
        },
        () => {
          fetchGuests();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invitationId, fetchGuests]);

  const attending = guests.filter((g) => g.attending);
  const declined = guests.filter((g) => !g.attending);

  function getAllergyForGuest(guestId: string): AllergyInfo | undefined {
    return allergies.find((a) => a.rsvp_id === guestId);
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <AddGuestForm partyId={partyId} onDone={() => setShowAddForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}>
          + Lägg till gäst
        </Button>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-2xl font-bold">{guests.length}</p>
          <p className="text-sm text-muted-foreground">Totalt svar</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{attending.length}</p>
          <p className="text-sm text-green-600">Kommer</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{declined.length}</p>
          <p className="text-sm text-red-600">Kan inte</p>
        </div>
      </div>

      {attending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Kommer ({attending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {attending.map((guest) => (
                <GuestRow
                  key={guest.id}
                  partyId={partyId}
                  guest={guest}
                  allergy={getAllergyForGuest(guest.id)}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {declined.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Kan inte ({declined.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {declined.map((guest) => (
                <GuestRow
                  key={guest.id}
                  partyId={partyId}
                  guest={guest}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {invitedGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skickade inbjudningar ({invitedGuests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {invitedGuests.map((g) => {
                const key = g.email ?? g.phone ?? g.invited_at;
                const isSms = g.invite_method === 'sms';
                const display = isSms ? g.phone : (g.name || g.email);
                return (
                  <li key={key} className="flex items-center gap-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-base" title={isSms ? 'SMS' : 'E-post'}>
                      {isSms ? '📱' : '✉️'}
                    </span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                        g.hasResponded ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="truncate">{display}</span>
                    {!isSms && g.name && g.email && (
                      <span className="text-muted-foreground truncate">{g.email}</span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                      {g.hasResponded ? 'Svarat' : 'Ej svarat'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {guests.length === 0 && invitedGuests.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Inga svar ännu. Dela QR-koden med gästerna eller lägg till gäster manuellt!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
