'use client';

import { useBetaStatus } from '@/hooks/useBetaStatus';
import { Sparkles, MessageSquare, Clock } from 'lucide-react';

export function BetaLimitsDisplay() {
  const status = useBetaStatus();

  if (!status?.isTester) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-amber-900">Din beta-status</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>AI-bilder</span>
          </div>
          <span className="font-medium">
            {status.aiImagesRemaining} kvar av 5
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            <span>SMS-utskick</span>
          </div>
          <span className="font-medium">
            {status.smsRemaining} kvar av 5
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Beta gäller i</span>
          </div>
          <span className="font-medium">
            {status.daysRemaining} dagar
          </span>
        </div>
      </div>

      {status.daysRemaining <= 7 && (
        <p className="text-xs text-amber-700 mt-3">
          Din beta-period går ut snart. Alla kalas du skapat finns kvar!
        </p>
      )}
    </div>
  );
}
