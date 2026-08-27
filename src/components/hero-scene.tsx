'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import { Float, Icosahedron, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

/**
 * Hero WebGL scene.
 *
 * A wireframe knot orbited by a particle field, lit in the CTPL red/blue. The
 * shapes are deliberately abstract-technical rather than a literal product —
 * the site spans engineering, archviz and gaming, so a specific object would
 * misrepresent three quarters of the work.
 *
 * Constraints this scene is built to respect:
 *
 *  • It is loaded with `next/dynamic` and `ssr: false` by the caller, so Three.js
 *    never enters the server bundle or the initial page payload.
 *  • `prefers-reduced-motion` stops all rotation. Continuous 3D motion is a real
 *    trigger for people with vestibular disorders, and a hero animation is
 *    impossible to look away from.
 *  • `dpr` is capped at 1.5 — rendering at a phone's full 3x pixel ratio burns
 *    battery for detail nobody can see.
 *  • `frameloop="demand"` is deliberately NOT used, because the scene animates
 *    continuously; instead the whole canvas unmounts once scrolled past.
 */

const CTPL_RED = '#D71E1E';
const CTPL_BLUE = '#3D6BFF';

function WireKnot(props: ThreeElements['group']) {
  const mesh = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });

  return (
    <group {...props}>
      <TorusKnot ref={mesh} args={[1.15, 0.28, 180, 32]}>
        <meshStandardMaterial
          color={CTPL_BLUE}
          wireframe
          emissive={CTPL_BLUE}
          emissiveIntensity={0.45}
          roughness={0.4}
        />
      </TorusKnot>
    </group>
  );
}

function CoreShape() {
  const mesh = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state) => {
    if (reduced || !mesh.current) return;
    // A slow breathing scale, rather than another rotation — two spinning
    // objects at different rates reads as noise.
    const t = state.clock.elapsedTime;
    const s = 0.62 + Math.sin(t * 0.8) * 0.03;
    mesh.current.scale.setScalar(s);
  });

  return (
    <Icosahedron ref={mesh} args={[1, 1]} scale={0.62}>
      <meshStandardMaterial
        color={CTPL_RED}
        emissive={CTPL_RED}
        emissiveIntensity={0.6}
        roughness={0.25}
        metalness={0.4}
        flatShading
      />
    </Icosahedron>
  );
}

function ParticleField({ count = 420 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const reduced = usePrefersReducedMotion();

  // Generated once. Rebuilding this array every render would allocate ~5k floats
  // per frame and make the garbage collector the bottleneck.
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spherical distribution, hollowed out in the middle so particles do not
      // pile up inside the knot where they would just look like fog.
      const radius = 2.6 + Math.random() * 2.4;
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
    points.current.rotation.y += delta * 0.035;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={CTPL_BLUE}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroScene() {
  const reduced = usePrefersReducedMotion();

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
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 4, 5]} intensity={1.4} color={CTPL_BLUE} />
        <directionalLight position={[-4, -2, 3]} intensity={0.9} color={CTPL_RED} />

        {/* Float adds a gentle drift; disabled entirely under reduced motion. */}
        <Float
          speed={reduced ? 0 : 1.4}
          rotationIntensity={reduced ? 0 : 0.35}
          floatIntensity={reduced ? 0 : 0.6}
        >
          <WireKnot />
          <CoreShape />
        </Float>

        <ParticleField />
      </Suspense>
    </Canvas>
  );
}
