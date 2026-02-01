'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSyncExternalStore } from 'react';

/* ── Reduced-motion detection ──────────────────────────── */
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerSnapshot = () => false;

/* ── Balloon configs ───────────────────────────────────── */
const BALLOONS: {
  pos: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  phase: number;
}[] = [
  { pos: [-5.2, 3.5, -3], color: '#6366f1', scale: 0.38, speed: 0.22, phase: 0.0 },
  { pos: [4.8, -1.5, -4], color: '#06b6d4', scale: 0.34, speed: 0.18, phase: 1.8 },
  { pos: [-2.5, -3, -2], color: '#f59e0b', scale: 0.30, speed: 0.28, phase: 3.5 },
  { pos: [5.5, 2.8, -5], color: '#ec4899', scale: 0.42, speed: 0.15, phase: 5.1 },
  { pos: [-4.5, 0.5, -3.5], color: '#a855f7', scale: 0.36, speed: 0.24, phase: 0.9 },
  { pos: [1.5, 4.2, -4.5], color: '#34d399', scale: 0.32, speed: 0.26, phase: 4.2 },
  { pos: [3.8, -3.5, -2.5], color: '#818cf8', scale: 0.33, speed: 0.20, phase: 2.6 },
  { pos: [-3.2, 2, -5], color: '#f472b6', scale: 0.40, speed: 0.17, phase: 5.8 },
  { pos: [0.5, -0.5, -3], color: '#fb923c', scale: 0.28, speed: 0.30, phase: 1.3 },
  { pos: [-1, 4.5, -2.5], color: '#2dd4bf', scale: 0.35, speed: 0.21, phase: 3.9 },
];

/* ── Single balloon mesh ───────────────────────────────── */
function Balloon({
  pos,
  color,
  scale,
  speed,
  phase,
  paused,
}: {
  pos: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  phase: number;
  paused: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Build the string curve once
  const stringGeom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push(
        new THREE.Vector3(
          Math.sin(t * 1.2) * 0.04, // slight sway
          -t * scale * 3.2, // hang downward
          0,
        ),
      );
    }
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts),
      16,
      0.008,
      4,
      false,
    );
  }, [scale]);

  useFrame((state) => {
    if (!groupRef.current || paused) return;
    const t = state.clock.elapsedTime * speed;
    groupRef.current.position.y = pos[1] + Math.sin(t + phase) * 0.45;
    groupRef.current.position.x =
      pos[0] + Math.sin(t * 0.6 + phase) * 0.25;
    groupRef.current.rotation.z = Math.sin(t * 0.4 + phase) * 0.06;
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Balloon body — slightly oval */}
      <mesh scale={[scale, scale * 1.25, scale]}>
        <sphereGeometry args={[1, 28, 28]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.0}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.08}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Specular highlight — fakes a window reflection */}
      <mesh
        position={[-scale * 0.3, scale * 0.45, scale * 0.7]}
        scale={[scale * 0.25, scale * 0.35, scale * 0.1]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="white" transparent opacity={0.35} />
      </mesh>

      {/* Knot */}
      <mesh
        position={[0, -scale * 1.22, 0]}
        scale={[scale * 0.12, scale * 0.18, scale * 0.12]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* String */}
      <mesh geometry={stringGeom} position={[0, -scale * 1.3, 0]}>
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
    </group>
  );
}

/* ── Scene ─────────────────────────────────────────────── */
function Scene({ paused }: { paused: boolean }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <directionalLight position={[-4, 3, 2]} intensity={0.3} />
      <pointLight position={[0, 5, 4]} intensity={0.4} color="#c084fc" />
      {BALLOONS.map((b, i) => (
        <Balloon key={i} {...b} paused={paused} />
      ))}
    </>
  );
}

/* ── Exported component ────────────────────────────────── */
export function Balloons3D() {
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene paused={false} />
      </Canvas>
    </div>
  );
}
