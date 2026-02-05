'use client';

import { useBetaStatus } from '@/hooks/useBetaStatus';
import { BETA_CONFIG } from '@/lib/beta-config';
import { Sparkles, MessageSquare, Clock, Heart } from 'lucide-react';

function getFeedbackMood(count: number): { emoji: string; label: string } {
  if (count === 0) return { emoji: '😶', label: 'Ingen feedback ännu' };
  if (count === 1) return { emoji: '🙂', label: '1 inskickad' };
  if (count === 2) return { emoji: '😊', label: '2 inskickade' };
  if (count <= 4) return { emoji: '😄', label: `${count} inskickade` };
  if (count <= 9) return { emoji: '🤩', label: `${count} inskickade` };
  return { emoji: '🏆', label: `${count} inskickade!` };
}

export function BetaLimitsDisplay() {
  const status = useBetaStatus();

  if (!status?.isTester) return null;

  const mood = getFeedbackMood(status.feedbackCount);

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
            {status.aiImagesRemaining} kvar av {BETA_CONFIG.freeAiImages}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            <span>SMS-utskick</span>
          </div>
          <span className="font-medium">
            {status.smsRemaining} kvar av {BETA_CONFIG.freeSmsInvites}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Kontot raderas {status.expiresAt ? status.expiresAt.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' }) : '1 mars'}</span>
          </div>
          <span className="font-medium">
            {status.daysRemaining} dagar kvar
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-amber-600" />
            <span>Feedback</span>
          </div>
          <span className="font-medium">
            {mood.emoji} {mood.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-amber-700 mt-3">
        Testkonton raderas automatiskt {status.expiresAt ? status.expiresAt.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' }) : '1 mars'}. Vill du fortsätta? Registrera ett vanligt konto efter betan.
      </p>
    </div>
  );
}
