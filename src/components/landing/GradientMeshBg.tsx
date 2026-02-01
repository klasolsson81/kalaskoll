'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerSnapshot = () => false;

export function GradientMeshBg() {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 bg-gradient-mesh ${reduced ? '' : 'animate-gradient-mesh'}`}
    />
  );
}
