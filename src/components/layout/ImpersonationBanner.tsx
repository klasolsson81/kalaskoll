'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ImpersonationBannerProps {
  name: string | null;
  email: string | null;
}

export function ImpersonationBanner({ name, email }: ImpersonationBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStop() {
    setLoading(true);
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' });
      router.push('/admin');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  const displayLabel = name ? `${name} (${email})` : email;

  return (
    <div className="sticky top-0 z-[60] flex h-10 items-center justify-center gap-3 bg-amber-500 px-4 text-sm font-medium text-amber-950 print:hidden">
      <span>
        Du agerar som <strong>{displayLabel}</strong>
      </span>
      <button
        onClick={handleStop}
        disabled={loading}
        className="rounded-md bg-amber-950/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-amber-950/30 disabled:opacity-50"
      >
        {loading ? 'Avslutar...' : 'Avsluta'}
      </button>
    </div>
  );
}
