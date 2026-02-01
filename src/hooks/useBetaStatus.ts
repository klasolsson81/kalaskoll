'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BETA_CONFIG, type BetaRole, type BetaStatus } from '@/lib/beta-config';

export function useBetaStatus(): BetaStatus | null {
  const [status, setStatus] = useState<BetaStatus | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, beta_ai_images_used, beta_sms_used, beta_expires_at')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const expiresAt = profile.beta_expires_at ? new Date(profile.beta_expires_at) : null;
      const isExpired = expiresAt ? expiresAt < new Date() : false;
      const daysRemaining = expiresAt
        ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

      const role = profile.role as BetaRole;
      setStatus({
        role,
        isTester: role === 'tester',
        isAdmin: role === 'admin',
        isExpired,
        aiImagesUsed: profile.beta_ai_images_used || 0,
        aiImagesRemaining: Math.max(0, BETA_CONFIG.freeAiImages - (profile.beta_ai_images_used || 0)),
        smsUsed: profile.beta_sms_used || 0,
        smsRemaining: Math.max(0, BETA_CONFIG.freeSmsInvites - (profile.beta_sms_used || 0)),
        expiresAt,
        daysRemaining,
      });
    }

    fetchStatus();
  }, [supabase]);

  return status;
}
