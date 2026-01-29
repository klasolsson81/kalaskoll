'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface GuestListRealtimeProps {
  invitationId: string;
  initialGuests: Guest[];
  initialAllergies: AllergyInfo[];
}

export function GuestListRealtime({
  invitationId,
  initialGuests,
  initialAllergies,
}: GuestListRealtimeProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [allergies] = useState<AllergyInfo[]>(initialAllergies);

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
              {attending.map((guest) => {
                const allergy = getAllergyForGuest(guest.id);
                return (
                  <li
                    key={guest.id}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
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
                      <div className="text-right text-sm text-muted-foreground">
                        {guest.parent_phone && <p>{guest.parent_phone}</p>}
                        {guest.parent_email && <p>{guest.parent_email}</p>}
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
              })}
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
            <ul className="space-y-3">
              {declined.map((guest) => (
                <li
                  key={guest.id}
                  className="border-b pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-medium">{guest.child_name}</p>
                  {guest.message && (
                    <p className="text-sm italic text-muted-foreground">
                      &quot;{guest.message}&quot;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {guests.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Inga svar ännu. Dela QR-koden med gästerna!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
