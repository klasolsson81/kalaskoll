'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

/* ── Balloon configs — spread wide for large screens ───── */
const BALLOONS: {
  pos: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  phase: number;
}[] = [
  // Far left
  { pos: [-10, 3.5, -3], color: '#6366f1', scale: 0.42, speed: 0.25, phase: 0.0 },
  { pos: [-9, -2, -4.5], color: '#f472b6', scale: 0.35, speed: 0.20, phase: 2.1 },
  { pos: [-7.5, 1, -2.5], color: '#34d399', scale: 0.30, speed: 0.30, phase: 4.5 },
  // Left
  { pos: [-5, -3.5, -3.5], color: '#f59e0b', scale: 0.38, speed: 0.22, phase: 1.2 },
  { pos: [-4, 4, -5], color: '#a855f7', scale: 0.40, speed: 0.18, phase: 3.8 },
  // Center-left
  { pos: [-1.5, 5, -4], color: '#06b6d4', scale: 0.36, speed: 0.26, phase: 5.2 },
  { pos: [-2, -4.5, -2.5], color: '#818cf8', scale: 0.28, speed: 0.32, phase: 3.3 },
  // Center-right
  { pos: [1.5, -1, -3], color: '#ec4899', scale: 0.33, speed: 0.28, phase: 0.7 },
  { pos: [2, 3, -5], color: '#fb923c', scale: 0.37, speed: 0.21, phase: 5.9 },
  // Right
  { pos: [5, -3, -3], color: '#2dd4bf', scale: 0.34, speed: 0.24, phase: 1.6 },
  { pos: [4.5, 4.5, -4.5], color: '#c084fc', scale: 0.39, speed: 0.19, phase: 4.0 },
  // Far right
  { pos: [7.5, 0, -3.5], color: '#6366f1', scale: 0.32, speed: 0.27, phase: 2.4 },
  { pos: [9, -2, -2.5], color: '#f472b6', scale: 0.36, speed: 0.23, phase: 0.3 },
  { pos: [10, 3, -4], color: '#34d399', scale: 0.38, speed: 0.17, phase: 5.5 },
  // Extra far edges — visible on wide / ultrawide monitors
  { pos: [-12.5, 0.5, -5], color: '#f59e0b', scale: 0.35, speed: 0.20, phase: 3.0 },
  { pos: [12.5, 1, -4.5], color: '#ec4899', scale: 0.30, speed: 0.25, phase: 1.9 },
];

const REPULSION_RADIUS = 2.5;
const REPULSION_STRENGTH = 12;
const STRING_SEGS = 14;

/* ── Single balloon with dynamic string ────────────────── */
function Balloon({
  pos,
  color,
  scale,
  speed,
  phase,
  mouseWorld,
}: {
  pos: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  phase: number;
  mouseWorld: React.RefObject<THREE.Vector3>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  // String data — created imperatively in useEffect to satisfy lint
  const stringDataRef = useRef<{
    buf: Float32Array;
    attr: THREE.BufferAttribute;
  } | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const buf = new Float32Array((STRING_SEGS + 1) * 3);
    const attr = new THREE.BufferAttribute(buf, 3);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', attr);
    const mat = new THREE.LineBasicMaterial({
      color: '#b0b0b0',
      transparent: true,
      opacity: 0.55,
    });
    const line = new THREE.Line(geom, mat);

    groupRef.current.add(line);
    stringDataRef.current = { buf, attr };

    return () => {
      geom.dispose();
      mat.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const clampedDt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime * speed;

    /* ── Base animation — layered sine for organic drift ── */
    const baseX =
      pos[0] +
      Math.sin(t + phase) * 0.8 +
      Math.sin(t * 0.35 + phase * 1.7) * 0.35;
    const baseY =
      pos[1] +
      Math.sin(t * 0.75 + phase) * 1.0 +
      Math.cos(t * 0.4 + phase * 0.9) * 0.3;

    /* ── Mouse repulsion ─────────────────────────────────── */
    if (mouseWorld.current) {
      const dx = baseX + offsetRef.current.x - mouseWorld.current.x;
      const dy = baseY + offsetRef.current.y - mouseWorld.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPULSION_RADIUS && dist > 0.01) {
        const force =
          ((1 - dist / REPULSION_RADIUS) ** 2) * REPULSION_STRENGTH;
        velocityRef.current.x += (dx / dist) * force * clampedDt;
        velocityRef.current.y += (dy / dist) * force * clampedDt;
      }
    }

    /* ── Apply velocity + spring back ────────────────────── */
    offsetRef.current.x += velocityRef.current.x * clampedDt;
    offsetRef.current.y += velocityRef.current.y * clampedDt;

    const decay = Math.pow(0.92, clampedDt * 60);
    offsetRef.current.x *= decay;
    offsetRef.current.y *= decay;

    const vDecay = Math.pow(0.88, clampedDt * 60);
    velocityRef.current.x *= vDecay;
    velocityRef.current.y *= vDecay;

    /* ── Final position ──────────────────────────────────── */
    groupRef.current.position.x = baseX + offsetRef.current.x;
    groupRef.current.position.y = baseY + offsetRef.current.y;
    groupRef.current.position.z = pos[2];

    /* ── Rotation — gentle wobble + velocity tilt ────────── */
    groupRef.current.rotation.z =
      Math.sin(t * 0.5 + phase) * 0.1 + velocityRef.current.x * 0.06;
    groupRef.current.rotation.x = Math.sin(t * 0.3 + phase) * 0.05;

    /* ── Dynamic string ──────────────────────────────────── */
    if (stringDataRef.current) {
      const { buf, attr } = stringDataRef.current;
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y;
      const st = state.clock.elapsedTime;

      for (let i = 0; i <= STRING_SEGS; i++) {
        const frac = i / STRING_SEGS;
        const fracSq = frac * frac;

        const trailX = -vx * fracSq * 0.5;
        const trailY = -vy * fracSq * 0.25;
        const breezeX =
          Math.sin(st * 1.4 + frac * Math.PI * 1.5 + phase) *
          fracSq *
          0.08;
        const breezeZ =
          Math.sin(st * 0.9 + frac * 2.5 + phase) * fracSq * 0.04;

        buf[i * 3] = trailX + breezeX;
        buf[i * 3 + 1] = -scale * 1.3 - frac * scale * 3.5 + trailY;
        buf[i * 3 + 2] = breezeZ;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Balloon body — oval */}
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
    </group>
  );
}

/* ── Scene — lighting + mouse tracking ─────────────────── */
function Scene() {
  const { camera } = useThree();
  const mouseNDC = useRef(new THREE.Vector2(9999, 9999));
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0));
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 3.5),
    [],
  );
  const hitPoint = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    raycaster.current.setFromCamera(mouseNDC.current, camera);
    if (raycaster.current.ray.intersectPlane(plane, hitPoint)) {
      mouseWorld.current.copy(hitPoint);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <directionalLight position={[-4, 3, 2]} intensity={0.3} />
      <pointLight position={[0, 5, 4]} intensity={0.4} color="#c084fc" />
      {BALLOONS.map((b, i) => (
        <Balloon key={i} {...b} mouseWorld={mouseWorld} />
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
        <Scene />
      </Canvas>
    </div>
  );
}
