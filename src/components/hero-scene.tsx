'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { Float, Grid, Icosahedron, Line } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

/**
 * Hero WebGL scene — "parametric structural frame".
 *
 * A geodesic wireframe shell (the kind of subdivided-icosahedron mesh used for
 * structural domes and FEA discretisation) wraps a solid analysis core, with
 * truss lines radiating out to a handful of node points — read as load paths /
 * mesh nodes rather than decoration. A faint CAD-style grid floor underneath
 * reinforces "engineering viewport" over "abstract 3D art". This is deliberately
 * not a literal product render — the site spans engineering, archviz and
 * gaming, so a specific object would misrepresent three quarters of the work —
 * but it is unmistakably technical rather than generic.
 *
 * Constraints this scene is built to respect:
 *
 *  • It is loaded with `next/dynamic` and `ssr: false` by the caller, so Three.js
 *    never enters the server bundle or the initial page payload.
 *  • `prefers-reduced-motion` stops all rotation, pointer parallax and scroll
 *    response — it renders as a single settled frame.
 *  • `dpr` is capped at 1.5 — rendering at a phone's full 3x pixel ratio burns
 *    battery for detail nobody can see.
 *  • Pointer tracking uses a plain window listener rather than the canvas's own
 *    pointer events, because the canvas sits behind interactive page content
 *    (`pointer-events: none` on its wrapper) — R3F's built-in `state.pointer`
 *    would never fire.
 *  • `frameloop="demand"` is deliberately NOT used, because the scene animates
 *    continuously; instead the whole canvas unmounts once scrolled past.
 */

const CTPL_RED = '#D71E1E';
const CTPL_BLUE = '#3D6BFF';

function GeodesicShell(props: ThreeElements['group']) {
  const mesh = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.09;
    mesh.current.rotation.x += delta * 0.035;
  });

  return (
    <group {...props}>
      <Icosahedron ref={mesh} args={[1.5, 1]}>
        <meshStandardMaterial
          color={CTPL_BLUE}
          wireframe
          emissive={CTPL_BLUE}
          emissiveIntensity={0.35}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </Icosahedron>
    </group>
  );
}

function AnalysisCore() {
  const mesh = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!mesh.current) return;
    if (reduced) return;
    mesh.current.rotation.y -= delta * 0.16;
    // A slow breathing scale reads as "live analysis" rather than another spin.
    const t = state.clock.elapsedTime;
    const s = 0.56 + Math.sin(t * 0.8) * 0.025;
    mesh.current.scale.setScalar(s);
  });

  return (
    <Icosahedron ref={mesh} args={[1, 0]} scale={0.56}>
      <meshStandardMaterial
        color={CTPL_RED}
        emissive={CTPL_RED}
        emissiveIntensity={0.55}
        roughness={0.25}
        metalness={0.45}
        flatShading
      />
    </Icosahedron>
  );
}

/** Load-path trusses: thin lines from the core out to fixed node points on the
 *  shell, each capped with a small pulsing marker — read as FEA mesh nodes. */
function TrussNodes({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 0);
    const pos = geo.attributes.position;
    const unique: THREE.Vector3[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const key = v.toArray().map((n) => n.toFixed(1)).join(',');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(v);
      }
    }
    // Six of the twelve icosahedron vertices — enough to read as a structural
    // truss without cluttering the silhouette.
    return unique.filter((_, i) => i % 2 === 0);
  }, []);

  useFrame((state) => {
    if (reduced || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const marker = child as THREE.Mesh;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.1);
      marker.scale.setScalar(0.05 + pulse * 0.03);
    });
  });

  return (
    <group>
      {nodes.map((v, i) => (
        <Line
          key={`line-${i}`}
          points={[
            [0, 0, 0],
            [v.x, v.y, v.z],
          ]}
          color={i % 2 === 0 ? CTPL_RED : CTPL_BLUE}
          transparent
          opacity={0.28}
          lineWidth={1}
        />
      ))}
      <group ref={groupRef}>
        {nodes.map((v, i) => (
          <mesh key={`node-${i}`} position={v}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? CTPL_RED : CTPL_BLUE}
              emissive={i % 2 === 0 ? CTPL_RED : CTPL_BLUE}
              emissiveIntensity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ParticleField({ count = 320 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const reduced = usePrefersReducedMotion();

  // Generated once. Rebuilding this array every render would allocate ~4k floats
  // per frame and make the garbage collector the bottleneck.
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [count]);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    points.current.rotation.y += delta * 0.025;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={CTPL_BLUE}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Faint CAD-viewport grid floor beneath the structure — engineering context,
 *  not a literal ground plane. */
function TechnicalFloor() {
  return (
    <Grid
      position={[0, -2.1, 0]}
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
  );
}

/**
 * Drives the whole rig from pointer position and scroll progress.
 *
 * Pointer offsets the camera slightly (subtle look-around, not a full orbit);
 * scroll dollies the camera in and adds a slow extra tilt, so the geometry
 * feels like it is being approached rather than simply spinning in place. Both
 * are heavily damped — twitchy camera motion is the fastest way to make a hero
 * feel cheap. Under reduced motion the camera holds a single settled frame.
 */
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
  const damped = useRef({ x: 0, y: 0, z: 8.4 });
  const mounted = useRef(0);

  useFrame((_, delta) => {
    if (reduced) {
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
      return;
    }

    mounted.current = Math.min(mounted.current + delta, 2);
    // Cinematic settle-in: the camera starts slightly pulled back and eases to
    // its resting distance over the first ~1.4s rather than snapping there.
    const introT = Math.min(mounted.current / 1.4, 1);
    const introEase = 1 - Math.pow(1 - introT, 3);
    const restZ = 6;
    const introZ = 8.4 + (restZ - 8.4) * introEase;

    const targetX = pointer.current.x * 0.55;
    const targetY = -pointer.current.y * 0.4;
    const targetZ = introZ - scroll.current * 1.1;

    damped.current.x += (targetX - damped.current.x) * 0.045;
    damped.current.y += (targetY - damped.current.y) * 0.045;
    damped.current.z += (targetZ - damped.current.z) * 0.06;

    camera.position.set(damped.current.x, damped.current.y, damped.current.z);
    camera.rotation.z = scroll.current * -0.03;
    camera.lookAt(0, scroll.current * -0.3, 0);
  });

  return null;
}

/** Raw window-level pointer + scroll tracking, fed to the camera rig each
 *  frame. Kept outside React state entirely — this updates far too often to
 *  put through a re-render. */
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
        // Normalised 0→1 over roughly one viewport height of scroll — the hero
        // canvas unmounts shortly after that anyway (see hero.tsx).
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

export default function HeroScene() {
  const reduced = usePrefersReducedMotion();
  const { pointer, scroll } = useSceneInput(reduced);

  // Lighter scene on small/low-power viewports: fewer particles, no truss
  // nodes cluttering a small canvas.
  const compact = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    [],
  );

  return (
    <Canvas
      // Capped device pixel ratio — full 3x on a phone costs battery for detail
      // that is not visible.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // The canvas is decorative; its meaning is carried by the headline beside it.
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 4, 5]} intensity={1.4} color={CTPL_BLUE} />
        <directionalLight position={[-4, -2, 3]} intensity={0.9} color={CTPL_RED} />

        {/* Float adds a gentle drift; disabled entirely under reduced motion. */}
        <Float
          speed={reduced ? 0 : 1.1}
          rotationIntensity={reduced ? 0 : 0.22}
          floatIntensity={reduced ? 0 : 0.45}
        >
          <GeodesicShell />
          <AnalysisCore />
          {!compact && <TrussNodes reduced={reduced} />}
        </Float>

        <ParticleField count={compact ? 160 : 320} />
        {!compact && <TechnicalFloor />}

        <CameraRig pointer={pointer} scroll={scroll} reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
