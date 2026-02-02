'use client';

import { useRef, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

const IDLE_WARNING_MS = 30 * 60 * 1000; // 30 min
const IDLE_LOGOUT_MS = 2 * 60 * 1000; // 2 min after warning

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

function useIdleWarning(isSuperAdmin: boolean) {
  const warningRef = useRef(false);
  const listenersRef = useRef(new Set<() => void>());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const notify = useCallback(() => {
    listenersRef.current.forEach((l) => l());
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort
    }
    router.push('/login');
  }, [router]);

  const resetTimers = useCallback(() => {
    if (warningRef.current) {
      warningRef.current = false;
      notify();
    }
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      warningRef.current = true;
      notify();
      logoutTimerRef.current = setTimeout(doLogout, IDLE_LOGOUT_MS);
    }, IDLE_WARNING_MS);
  }, [doLogout, notify]);

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);

      if (!isSuperAdmin) {
        resetTimers();

        const onActivity = () => {
          if (!warningRef.current) {
            resetTimers();
          }
        };

        for (const event of ACTIVITY_EVENTS) {
          window.addEventListener(event, onActivity, { passive: true });
        }

        return () => {
          listenersRef.current.delete(listener);
          for (const event of ACTIVITY_EVENTS) {
            window.removeEventListener(event, onActivity);
          }
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
      }

      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [isSuperAdmin, resetTimers],
  );

  const getSnapshot = useCallback(() => warningRef.current, []);

  const showWarning = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return { showWarning, resetTimers };
}

export function IdleTimeout({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { showWarning, resetTimers } = useIdleWarning(isSuperAdmin);

  if (isSuperAdmin || !showWarning) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-4 bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
      <span>Du loggas ut om 2 minuter pga inaktivitet</span>
      <button
        onClick={resetTimers}
        className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50"
      >
        Jag är kvar
      </button>
    </div>
  );
}
