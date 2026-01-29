'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type RsvpResponse = Database['public']['Tables']['rsvp_responses']['Row'];

export function useGuests(partyId: string) {
  const [guests, setGuests] = useState<RsvpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGuests() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('rsvp_responses')
        .select(`
          *,
          invitations!inner(party_id)
        `)
        .eq('invitations.party_id', partyId);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setGuests(data ?? []);
      }
      setLoading(false);
    }

    fetchGuests();
  }, [partyId]);

  const attending = guests.filter((g) => g.attending).length;
  const declined = guests.filter((g) => !g.attending).length;

  return { guests, attending, declined, total: guests.length, loading, error };
}
