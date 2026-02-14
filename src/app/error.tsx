'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-foreground font-display">
          Något gick fel
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Ett oväntat fel uppstod. Försök igen eller gå tillbaka till startsidan.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Försök igen
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
