'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

/**
 * Scroll-driven villa walkthrough.
 *
 * The building is built from primitives rather than loaded from a model file.
 * That is a deliberate trade: a real GLB of the villa would be tens of megabytes
 * and would dominate the page weight, while this is a few kilobytes of geometry
 * generated at runtime. It reads as architecture — massing, glazing, overhangs,
 * pool, landscape — without pretending to be a photoreal render of the actual
 * property.
 *
 * When the real asset is ready, swap `<Villa />` for a `useGLTF` load and keep
 * everything else: the camera path, the lighting and the scroll wiring are
 * independent of what is being looked at.
 */

const WARM = '#ffd9a0';
const GLASS = '#a8c8e8';

/* ─────────────────────────────────────────────── the building ── */

function Villa() {
  return (
    <group position={[0, 0, 0]}>
      {/* Ground slab the whole composition sits on */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[22, 0.1, 18]} />
        <meshStandardMaterial color="#d8d4cc" roughness={0.95} />
      </mesh>

      {/* Main volume */}
      <mesh castShadow receiveShadow position={[-1.5, 1.5, 0]}>
        <boxGeometry args={[9, 3, 7]} />
        <meshStandardMaterial color="#f2f0ec" roughness={0.75} />
      </mesh>

      {/* Upper wing, set back and offset — the massing move that stops a box
          reading as a box */}
      <mesh castShadow receiveShadow position={[-3, 4.4, -0.8]}>
        <boxGeometry args={[6, 2.8, 5.4]} />
        <meshStandardMaterial color="#e8e5df" roughness={0.75} />
      </mesh>

      {/* Cantilevered roof planes */}
      <mesh castShadow position={[-1.5, 3.15, 0.4]}>
        <boxGeometry args={[10.4, 0.3, 8.4]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-3, 5.95, -0.6]}>
        <boxGeometry args={[7, 0.28, 6.4]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.6} />
      </mesh>

      {/* Glazing. Transmission rather than plain opacity, so the interior lights
          actually read through the glass instead of it looking like a grey panel. */}
      <mesh position={[-1.5, 1.6, 3.55]}>
        <boxGeometry args={[8.4, 2.4, 0.06]} />
        <meshPhysicalMaterial
          color={GLASS}
          transmission={0.92}
          thickness={0.4}
          roughness={0.08}
          metalness={0}
          ior={1.45}
          transparent
        />
      </mesh>
      <mesh position={[-3, 4.5, 2.15]}>
        <boxGeometry args={[5.4, 2, 0.06]} />
        <meshPhysicalMaterial
          color={GLASS}
          transmission={0.92}
          thickness={0.4}
          roughness={0.08}
          ior={1.45}
          transparent
        />
      </mesh>

      {/* Mullions — vertical rhythm is most of what makes glazing read as
          architectural rather than as a blue rectangle */}
      {[-5.2, -3.4, -1.6, 0.2, 2].map((x) => (
        <mesh key={x} position={[x, 1.6, 3.58]}>
          <boxGeometry args={[0.08, 2.4, 0.1]} />
          <meshStandardMaterial color="#2c2c34" roughness={0.5} />
        </mesh>
      ))}

      {/* Warm interior lights, visible through the glazing */}
      <pointLight position={[-2, 1.6, 1]} intensity={9} distance={9} color={WARM} />
      <pointLight position={[-4, 4.4, 0]} intensity={6} distance={7} color={WARM} />

      {/* Timber deck */}
      <mesh receiveShadow position={[-1.5, 0.02, 5.6]}>
        <boxGeometry args={[10, 0.08, 3.6]} />
        <meshStandardMaterial color="#a67c52" roughness={0.85} />
      </mesh>

      {/* Pool */}
      <mesh position={[4.6, 0.03, 4.4]}>
        <boxGeometry args={[5.4, 0.1, 3]} />
        <meshPhysicalMaterial
          color="#2e8bc0"
          transmission={0.6}
          thickness={0.8}
          roughness={0.05}
          ior={1.33}
          transparent
        />
      </mesh>
      <mesh position={[4.6, -0.04, 4.4]}>
        <boxGeometry args={[5.8, 0.12, 3.4]} />
        <meshStandardMaterial color="#e6e3dc" roughness={0.9} />
      </mesh>

      <Landscape />
    </group>
  );
}

/**
 * Trees and hedges.
 *
 * Positions are computed once from a fixed table rather than randomised, so the
 * composition is identical on every render — a randomised layout would shift
 * between the server build and the client, and between visits.
 */
function Landscape() {
  const trees = useMemo(
    () => [
      [8.4, 0, -2.5],
      [7.2, 0, -5.4],
      [-8.6, 0, -4.2],
      [-9.2, 0, 1.6],
      [-7.4, 0, 5.2],
      [9.1, 0, 1.2],
      [2.4, 0, -6.4],
      [-3.6, 0, -6.8],
    ],
    [],
  );

  return (
    <group>
      {trees.map(([x, y, z], index) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh castShadow position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.11, 0.16, 1.4, 6]} />
            <meshStandardMaterial color="#6b5136" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, 2, 0]}>
            <coneGeometry args={[1, 2.4, 7]} />
            <meshStandardMaterial
              // Slight per-tree variation so the row does not read as a clone
              // stamp, driven by index rather than randomness.
              color={index % 3 === 0 ? '#3f6b45' : index % 3 === 1 ? '#48784f' : '#395f3e'}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Low hedges framing the approach */}
      {[-6.5, -4.5, -2.5, -0.5].map((x) => (
        <mesh key={x} castShadow position={[x, 0.3, 7.8]}>
          <boxGeometry args={[1.6, 0.6, 0.7]} />
          <meshStandardMaterial color="#44704a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────── camera movement ── */

interface CameraRigProps {
  /** 0 = wide exterior, 1 = inside the living space. */
  progress: React.MutableRefObject<number>;
}

/**
 * Moves the camera along an exterior-to-interior path as the page scrolls.
 *
 * The path is a handful of keyframes rather than a spline: at this length a
 * spline buys smoothness nobody notices and makes the positions much harder to
 * adjust by hand.
 */
function CameraRig({ progress }: CameraRigProps) {
  const { camera } = useThree();
  const reduced = usePrefersReducedMotion();
  const current = useRef(0);

  const path = useMemo(
    () => [
      { pos: new THREE.Vector3(16, 9, 16), look: new THREE.Vector3(-1, 2, 0) },
      { pos: new THREE.Vector3(11, 5, 13), look: new THREE.Vector3(-1, 2, 0) },
      { pos: new THREE.Vector3(4, 3, 11), look: new THREE.Vector3(-2, 2, 0) },
      { pos: new THREE.Vector3(-1, 2.2, 6.4), look: new THREE.Vector3(-2, 1.8, 0) },
      { pos: new THREE.Vector3(-1.6, 1.7, 2.2), look: new THREE.Vector3(-3, 1.6, -3) },
    ],
    [],
  );

  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    // Ease toward the scroll position rather than snapping to it, so a fast
    // flick of the wheel becomes a glide instead of a jump cut.
    const ease = reduced ? 1 : 1 - Math.pow(0.001, delta);
    current.current += (progress.current - current.current) * ease;

    const t = THREE.MathUtils.clamp(current.current, 0, 1) * (path.length - 1);
    const index = Math.min(Math.floor(t), path.length - 2);
    const frac = t - index;

    const from = path[index]!;
    const to = path[index + 1]!;

    camera.position.lerpVectors(from.pos, to.pos, frac);
    target.lerpVectors(from.look, to.look, frac);
    camera.lookAt(target);
  });

  return null;
}

/* ────────────────────────────────────────────────── the scene ── */

export default function VillaScene({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      // Capped device pixel ratio — rendering at a phone's full 3x costs battery
      // for detail nobody can see.
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [16, 9, 16], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // Decorative: the walkthrough is described in the text beside it.
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#eef1f5']} />
        <fog attach="fog" args={['#eef1f5', 26, 52]} />

        {/* Late-afternoon sun — a low angle gives the overhangs something to
            cast, which is what makes the massing legible. */}
        <directionalLight
          position={[12, 14, 8]}
          intensity={2.4}
          color="#fff2df"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
        />
        <ambientLight intensity={0.55} color="#cfe0f5" />
        <hemisphereLight args={['#dceaff', '#c8bfa8', 0.7]} />

        <Villa />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={30}
          blur={2.2}
          far={12}
        />

        {/* Image-based lighting for the glass and pool. `preset` ships with drei
            and is bundled — no external CDN request, which matters because this
            is a static export with a strict origin policy. */}
        <Environment preset="city" />

        <CameraRig progress={progress} />
      </Suspense>
    </Canvas>
  );
}
