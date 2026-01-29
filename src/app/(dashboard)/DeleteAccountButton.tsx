'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteAccount } from '@/app/(auth)/actions';

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

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
    <form action={deleteAccount} className="flex items-center gap-1">
      <span className="text-xs text-destructive">Säker?</span>
      <Button variant="destructive" size="sm" type="submit">
        Ja, radera
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Nej
      </Button>
    </form>
  );
}
