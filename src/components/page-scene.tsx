'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

/**
 * Hero WebGL scene for the capability pages, in three variants.
 *
 * One component rather than three files, because the lighting, camera rig,
 * damping, pixel-ratio cap and reduced-motion handling are identical across
 * them — only the geometry differs, and that is the part that should differ:
 *
 *  • `engineering` — an extruded, bevelled machined plate with its CAD edges
 *    drawn over the solid and a datum cross beneath it. The object is a real
 *    mechanical part (profile with fillets and two bolt holes), not an abstract
 *    solid, because the page is about engineering design.
 *  • `ai`          — a layered node graph with signals travelling the edges
 *    between layers. Reads as a computation graph / pipeline, which is what the
 *    AI page describes, rather than as a "brain".
 *  • `data`        — a point lattice deformed into a slow surface with a few
 *    resolved nodes standing above it. Reads as a dataset being fitted, for the
 *    training programme.
 *
 * Shared constraints (matching `hero-scene.tsx`):
 *  • Loaded via `next/dynamic` with `ssr: false`, so Three never enters the
 *    server bundle or the initial payload.
 *  • `prefers-reduced-motion` holds a single settled frame: no rotation, no
 *    pointer parallax, no travelling signals.
 *  • `dpr` capped at 1.5, and geometry counts drop on small viewports.
 *  • Pointer tracking is a window listener, because the canvas wrapper is
 *    `pointer-events: none` and R3F's own pointer would never fire.
 */

const CTPL_RED = '#D71E1E';
const CTPL_BLUE = '#3D6BFF';

export type SceneVariant = 'engineering' | 'ai' | 'data';

/* ─────────────────────────────────────────────────── engineering ── */

/** A machined plate: rounded profile, two bolt holes, bevelled extrusion. */
function useBracketGeometry() {
  return useMemo(() => {
    const w = 1.5;
    const h = 0.95;
    const r = 0.28;
    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    for (const cx of [-0.82, 0.82]) {
      const hole = new THREE.Path();
      hole.absarc(cx, 0, 0.3, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    // A slot between the bolt holes — the detail that makes it read as a part
    // rather than a plate with two circles in it.
    const slot = new THREE.Path();
    slot.absarc(0, 0, 0.2, 0, Math.PI * 2, true);
    shape.holes.push(slot);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geo.center();
    return geo;
  }, []);
}

function EngineeringPart({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useBracketGeometry();
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 24), [geometry]);

  useFrame((state, delta) => {
    if (reduced || !group.current) return;
    group.current.rotation.y += delta * 0.22;
    // A slight nod rather than a second axis of spin — the part reads as being
    // inspected on a turntable.
    group.current.rotation.x = -0.42 + Math.sin(state.clock.elapsedTime * 0.4) * 0.07;
  });

  return (
    <group ref={group} rotation={[-0.42, 0, 0]}>
      <mesh geometry={geometry}>
        {/* Low metalness on purpose: with no environment map to reflect, a high
            metalness surface has nothing to pick up but the two coloured lights
            and renders as saturated plastic. A near-diffuse grey reads as
            machined aluminium and lets the blue edge lines carry the brand. */}
        <meshStandardMaterial color="#d5d8e0" metalness={0.15} roughness={0.62} />
      </mesh>
      {/* CAD edges drawn over the solid: the signature of an engineering
          viewport rather than a product render. */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={CTPL_BLUE} transparent opacity={0.85} />
      </lineSegments>

      {!compact && (
        <>
          {/* Datum cross + extension lines, as on a drawing. */}
          <Line
            points={[
              [-2.35, 0, 0],
              [2.35, 0, 0],
            ]}
            color={CTPL_RED}
            transparent
            opacity={0.34}
            lineWidth={1}
          />
          <Line
            points={[
              [0, -1.7, 0],
              [0, 1.7, 0],
            ]}
            color={CTPL_RED}
            transparent
            opacity={0.34}
            lineWidth={1}
          />
          {[-0.82, 0.82].map((cx) => (
            <Line
              key={cx}
              points={[
                [cx, -1.45, 0],
                [cx, 1.45, 0],
              ]}
              color={CTPL_BLUE}
              transparent
              opacity={0.22}
              lineWidth={1}
            />
          ))}
        </>
      )}
    </group>
  );
}

/* ────────────────────────────────────────────────────────── ai ── */

/** Layered computation graph: four columns of nodes, edges between adjacent
 *  layers, and signal markers running left to right along a subset of them. */
function NodeGraph({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const signalsRef = useRef<THREE.Group>(null);

  const { nodes, edges, signals } = useMemo(() => {
    const layers = compact ? [2, 3, 3, 2] : [3, 4, 4, 3];
    const nodes: Array<{ pos: THREE.Vector3; layer: number }> = [];
    layers.forEach((count, layer) => {
      for (let i = 0; i < count; i++) {
        const x = (layer - (layers.length - 1) / 2) * 1.15;
        const y = (i - (count - 1) / 2) * 0.78;
        const z = ((layer + i) % 2 === 0 ? 1 : -1) * 0.16;
        nodes.push({ pos: new THREE.Vector3(x, y, z), layer });
      }
    });

    const edges: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let l = 0; l < layers.length - 1; l++) {
      const from = nodes.filter((n) => n.layer === l);
      const to = nodes.filter((n) => n.layer === l + 1);
      from.forEach((a, ai) =>
        to.forEach((b, bi) => {
          // Not fully connected — a dense mesh of every-to-every reads as noise.
          if ((ai + bi) % 2 === 0) edges.push([a.pos, b.pos]);
        }),
      );
    }

    const signals = edges.filter((_, i) => i % 3 === 0).slice(0, compact ? 4 : 8);
    return { nodes, edges, signals };
  }, [compact]);

  useFrame((state) => {
    if (reduced || !signalsRef.current) return;
    const t = state.clock.elapsedTime;
    signalsRef.current.children.forEach((child, i) => {
      const [a, b] = signals[i];
      // Each signal runs its edge on its own offset phase, so the graph reads
      // as continuously computing rather than pulsing in unison.
      const p = (t * 0.42 + i * 0.31) % 1;
      child.position.lerpVectors(a, b, p);
      const fade = Math.sin(p * Math.PI);
      child.scale.setScalar(0.04 + fade * 0.055);
    });
  });

  return (
    <group>
      {edges.map(([a, b], i) => (
        <Line
          key={`e-${i}`}
          points={[a, b]}
          color={i % 3 === 0 ? CTPL_RED : CTPL_BLUE}
          transparent
          opacity={0.2}
          lineWidth={1}
        />
      ))}
      {nodes.map((n, i) => (
        <mesh key={`n-${i}`} position={n.pos}>
          <icosahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial
            color={n.layer % 3 === 1 ? CTPL_RED : CTPL_BLUE}
            emissive={n.layer % 3 === 1 ? CTPL_RED : CTPL_BLUE}
            emissiveIntensity={0.6}
            flatShading
          />
        </mesh>
      ))}
      <group ref={signalsRef}>
        {signals.map((_, i) => (
          <mesh key={`s-${i}`}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial color={CTPL_RED} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────────────── data ── */

/** A point lattice deformed into a travelling surface, with a few points
 *  resolved above it — a dataset being fitted. */
function DataSurface({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const side = compact ? 20 : 30;

  const { positions, base } = useMemo(() => {
    const array = new Float32Array(side * side * 3);
    for (let i = 0; i < side; i++) {
      for (let j = 0; j < side; j++) {
        const k = (i * side + j) * 3;
        array[k] = (i / (side - 1) - 0.5) * 4.2;
        array[k + 1] = 0;
        array[k + 2] = (j / (side - 1) - 0.5) * 4.2;
      }
    }
    return { positions: array, base: array.slice() };
  }, [side]);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    // Held at t=0 under reduced motion: a fixed surface, still legible.
    const t = reduced ? 0 : state.clock.elapsedTime * 0.5;
    for (let i = 0; i < attr.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      attr.setY(i, Math.sin(x * 0.9 + t) * 0.32 + Math.cos(z * 0.75 - t * 0.8) * 0.26);
    }
    attr.needsUpdate = true;
    if (!reduced) pts.rotation.y = state.clock.elapsedTime * 0.06;
  });

  return (
    // Tilted toward the viewer and lifted, so the lattice reads as a surface
    // sitting in the frame rather than a plane sliding out of the bottom of it.
    <group rotation={[0.58, 0, 0]} position={[0, -0.35, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          color={CTPL_BLUE}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Resolved points, held just clear of the surface — far enough to read
          as selected, close enough to still belong to it. */}
      {[
        [-1.3, 0.62, -0.7],
        [1.1, 0.7, 0.6],
        [0.1, 0.78, -1.3],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            color={CTPL_RED}
            emissive={CTPL_RED}
            emissiveIntensity={0.75}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────────────────────────────────── the rig ── */

function CameraRig({
  pointer,
  scroll,
  reduced,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  scroll: React.MutableRefObject<number>;
  reduced: boolean;
}) {
  const { camera } = useThree();
  const damped = useRef({ x: 0, y: 0, z: 8.2 });
  const mounted = useRef(0);

  useFrame((_, delta) => {
    if (reduced) {
      camera.position.set(0, 0, 6.1);
      camera.lookAt(0, 0, 0);
      return;
    }

    mounted.current = Math.min(mounted.current + delta, 2);
    const introT = Math.min(mounted.current / 1.4, 1);
    const introEase = 1 - Math.pow(1 - introT, 3);
    const restZ = 6.1;
    const introZ = 8.2 + (restZ - 8.2) * introEase;

    const targetX = pointer.current.x * 0.5;
    const targetY = -pointer.current.y * 0.36;
    const targetZ = introZ - scroll.current * 1.0;

    damped.current.x += (targetX - damped.current.x) * 0.045;
    damped.current.y += (targetY - damped.current.y) * 0.045;
    damped.current.z += (targetZ - damped.current.z) * 0.06;

    camera.position.set(damped.current.x, damped.current.y, damped.current.z);
    camera.lookAt(0, scroll.current * -0.26, 0);
  });

  return null;
}

function useSceneInput(reduced: boolean) {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    if (reduced) return;

    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        scroll.current = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
        frame = 0;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return { pointer, scroll };
}

export default function PageScene({ variant }: { variant: SceneVariant }) {
  const reduced = usePrefersReducedMotion();
  const { pointer, scroll } = useSceneInput(reduced);

  const compact = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    [],
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.1], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        {/* The engineering variant is lit neutrally, because it is a metal part
            and a brand-coloured key light would tint the whole surface. The
            graph and lattice variants are emissive geometry, so the brand
            lights read as atmosphere there rather than as paint. */}
        <ambientLight intensity={variant === 'engineering' ? 0.85 : 0.7} />
        {variant === 'engineering' ? (
          <>
            <directionalLight position={[4, 5, 6]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-5, -1, 2]} intensity={0.45} color={CTPL_BLUE} />
            <directionalLight position={[2, -4, -3]} intensity={0.3} color={CTPL_RED} />
          </>
        ) : (
          <>
            <directionalLight position={[4, 4, 5]} intensity={1.35} color={CTPL_BLUE} />
            <directionalLight position={[-4, -2, 3]} intensity={0.85} color={CTPL_RED} />
          </>
        )}

        <Float
          speed={reduced ? 0 : 1}
          rotationIntensity={reduced ? 0 : 0.16}
          floatIntensity={reduced ? 0 : 0.4}
        >
          {variant === 'engineering' && <EngineeringPart reduced={reduced} compact={compact} />}
          {variant === 'ai' && <NodeGraph reduced={reduced} compact={compact} />}
          {variant === 'data' && <DataSurface reduced={reduced} compact={compact} />}
        </Float>

        {!compact && variant === 'engineering' && (
          <Grid
            position={[0, -2.2, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor={CTPL_BLUE}
            sectionSize={2}
            sectionThickness={1}
            sectionColor={CTPL_RED}
            fadeDistance={9}
            fadeStrength={1.5}
            infiniteGrid
            followCamera={false}
          />
        )}

        <CameraRig pointer={pointer} scroll={scroll} reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
