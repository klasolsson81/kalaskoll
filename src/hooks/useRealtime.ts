'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to realtime changes on a Supabase table.
 * Calls onUpdate whenever a matching INSERT, UPDATE, or DELETE occurs.
 */
export function useRealtime(
  table: string,
  filter: { column: string; value: string },
  onUpdate: () => void,
) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        () => {
          onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter.column, filter.value, onUpdate]);
}
