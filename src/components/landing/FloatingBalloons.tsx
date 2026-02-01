'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerSnapshot = () => false;

const BALLOONS = [
  { color: 'oklch(0.55 0.19 255 / 0.35)', cx: '12%', delay: '0s', duration: '20s' },
  { color: 'oklch(0.65 0.13 175 / 0.30)', cx: '30%', delay: '3s', duration: '22s' },
  { color: 'oklch(0.80 0.14 75 / 0.30)', cx: '50%', delay: '6s', duration: '18s' },
  { color: 'oklch(0.58 0.16 280 / 0.35)', cx: '68%', delay: '2s', duration: '24s' },
  { color: 'oklch(0.62 0.15 155 / 0.30)', cx: '85%', delay: '5s', duration: '21s' },
  { color: 'oklch(0.65 0.15 330 / 0.30)', cx: '42%', delay: '8s', duration: '19s' },
];

function Balloon({ color, cx, delay, duration, index }: {
  color: string;
  cx: string;
  delay: string;
  duration: string;
  index: number;
}) {
  return (
    <svg
      className={`absolute bottom-0 ${index >= 3 ? 'hidden md:block' : ''}`}
      style={{
        left: cx,
        animationDelay: delay,
        animationDuration: duration,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationName: 'balloon-float',
      }}
      width="40"
      height="56"
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="20" cy="20" rx="16" ry="20" fill={color} />
      <path d="M20 40 L18 42 L22 42 Z" fill={color} />
      <path d="M20 42 Q19 48 20 56" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}

export function FloatingBalloons() {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {BALLOONS.map((b, i) => (
        <Balloon key={i} {...b} index={i} />
      ))}
    </div>
  );
}
