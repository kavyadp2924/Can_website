'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
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
          reading as a box.
          Its bottom face sits 0.04 below the main volume's top (3.0) rather
          than exactly on it — two coplanar faces at the same Y produced
          visible z-fighting where their footprints overlapped. Embedding it
          slightly is the standard fix and is invisible at this scale. */}
      <mesh castShadow receiveShadow position={[-3, 4.36, -0.8]}>
        <boxGeometry args={[6, 2.8, 5.4]} />
        <meshStandardMaterial color="#e8e5df" roughness={0.75} />
      </mesh>

      {/* Cantilevered roof planes — same embed-to-avoid-z-fighting fix as the
          upper wing above (their bottoms shared that exact Y too). */}
      <mesh castShadow position={[-1.5, 3.11, 0.4]}>
        <boxGeometry args={[10.4, 0.3, 8.4]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-3, 5.91, -0.6]}>
        <boxGeometry args={[7, 0.28, 6.4]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.6} />
      </mesh>

      <Interior />

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
      {/* Upper-wing glazing. Sits at 1.93 — the wing's front face is at z=1.9,
          and this panel used to float 0.22 in front of it with a visible gap. */}
      <mesh position={[-3, 4.46, 1.93]}>
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
 * The interior the camera path ends inside.
 *
 * The main volume is a single `THREE.BoxGeometry`, and a box's faces are
 * back-face culled — from inside it, the walls simply are not drawn and the
 * camera sees straight out to the landscape. So the room is built as its own
 * inward-facing shell (floor, ceiling and three walls, inset just inside the
 * outer box) with the front left open to the glazing for daylight. Without
 * all five surfaces you get trees floating through the corners.
 *
 * Furnished as one open-plan living/dining space because that is what the
 * massing actually is — the caption promises "living, dining, bedrooms", and
 * a bed sits in the upper wing for the same reason.
 */

/** Room shell dimensions, inset inside the 9 × 3 × 7 main volume. */
const ROOM = { cx: -1.5, w: 8.8, h: 3, d: 6.8, cz: 0 };

function Interior() {
  const wallMat = <meshStandardMaterial color="#f0ece5" roughness={0.94} />;

  return (
    <group>
      {/* ── room shell ── */}
      {/* Oak floor */}
      <mesh receiveShadow position={[ROOM.cx, 0.05, ROOM.cz]}>
        <boxGeometry args={[ROOM.w, 0.1, ROOM.d]} />
        <meshStandardMaterial color="#c2a077" roughness={0.62} />
      </mesh>
      {/* Ceiling — a pale plane of its own, so the eye reads a lit soffit
          rather than the underside of the dark exterior roof slab */}
      <mesh receiveShadow position={[ROOM.cx, 2.92, ROOM.cz]}>
        <boxGeometry args={[ROOM.w, 0.1, ROOM.d]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.95} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[ROOM.cx, 1.5, ROOM.cz - ROOM.d / 2]}>
        <boxGeometry args={[ROOM.w, ROOM.h, 0.1]} />
        {wallMat}
      </mesh>
      {/* Side walls — the missing pieces that let the landscape show through */}
      <mesh receiveShadow position={[ROOM.cx - ROOM.w / 2, 1.5, ROOM.cz]}>
        <boxGeometry args={[0.1, ROOM.h, ROOM.d]} />
        {wallMat}
      </mesh>
      <mesh receiveShadow position={[ROOM.cx + ROOM.w / 2, 1.5, ROOM.cz]}>
        <boxGeometry args={[0.1, ROOM.h, ROOM.d]} />
        {wallMat}
      </mesh>

      {/* Artwork — the one saturated note in the room, and a focal point for
          the camera's final resting frame */}
      <mesh position={[-3.4, 1.72, -3.34]}>
        <boxGeometry args={[2.2, 1.35, 0.04]} />
        <meshStandardMaterial color="#8e8578" roughness={0.7} />
      </mesh>
      <mesh position={[-3.4, 1.72, -3.315]}>
        <boxGeometry args={[2.1, 1.25, 0.02]} />
        <meshStandardMaterial color="#e9e4da" roughness={0.9} />
      </mesh>
      {/* Two muted washes rather than one saturated rectangle — at this size a
          strong block of brand blue read as a UI element stuck on the wall */}
      <mesh position={[-3.85, 1.66, -3.305]}>
        <boxGeometry args={[0.95, 0.8, 0.01]} />
        <meshStandardMaterial color="#9aabc9" roughness={0.9} />
      </mesh>
      <mesh position={[-3.05, 1.9, -3.305]}>
        <boxGeometry args={[0.6, 0.42, 0.01]} />
        <meshStandardMaterial color="#c8b9a6" roughness={0.9} />
      </mesh>

      {/* Floor plant against the back wall, in the gap between the seating and
          the kitchen run — stood clear of the sofa, whose back otherwise hid
          the pot and left the foliage looking like it floated */}
      <mesh castShadow position={[-1.1, 0.31, -2.95]}>
        <cylinderGeometry args={[0.16, 0.12, 0.42, 10]} />
        <meshStandardMaterial color="#cfc6b8" roughness={0.85} />
      </mesh>
      {([[0, 0.68, 0, 0.26], [0.14, 0.9, 0.06, 0.19], [-0.13, 0.84, -0.07, 0.16]] as const).map(
        ([dx, dy, dz, s], i) => (
          <mesh key={i} castShadow position={[-1.1 + dx, dy, -2.95 + dz]}>
            <icosahedronGeometry args={[s, 0]} />
            <meshStandardMaterial color={i === 0 ? '#4f7a52' : '#456b48'} roughness={0.9} flatShading />
          </mesh>
        ),
      )}

      {/* ── living ── */}
      <group position={[-3.4, 0, -0.35]}>
        {/* Rug */}
        <mesh receiveShadow position={[0, 0.11, 0.85]}>
          <boxGeometry args={[3.2, 0.02, 2.4]} />
          <meshStandardMaterial color="#ddd3c4" roughness={0.95} />
        </mesh>
        {/* Sofa — seat, back, two arms */}
        <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
          <boxGeometry args={[2.4, 0.34, 0.9]} />
          <meshStandardMaterial color="#6b7482" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, 0.62, -0.36]}>
          <boxGeometry args={[2.4, 0.56, 0.18]} />
          <meshStandardMaterial color="#5c6572" roughness={0.9} />
        </mesh>
        {[-1.2, 1.2].map((x) => (
          <mesh key={x} castShadow position={[x, 0.46, -0.02]}>
            <boxGeometry args={[0.18, 0.5, 0.9]} />
            <meshStandardMaterial color="#5c6572" roughness={0.9} />
          </mesh>
        ))}
        {/* Coffee table */}
        <mesh castShadow position={[0, 0.42, 1]}>
          <boxGeometry args={[1.3, 0.06, 0.7]} />
          <meshStandardMaterial color="#8a6f4f" roughness={0.45} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.2, 1]}>
            <boxGeometry args={[0.06, 0.42, 0.06]} />
            <meshStandardMaterial color="#33383f" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
        {/* Floor lamp — parked at the far end of the sofa rather than mid-view,
            where its pole cut a dark vertical line straight through the frame */}
        <mesh position={[-1.75, 0.68, -0.25]}>
          <cylinderGeometry args={[0.03, 0.03, 1.36, 8]} />
          <meshStandardMaterial color="#33383f" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[-1.75, 1.44, -0.25]}>
          <cylinderGeometry args={[0.17, 0.13, 0.26, 12]} />
          <meshStandardMaterial color="#f5ead6" emissive={WARM} emissiveIntensity={0.55} roughness={0.9} />
        </mesh>

      </group>

      {/* ── dining — set back from the seating so the near chairs do not clip
             the frame edge at the camera's final resting position ── */}
      <group position={[1.6, 0, -1.95]}>
        <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
          <boxGeometry args={[2.1, 0.07, 1]} />
          <meshStandardMaterial color="#8a6f4f" roughness={0.42} />
        </mesh>
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.38, 0]}>
            <boxGeometry args={[0.07, 0.76, 0.8]} />
            <meshStandardMaterial color="#3a3228" roughness={0.55} />
          </mesh>
        ))}
        {[-0.6, 0, 0.6].map((x) =>
          [-0.72, 0.72].map((z) => (
            <group key={`${x}:${z}`} position={[x, 0, z]}>
              <mesh castShadow position={[0, 0.44, 0]}>
                <boxGeometry args={[0.42, 0.06, 0.42]} />
                <meshStandardMaterial color="#4a525e" roughness={0.8} />
              </mesh>
              <mesh castShadow position={[0, 0.68, z > 0 ? 0.18 : -0.18]}>
                <boxGeometry args={[0.42, 0.46, 0.06]} />
                <meshStandardMaterial color="#4a525e" roughness={0.8} />
              </mesh>
            </group>
          )),
        )}
        {/* Pendant lights over the table */}
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 1.95, 0]}>
            <cylinderGeometry args={[0.16, 0.1, 0.2, 12]} />
            <meshStandardMaterial color="#2c2c34" emissive={WARM} emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── kitchen run along the back wall ── */}
      <mesh castShadow receiveShadow position={[1.3, 0.46, -2.95]}>
        <boxGeometry args={[3.4, 0.92, 0.65]} />
        <meshStandardMaterial color="#e2ded6" roughness={0.7} />
      </mesh>
      <mesh position={[1.3, 0.94, -2.95]}>
        <boxGeometry args={[3.5, 0.05, 0.72]} />
        <meshStandardMaterial color="#43484f" roughness={0.35} metalness={0.25} />
      </mesh>

      {/* ── bedroom, in the upper wing ── */}
      <group position={[-3, 3.06, -0.6]}>
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[5.4, 0.1, 4.8]} />
          <meshStandardMaterial color="#c2a077" roughness={0.62} />
        </mesh>
        <mesh castShadow position={[0, 0.28, -0.3]}>
          <boxGeometry args={[1.9, 0.36, 2.1]} />
          <meshStandardMaterial color="#eae2d6" roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, 0.55, -1.3]}>
          <boxGeometry args={[1.9, 0.5, 0.16]} />
          <meshStandardMaterial color="#8a6f4f" roughness={0.6} />
        </mesh>
      </group>

      {/* Interior lighting — warm pools at the seating and the table, so the
          room reads as lived-in rather than as an evenly-lit white box */}
      <pointLight position={[-3.4, 1.7, 0.2]} intensity={5} distance={6} color={WARM} />
      <pointLight position={[1.6, 1.9, -1.95]} intensity={4} distance={5} color={WARM} />
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
      { pos: new THREE.Vector3(1.6, 2.0, 5.6), look: new THREE.Vector3(-2.2, 1.3, 0) },
      // Ends inside the living space, at eye height and aimed down across the
      // seating group toward the artwork. Both the height and the distance
      // matter: aiming level filled the frame with blank ceiling, and sitting
      // further back left the furniture small in a large empty room.
      { pos: new THREE.Vector3(1.0, 1.42, 1.75), look: new THREE.Vector3(-2.8, 0.85, -1.15) },
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
        {/*
          Shadow bias matters more than resolution here. A ±18 unit shadow
          camera at 1024² gives ~35mm texels at this model's scale, and the
          resulting self-shadowing showed up as a jagged black stair-step
          along the roof and ceiling edges. `normalBias` offsets the lookup
          along the surface normal, which is the correct fix for acne on
          large flat faces; the tighter frustum and 2048² map keep the
          penumbra clean rather than blocky.
        */}
        <directionalLight
          position={[12, 14, 8]}
          intensity={2.4}
          color="#fff2df"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.06}
          shadow-camera-near={1}
          shadow-camera-far={45}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
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

        {/*
          Image-based lighting for the glass and pool, built from a handful of
          `Lightformer` panels rather than an `Environment preset`. Presets
          look convenient but are not actually bundled — they fetch an HDR
          from a third-party CDN at runtime, which fails outright on a static
          export with no guaranteed network path to it (and would be a stray
          external origin even when it succeeds). This synthesises an
          equivalent soft studio environment entirely from local geometry.
        */}
        <Environment resolution={256}>
          <Lightformer intensity={2.5} color="#dceaff" position={[0, 8, 0]} scale={[20, 20, 1]} rotation={[-Math.PI / 2, 0, 0]} />
          <Lightformer intensity={1.4} color="#fff2df" position={[10, 4, 8]} scale={[8, 8, 1]} />
          <Lightformer intensity={1} color="#c8bfa8" position={[-10, 2, -6]} scale={[8, 8, 1]} />
        </Environment>

        <CameraRig progress={progress} />
      </Suspense>
    </Canvas>
  );
}
