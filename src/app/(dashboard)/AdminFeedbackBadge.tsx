'use client';

import Link from 'next/link';
import { useSyncExternalStore, useRef, useCallback } from 'react';

const POLL_INTERVAL_MS = 30_000;

async function fetchFeedbackCount(): Promise<number> {
  try {
    const res = await fetch('/api/admin/feedback/count');
    if (res.ok) {
      const data = await res.json();
      return data.count ?? 0;
    }
  } catch {
    // Silently ignore — badge is non-critical
  }
  return 0;
}

function useFeedbackCount() {
  const countRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);

    // Fetch immediately on first subscribe
    fetchFeedbackCount().then((n) => {
      if (n !== countRef.current) {
        countRef.current = n;
        listenersRef.current.forEach((l) => l());
      }
    });

    const id = setInterval(() => {
      fetchFeedbackCount().then((n) => {
        if (n !== countRef.current) {
          countRef.current = n;
          listenersRef.current.forEach((l) => l());
        }
      });
    }, POLL_INTERVAL_MS);

    return () => {
      listenersRef.current.delete(listener);
      clearInterval(id);
    };
  }, []);

  const getSnapshot = useCallback(() => countRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

export function AdminFeedbackBadge() {
  const count = useFeedbackCount();

  return (
    <Link
      href="/admin/feedback"
      className="relative rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      Feedback
      {count > 0 && (
        <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold leading-none text-primary-foreground animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
}
