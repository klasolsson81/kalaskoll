'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors — redirect anyway
    }
    window.location.href = '/login';
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={pending}>
      {pending ? 'Loggar ut...' : 'Logga ut'}
    </Button>
  );
}
