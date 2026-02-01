'use client';

import dynamic from 'next/dynamic';

const Balloons3D = dynamic(
  () => import('./Balloons3D').then((m) => ({ default: m.Balloons3D })),
  { ssr: false },
);

export function Balloons3DLoader() {
  return <Balloons3D />;
}
