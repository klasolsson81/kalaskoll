'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Party = Database['public']['Tables']['parties']['Row'];

export function useParty(partyId: string) {
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParty() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('parties')
        .select('id, owner_id, child_name, child_age, child_id, party_date, party_time, party_time_end, venue_name, venue_address, description, theme, invitation_image_url, invitation_template, child_photo_url, child_photo_frame, rsvp_deadline, max_guests, notify_on_rsvp, deleted_at, created_at, updated_at')
        .eq('id', partyId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setParty(data);
      }
      setLoading(false);
    }

    fetchParty();
  }, [partyId]);

  return { party, loading, error };
}
