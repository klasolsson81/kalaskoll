'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { useConfetti } from '@/hooks/useConfetti';

export function ConfettiTrigger({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          fireConfetti();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fireConfetti]);

  return <div ref={ref}>{children}</div>;
}
