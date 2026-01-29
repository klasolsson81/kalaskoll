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
        .select('*')
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
