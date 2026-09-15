'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { usePrefersReducedMotion } from './motion';

/**
 * Draco decoder hosted locally under public/draco (copied from
 * three/examples/jsm/libs/draco/gltf at build time — see DEPLOYMENT.md),
 * rather than drei's default CDN path. Same reasoning as villa-scene.tsx's
 * choice to build its own Lightformer environment instead of drei's
 * CDN-fetched `Environment` presets: a static export should not depend on a
 * third-party origin being reachable at runtime.
 */
useGLTF.setDecoderPath('/draco/');

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelViewerScene({ url, active = true }: { url: string; active?: boolean }) {
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#f4f5f7']} />

        <directionalLight position={[6, 8, 4]} intensity={2.2} color="#fff2df" />
        <ambientLight intensity={0.6} color="#dceaff" />
        <hemisphereLight args={['#dceaff', '#c8bfa8', 0.6]} />

        {/*
          Sample glTF files carry no consistent real-world scale — the
          product-configurator sample model, for instance, spans ~2cm while
          another spans ~30 units in the same file format. `Bounds` fits the
          camera to whatever loads instead of a hand-tuned distance per model,
          so a new .glb dropped into public/models works without also having
          to reverse-engineer its units.
        */}
        <Bounds fit clip observe margin={1.3}>
          <Center>
            <Model url={url} />
          </Center>
        </Bounds>

        {/* Local Lightformer environment — see file-level comment on why this
            avoids drei's CDN-fetched Environment presets. */}
        <Environment resolution={256}>
          <Lightformer intensity={2} color="#dceaff" position={[0, 6, 0]} scale={[10, 10, 1]} rotation={[-Math.PI / 2, 0, 0]} />
          <Lightformer intensity={1.2} color="#fff2df" position={[5, 2, 4]} scale={[5, 5, 1]} />
          <Lightformer intensity={0.8} color="#c8bfa8" position={[-5, 1, -3]} scale={[5, 5, 1]} />
        </Environment>

        <OrbitControls makeDefault enablePan={false} autoRotate={!reduced} autoRotateSpeed={0.6} />
      </Suspense>
    </Canvas>
  );
}
