'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

/**
 * Hero WebGL scene for the capability pages, in four variants.
 *
 * One component rather than four files, because the lighting, camera rig,
 * damping, pixel-ratio cap and reduced-motion handling are identical across
 * them — only the geometry differs, and that is the part that should differ:
 *
 *  • `engineering`  — an extruded, bevelled machined plate with its CAD edges
 *    drawn over the solid and a datum cross beneath it. The object is a real
 *    mechanical part (profile with fillets and two bolt holes), not an abstract
 *    solid, because the page is about engineering design.
 *  • `ai`           — a lattice of cells resolved by a sweeping scan plane.
 *    Reads as computer vision reconstructing a volume, which is what the AI
 *    page's products do, rather than as a network diagram.
 *  • `data`         — a point lattice deformed into a slow surface with a few
 *    resolved nodes standing above it. Reads as a dataset being fitted, for the
 *    training programme.
 *  • `architecture` — footprints on a plan grid extruding up into massing, for
 *    the visualisation page: literally the 2D-to-3D move that page sells.
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

export type SceneVariant = 'engineering' | 'ai' | 'data' | 'architecture';

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

/**
 * A volume being resolved: a lattice of small cubes with a scan plane sweeping
 * through it. Cells the plane has passed snap to full size and brand red; cells
 * ahead of it sit small and pale. Reads as computer vision / reconstruction
 * resolving a field — which is what this page's products actually do — rather
 * than as a network diagram, which every AI page already has.
 *
 * Drawn with one InstancedMesh: a 7x7x7 lattice is 343 cells, and 343 separate
 * meshes would be 343 draw calls a frame for geometry that never changes.
 */
const STEP = 0.42;

function ScanVolume({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const side = compact ? 5 : 7;
  const count = side * side * side;

  const { offsets, dummy, colorA, colorB } = useMemo(
    () => ({
      offsets: Array.from({ length: count }, (_, i) => {
        const x = i % side;
        const y = Math.floor(i / side) % side;
        const z = Math.floor(i / (side * side));
        return new THREE.Vector3(
          (x - (side - 1) / 2) * STEP,
          (y - (side - 1) / 2) * STEP,
          (z - (side - 1) / 2) * STEP,
        );
      }),
      dummy: new THREE.Object3D(),
      colorA: new THREE.Color(CTPL_BLUE),
      colorB: new THREE.Color(CTPL_RED),
    }),
    [count, side],
  );

  // Instance colours are written once; only the per-instance matrix changes.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) mesh.setColorAt(i, colorA);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, colorA]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Held mid-sweep under reduced motion: a still frame that still shows both
    // the resolved and unresolved halves of the volume.
    const t = reduced ? 0.5 : (state.clock.elapsedTime * 0.16) % 1;
    const planeY = (t - 0.5) * (side * STEP) * 1.7;

    for (let i = 0; i < count; i++) {
      const p = offsets[i];
      const d = planeY - p.y;
      // A wide band either side of the plane. Narrower than this and the volume
      // reads as two stacked solids with a seam rather than one field being
      // progressively resolved.
      const resolved = THREE.MathUtils.clamp(d / 1.1 + 0.5, 0, 1);
      const s = 0.05 + resolved * 0.075;
      dummy.position.copy(p);
      dummy.scale.setScalar(s);
      dummy.rotation.set(0, resolved * 0.8, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      // Only 78% of the way to red: at full strength the resolved half becomes
      // one heavy block of brand red that dominates the whole hero.
      mesh.setColorAt(i, colorA.clone().lerp(colorB, resolved * 0.78));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (!reduced) mesh.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <group scale={0.72}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0} />
      </instancedMesh>

      {!compact && (
        <>
          {/* Bounding cage — the extent being scanned. */}
          {([
            [-1.5, -1.5],
            [1.5, -1.5],
            [-1.5, 1.5],
            [1.5, 1.5],
          ] as const).map(([x, z], i) => (
            <Line
              key={i}
              points={[
                [x, -1.5, z],
                [x, 1.5, z],
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

/* ─────────────────────────────────────────────── architecture ── */

/**
 * A floor plan rising into massing — the visualisation page's actual subject.
 *
 * Footprints are drawn flat on a plan grid and their volumes extrude up out of
 * them on a loop, each block on its own phase, then settle. Edges are drawn over
 * every volume so it reads as an architectural model under construction rather
 * than a stack of boxes. Held fully extruded under reduced motion.
 */
function ArchitectureMassing({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);

  // Footprint, target height and phase offset per block.
  const blocks = useMemo(
    () =>
      (compact
        ? ([
            [-0.7, 0, 1.5, 1.6, 1.25, 0],
            [0.95, 0.3, 1.2, 1.0, 0.8, 0.35],
          ] as const)
        : ([
            [-0.9, -0.15, 1.6, 1.5, 1.45, 0],
            [0.75, 0.35, 1.3, 1.1, 0.9, 0.3],
            [0.55, -0.95, 1.7, 0.8, 0.5, 0.6],
            [-1.05, 1.15, 0.9, 0.9, 0.65, 0.85],
          ] as const)
      ).map(([x, z, w, d, h, phase]) => ({ x, z, w, d, h, phase })),
    [compact],
  );

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  /**
   * Storey lines: horizontal loops around the unit box at even fractions of its
   * height. Built in unit space so each block's own non-uniform scale carries
   * them to the right proportions, and so all four blocks share one geometry.
   * Without these the massing is just grey boxes; with them it reads as a
   * building with floors.
   */
  const storeyGeo = useMemo(() => {
    const pts: number[] = [];
    const FLOORS = 5;
    for (let k = 1; k < FLOORS; k++) {
      const y = -0.5 + k / FLOORS;
      const c: Array<[number, number]> = [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
      ];
      for (let i = 0; i < 4; i++) {
        const [x1, z1] = c[i];
        const [x2, z2] = c[(i + 1) % 4];
        pts.push(x1, y, z1, x2, y, z2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) g.rotation.y = state.clock.elapsedTime * 0.14;

    g.children.forEach((child, i) => {
      const b = blocks[i];
      if (!b) return;
      // Each block extrudes, holds, and resets on its own offset phase.
      const raw = reduced ? 1 : ((state.clock.elapsedTime * 0.12 + b.phase) % 1) / 0.55;
      const t = THREE.MathUtils.clamp(raw, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const h = Math.max(eased * b.h, 0.001);
      child.scale.set(b.w, h, b.d);
      // Scaled from the centre, so the base has to be pushed back down to the
      // plan or the block would grow in both directions off the ground plane.
      child.position.set(b.x, h / 2 - 1, b.z);
    });
  });

  return (
    <group ref={group} scale={0.78} rotation={[0, 0.5, 0]}>
      {blocks.map((b, i) => (
        <group key={i}>
          <mesh geometry={boxGeo}>
            <meshStandardMaterial
              color="#e8eaf2"
              metalness={0.1}
              roughness={0.72}
              transparent
              opacity={0.92}
            />
          </mesh>
          <lineSegments geometry={edgeGeo}>
            <lineBasicMaterial color={CTPL_BLUE} transparent opacity={0.75} />
          </lineSegments>
          <lineSegments geometry={storeyGeo}>
            <lineBasicMaterial color={CTPL_BLUE} transparent opacity={0.3} />
          </lineSegments>
        </group>
      ))}

      {/* The plan the volumes rise out of: footprints on the ground plane. */}
      {blocks.map((b, i) => (
        <mesh key={`plan-${i}`} position={[b.x, -0.995, b.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[b.w, b.d]} />
          <meshBasicMaterial color={CTPL_RED} transparent opacity={0.14} />
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

  // Variants whose subject is a real physical object are lit neutrally: a
  // brand-coloured key light with no environment map to reflect turns a grey
  // surface into saturated plastic. The emissive variants keep the brand lights.
  const neutralLit = variant === 'engineering' || variant === 'architecture';

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
        <ambientLight intensity={neutralLit ? 0.85 : 0.7} />
        {neutralLit ? (
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
          {variant === 'ai' && <ScanVolume reduced={reduced} compact={compact} />}
          {variant === 'architecture' && (
            <ArchitectureMassing reduced={reduced} compact={compact} />
          )}
          {variant === 'data' && <DataSurface reduced={reduced} compact={compact} />}
        </Float>

        {!compact && (variant === 'engineering' || variant === 'architecture') && (
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
