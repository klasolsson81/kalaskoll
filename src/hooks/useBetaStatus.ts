'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BETA_CONFIG, betaDaysRemainingForUser, getEndDateForUser, isBetaEndedForUser, type BetaRole, type BetaStatus } from '@/lib/beta-config';

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
        .select('role, beta_ai_images_used, beta_sms_used')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Count feedback submitted by this user
      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const endDate = getEndDateForUser(user.id);
      const expiresAt = new Date(`${endDate}T23:59:59`);
      const isExpired = isBetaEndedForUser(user.id);
      const daysRemaining = betaDaysRemainingForUser(user.id);

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
        feedbackCount: feedbackCount || 0,
      });
    }

    fetchStatus();
  }, [supabase]);

  return status;
}
