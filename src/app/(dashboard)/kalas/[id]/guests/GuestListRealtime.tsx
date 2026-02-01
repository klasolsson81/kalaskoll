'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddGuestForm } from './AddGuestForm';
import { GuestRow } from './GuestRow';
import type { Guest, AllergyInfo, InvitedGuest } from './types';

interface GuestListRealtimeProps {
  partyId: string;
  invitationId: string;
  initialGuests: Guest[];
  initialAllergies: AllergyInfo[];
  invitedGuests: InvitedGuest[];
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
        <div className="rounded-lg glass-card p-4 text-center">
          <p className="text-2xl font-bold">{guests.length}</p>
          <p className="text-sm text-muted-foreground">Totalt svar</p>
        </div>
        <div className="rounded-lg glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{attending.length}</p>
          <p className="text-sm text-green-600">Kommer</p>
        </div>
        <div className="rounded-lg glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{declined.length}</p>
          <p className="text-sm text-red-600">Kan inte</p>
        </div>
      </div>

      {attending.length > 0 && (
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="text-green-700 font-display">Kommer ({attending.length})</CardTitle>
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
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="text-red-700 font-display">Kan inte ({declined.length})</CardTitle>
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
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Skickade inbjudningar ({invitedGuests.length})</CardTitle>
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
        <Card className="border-0 glass-card">
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
