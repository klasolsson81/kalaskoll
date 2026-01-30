'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await fetch('/api/auth/delete-account', { method: 'POST' });
    } catch {
      // Ignore network errors — redirect anyway
    }
    window.location.href = '/login';
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirming(true)}
      >
        Radera konto
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-destructive">Säker?</span>
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
        {pending ? 'Raderar...' : 'Ja, radera'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
        Nej
      </Button>
    </div>
  );
}
