'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Grid, Line, Environment, ContactShadows, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from './motion';

const CTPL_RED = '#D71E1E';
const CTPL_BLUE = '#3D6BFF';

export type SceneVariant = 'engineering' | 'ai' | 'data' | 'architecture';

/* ─────────────────────────────────────────────────── engineering ── */

const BORE = 0.3;
const BOLT = [
  [-1.16, 0.6],
  [1.16, 0.6],
  [-1.16, -0.6],
  [1.16, -0.6],
] as const;

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
      hole.absarc(cx, 0, BORE, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    const slot = new THREE.Path();
    slot.absarc(0, 0, 0.2, 0, Math.PI * 2, true);
    shape.holes.push(slot);
    // Corner fixing holes — a plate with only three centre bores reads as a
    // test shape; the mounting pattern is what makes it read as a real part.
    for (const [bx, by] of BOLT) {
      const bolt = new THREE.Path();
      bolt.absarc(bx, by, 0.088, 0, Math.PI * 2, true);
      shape.holes.push(bolt);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.045,
      bevelSegments: 2,
      curveSegments: 28,
    });
    geo.center();
    return geo;
  }, []);
}

function EngineeringPart({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useBracketGeometry();
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 24), [geometry]);

  useFrame((state) => {
    if (reduced || !group.current) return;
    // Oscillates around a three-quarter view instead of spinning through a
    // full turn. A continuous spin spent much of its cycle edge-on, where a
    // 0.34-thick plate reads as a dark sliver rather than as a machined part.
    const t = state.clock.elapsedTime;
    group.current.rotation.y = 0.62 + Math.sin(t * 0.26) * 0.42;
    group.current.rotation.x = -0.42 + Math.sin(t * 0.4) * 0.07;
  });

  return (
    // The hero's canvas column is portrait (roughly 594 × 900), so at fov 42
    // only ~3.1 units of width are visible. The part is 3.0 wide, which put it
    // edge-to-edge and clipped its corners as it rotated — hence the scale.
    <group ref={group} scale={0.62} rotation={[-0.42, 0, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#c6ccd6" metalness={0.86} roughness={0.31} envMapIntensity={1.15} />
      </mesh>

      <lineSegments geometry={edges}>
        <lineBasicMaterial color={CTPL_BLUE} transparent opacity={0.55} />
      </lineSegments>
      {!compact && (
        <>
          <Line points={[[-2.35, 0, 0], [2.35, 0, 0]]} color={CTPL_RED} transparent opacity={0.34} lineWidth={1} />
          <Line points={[[0, -1.7, 0], [0, 1.7, 0]]} color={CTPL_RED} transparent opacity={0.34} lineWidth={1} />
          {[-0.82, 0.82].map((cx) => (
            <Line key={cx} points={[[cx, -1.45, 0], [cx, 1.45, 0]]} color={CTPL_BLUE} transparent opacity={0.22} lineWidth={1} />
          ))}
        </>
      )}
    </group>
  );
}

/* ────────────────────────────────────────────────────────── ai ── */

/**
 * Five agents around an orchestrator, with work passing along the links.
 *
 * The page sells five AI products built on "Multi-Agent Systems, Workflow
 * Automation", so the scene is that topology. The voxel scan that used to be
 * here depicted computer vision — one capability on the page's list rather
 * than what the page is actually about.
 */
const AGENT_COUNT = 5;

function AgentConstellation({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const packetRefs = useRef<Array<THREE.Mesh | null>>([]);

  const radius = compact ? 1.3 : 1.68;

  const agents = useMemo(
    () =>
      Array.from({ length: AGENT_COUNT }, (_, i) => {
        const a = (i / AGENT_COUNT) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a * 2) * 0.22, Math.sin(a) * radius);
      }),
    [radius],
  );

  const orbit = useMemo(
    () =>
      Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius] as [number, number, number];
      }),
    [radius],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!reduced) {
      if (ringRef.current) ringRef.current.rotation.y = t * 0.13;
      if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.34;
        coreRef.current.rotation.x = t * 0.17;
      }
      if (groupRef.current) groupRef.current.rotation.x = 0.42 + Math.sin(t * 0.2) * 0.05;
    }

    // Each packet runs out to its agent and back again, so a link reads as a
    // task dispatched and a result returned rather than as a decorative pulse.
    agents.forEach((target, i) => {
      const packet = packetRefs.current[i];
      if (!packet) return;
      const phase = reduced ? 0.55 : (t * 0.5 + i * 0.4) % 2;
      const k = phase > 1 ? 2 - phase : phase;
      packet.position.copy(target).multiplyScalar(k);
      packet.scale.setScalar(0.75 + Math.sin(k * Math.PI) * 0.55);
    });
  });

  return (
    <group ref={groupRef} rotation={[0.42, 0, 0]}>
      {/* Orchestrator */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={CTPL_RED}
          emissive={CTPL_RED}
          emissiveIntensity={0.35}
          flatShading
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color={CTPL_RED} wireframe transparent opacity={0.2} />
      </mesh>

      <group ref={ringRef}>
        <Line points={orbit} color={CTPL_BLUE} transparent opacity={0.18} lineWidth={1} />

        {agents.map((p, i) => (
          <group key={`agent-${i}`}>
            <Line
              points={[
                [0, 0, 0],
                [p.x, p.y, p.z],
              ]}
              color={CTPL_BLUE}
              transparent
              opacity={0.55}
              lineWidth={1.6}
            />
            <mesh position={p}>
              <octahedronGeometry args={[0.19, 0]} />
              <meshStandardMaterial
                color={CTPL_BLUE}
                emissive={CTPL_BLUE}
                emissiveIntensity={0.28}
                flatShading
                roughness={0.45}
              />
            </mesh>
            <mesh
              ref={(el) => {
                packetRefs.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshBasicMaterial color={CTPL_RED} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────────────── data ── */

/**
 * A feed-forward network with an activation wave running through it.
 *
 * This page is an AI/ML *training programme* — a learning path measured in
 * epochs — so the scene is a network being trained. The fitted point surface
 * that was here before described regression in the abstract and said nothing
 * about learning.
 */
const LAYERS = [4, 6, 6, 3];
const LAYER_GAP = 1.05;
const NODE_GAP = 0.42;

function NeuralTraining({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);

  const { nodes, edgePairs, edgeGeometry, dummy, idle, hot } = useMemo(() => {
    const built: Array<{ pos: THREE.Vector3; layer: number }> = [];
    LAYERS.forEach((count, layer) => {
      for (let i = 0; i < count; i++) {
        built.push({
          pos: new THREE.Vector3(
            (layer - (LAYERS.length - 1) / 2) * LAYER_GAP,
            (i - (count - 1) / 2) * NODE_GAP,
            0,
          ),
          layer,
        });
      }
    });

    const pairs: Array<[number, number]> = [];
    let base = 0;
    for (let l = 0; l < LAYERS.length - 1; l++) {
      const bStart = base + LAYERS[l];
      for (let a = 0; a < LAYERS[l]; a++) {
        for (let b = 0; b < LAYERS[l + 1]; b++) pairs.push([base + a, bStart + b]);
      }
      base += LAYERS[l];
    }

    const positions = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], i) => {
      positions.set(
        [built[a].pos.x, built[a].pos.y, 0, built[b].pos.x, built[b].pos.y, 0],
        i * 6,
      );
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3));

    return {
      nodes: built,
      edgePairs: pairs,
      edgeGeometry: geo,
      dummy: new THREE.Object3D(),
      idle: new THREE.Color(CTPL_BLUE),
      hot: new THREE.Color(CTPL_RED),
    };
  }, []);

  const nodeCount = nodes.length;
  const minX = -((LAYERS.length - 1) / 2) * LAYER_GAP;
  const maxX = ((LAYERS.length - 1) / 2) * LAYER_GAP;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Sweeps input → output and restarts, which is the direction a forward
    // pass runs. A ping-pong would read as information flowing backwards.
    const head = reduced ? maxX : minX - 0.4 + ((t * 0.8) % (maxX - minX + 1.8));

    // Bright at the wave front, decaying behind it, dark ahead of it.
    const activation = (x: number) => {
      const d = head - x;
      return d < 0 ? 0 : Math.max(0, 1 - d / 1.5);
    };

    const mesh = nodesRef.current;
    if (mesh) {
      for (let i = 0; i < nodeCount; i++) {
        const a = activation(nodes[i].pos.x);
        dummy.position.copy(nodes[i].pos);
        dummy.scale.setScalar(0.1 + a * 0.055);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, idle.clone().lerp(hot, a));
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    const colorAttr = edgeGeometry.getAttribute('color') as THREE.BufferAttribute;
    edgePairs.forEach(([a, b], i) => {
      const ca = activation(nodes[a].pos.x);
      const cb = activation(nodes[b].pos.x);
      const colA = idle.clone().lerp(hot, ca).multiplyScalar(0.3 + ca * 0.7);
      const colB = idle.clone().lerp(hot, cb).multiplyScalar(0.3 + cb * 0.7);
      colorAttr.setXYZ(i * 2, colA.r, colA.g, colA.b);
      colorAttr.setXYZ(i * 2 + 1, colB.r, colB.g, colB.b);
    });
    colorAttr.needsUpdate = true;

    if (groupRef.current && !reduced) {
      groupRef.current.rotation.y = Math.sin(t * 0.16) * 0.3;
      groupRef.current.rotation.x = Math.sin(t * 0.11) * 0.07;
    }
  });

  return (
    <group ref={groupRef} scale={compact ? 0.82 : 1}>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.5} />
      </lineSegments>
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial roughness={0.4} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/* ─────────────────────────────────────────────── architecture ── */

const WARM_LIGHT = '#ffd9a0';
const GY = -2.0;

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ── Curtain-wall facade ──
   Real 3D mullion + transom frame on a rectangular face.
   Frame protrudes outward from glass surface. */
function CurtainWall({
  faceW, faceH, cols, rows,
  glassZ, frameZ, frameAxis,
  glassMat, frameMat, geo,
}: {
  faceW: number; faceH: number; cols: number; rows: number;
  glassZ: number; frameZ: number; frameAxis: 'x' | 'z';
  glassMat: THREE.Material; frameMat: THREE.Material; geo: THREE.BoxGeometry;
}) {
  const MW = 0.035;
  const MD = 0.03;
  const TH = 0.025;
  const GD = 0.008;
  const els: React.ReactElement[] = [];

  // Glass panel (recessed)
  const gs: [number, number, number] = frameAxis === 'x'
    ? [faceW - MD * 2, faceH - MD * 2, GD]
    : [GD, faceH - MD * 2, faceW - MD * 2];
  const gp: [number, number, number] = frameAxis === 'x'
    ? [0, 0, glassZ]
    : [glassZ, 0, 0];
  els.push(<mesh key="g" geometry={geo} material={glassMat} position={gp} scale={gs} />);

  // Vertical mullions
  for (let i = 0; i <= cols; i++) {
    const x = -faceW / 2 + (faceW / cols) * i;
    const p: [number, number, number] = frameAxis === 'x' ? [x, 0, frameZ] : [frameZ, 0, x];
    const s: [number, number, number] = frameAxis === 'x' ? [MW, faceH, MD] : [MD, faceH, MW];
    els.push(<mesh key={`v${i}`} geometry={geo} material={frameMat} position={p} scale={s} />);
  }

  // Horizontal transoms
  for (let j = 0; j <= rows; j++) {
    const y = -faceH / 2 + (faceH / rows) * j;
    const p: [number, number, number] = frameAxis === 'x' ? [0, y, frameZ] : [frameZ, y, 0];
    const s: [number, number, number] = frameAxis === 'x' ? [faceW, TH, MD] : [MD, TH, faceW];
    els.push(<mesh key={`h${j}`} geometry={geo} material={frameMat} position={p} scale={s} />);
  }

  return <group>{els}</group>;
}

/* ── Window band ──
   Horizontal window strip in a concrete wall with frame + mullions */
function WindowBand({
  width, height,
  position, frameMat, glassMat, geo,
}: {
  width: number; height: number;
  position: [number, number, number];
  frameMat: THREE.Material; glassMat: THREE.Material; geo: THREE.BoxGeometry;
}) {
  const FW = 0.025;
  const FD = 0.025;
  return (
    <group position={position}>
      <mesh geometry={geo} material={glassMat} scale={[width - FW * 2, height - FW * 2, 0.008]} />
      <mesh geometry={geo} material={frameMat} scale={[width, FW, FD]} position={[0, height / 2, FD / 2]} />
      <mesh geometry={geo} material={frameMat} scale={[width, FW, FD]} position={[0, -height / 2, FD / 2]} />
      <mesh geometry={geo} material={frameMat} scale={[FW, height, FD]} position={[-width / 2, 0, FD / 2]} />
      <mesh geometry={geo} material={frameMat} scale={[FW, height, FD]} position={[width / 2, 0, FD / 2]} />
      {[-width / 3, 0, width / 3].map((x, i) => (
        <mesh key={i} geometry={geo} material={frameMat} scale={[0.02, height, FD]} position={[x, 0, FD / 2]} />
      ))}
    </group>
  );
}

function ArchitectureMassing({ reduced, compact }: { reduced: boolean; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const mats = useMemo(() => {
    const cTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#d5d8e0';
      ctx.fillRect(0, 0, 512, 512);
      const r = seeded(42);
      for (let i = 0; i < 5000; i++) {
        const v = 205 + r() * 30;
        ctx.fillStyle = `rgba(${v},${v + 1},${v + 4},0.12)`;
        ctx.beginPath();
        ctx.arc(r() * 512, r() * 512, r() * 1.2 + 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 1200; i++) {
        const v = 185 + r() * 35;
        ctx.fillStyle = `rgba(${v},${v + 2},${v + 5},0.06)`;
        ctx.fillRect(r() * 512, r() * 512, r() * 4 + 1, 1);
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    })();

    return {
      body: new THREE.MeshStandardMaterial({ map: cTex, color: '#d9dde3', roughness: 0.72, metalness: 0.04 }),
      body2: new THREE.MeshStandardMaterial({ color: '#c4cad2', roughness: 0.72, metalness: 0.04 }),
      frame: new THREE.MeshStandardMaterial({ color: '#252b33', roughness: 0.34, metalness: 0.65 }),
      frame2: new THREE.MeshStandardMaterial({ color: '#4d5662', roughness: 0.38, metalness: 0.55 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#9fb8ca', transmission: 0.88, thickness: 0.3,
        roughness: 0.14, metalness: 0.08, ior: 1.45, transparent: true,
      }),
      dark: new THREE.MeshStandardMaterial({ color: '#151a20', roughness: 0.3, metalness: 0.6 }),
      base: new THREE.MeshStandardMaterial({ color: '#aeb5be', roughness: 0.9 }),
      timber: new THREE.MeshStandardMaterial({ color: '#b08356', roughness: 0.72 }),
      stone: new THREE.MeshStandardMaterial({ color: '#e4e1da', roughness: 0.92 }),
      water: new THREE.MeshPhysicalMaterial({
        color: '#4a9ec4', transmission: 0.65, thickness: 0.4,
        roughness: 0.06, ior: 1.33, transparent: true,
      }),
      leaf: new THREE.MeshStandardMaterial({ color: '#4b7a52', roughness: 0.9, flatShading: true }),
      leafAlt: new THREE.MeshStandardMaterial({ color: '#3f6b47', roughness: 0.9, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: '#6b5136', roughness: 0.95 }),
    };
  }, []);

  const treeGeo = useMemo(
    () => ({
      cone: new THREE.ConeGeometry(1, 1, 7),
      trunk: new THREE.CylinderGeometry(0.055, 0.075, 1, 6),
    }),
    [],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) g.rotation.y += delta * 0.05;
  });

  // ════════════════════════════════════════════════════════
  // MASTER DIMENSIONS
  // ════════════════════════════════════════════════════════
  // One house, not four objects on a plate. A low glazed pavilion sets the
  // horizontal, a solid upper volume is set back from it to leave a terrace
  // and to cast a shadow line across the glass, and a slim stair core gives
  // the composition its vertical without turning it into a domino.
  const GW = 2.6, GH = 0.82, GD = 1.5;      // glazed ground pavilion
  const GT = GY + GH;                        // top of the pavilion
  const UW = 1.85, UH = 0.72, UD = 1.2;      // upper volume
  const UX = -0.3, UZ = -0.12, UB = GT + 0.07;
  // Slim enough to read as a stair core rather than a blank slab wider than
  // the house it serves, and stopped below the roof so the upper volume still
  // reads as the top of the composition.
  const SW = 0.38, SH = 1.62, SD = 0.68;     // stair core
  const SX = -GW / 2 - SW / 2 + 0.14;

  const trees: Array<[number, number, number, 0 | 1]> = [
    [-1.95, -0.95, 0.58, 0],
    [2.05, -0.72, 0.44, 1],
    [-1.62, 1.24, 0.38, 1],
    [1.88, 1.32, 0.5, 0],
  ];

  if (compact) {
    return (
      <group ref={group} scale={0.9} position={[0, 0.72, 0]} rotation={[0.1, 0.38, 0]}>
        <mesh geometry={boxGeo} material={mats.base} position={[0, GY - 0.05, 0]} scale={[3.6, 0.1, 2.6]} receiveShadow />
        {/* Pavilion */}
        <mesh geometry={boxGeo} material={mats.stone} position={[0, GY + 0.035, 0]} scale={[GW + 0.14, 0.07, GD + 0.14]} receiveShadow />
        <mesh geometry={boxGeo} material={mats.body} position={[0, GY + GH / 2, -GD / 2 + 0.04]} scale={[GW, GH, 0.08]} castShadow receiveShadow />
        <mesh geometry={boxGeo} material={mats.body2} position={[0, GT + 0.035, 0]} scale={[GW + 0.14, 0.07, GD + 0.14]} castShadow receiveShadow />
        <group position={[0, GY + GH / 2, 0]}>
          <CurtainWall faceW={GW - 0.1} faceH={GH - 0.1} cols={5} rows={1} glassZ={GD / 2 - 0.02} frameZ={GD / 2 + 0.012} frameAxis="x" glassMat={mats.glass} frameMat={mats.frame} geo={boxGeo} />
        </group>
        {/* Upper volume + roof */}
        <mesh geometry={boxGeo} material={mats.body} position={[UX, UB + UH / 2, UZ]} scale={[UW, UH, UD]} castShadow receiveShadow />
        <mesh geometry={boxGeo} material={mats.body2} position={[UX, UB + UH + 0.035, UZ]} scale={[UW + 0.24, 0.07, UD + 0.24]} castShadow receiveShadow />
        <WindowBand width={UW * 0.6} height={0.28} position={[UX + 0.12, UB + UH / 2 + 0.02, UZ + UD / 2 + 0.006]} frameMat={mats.frame} glassMat={mats.glass} geo={boxGeo} />
        {/* Stair core */}
        <mesh geometry={boxGeo} material={mats.body2} position={[SX, GY + SH / 2, UZ]} scale={[SW, SH, SD]} castShadow receiveShadow />
        <mesh geometry={boxGeo} material={mats.dark} position={[SX, GY + SH + 0.03, UZ]} scale={[SW + 0.08, 0.06, SD + 0.08]} castShadow />
        <pointLight position={[0, GY + GH / 2, 0]} intensity={4} distance={4} color={WARM_LIGHT} />
      </group>
    );
  }

  return (
    <group ref={group} scale={0.8} position={[0, 0.72, 0]} rotation={[0.1, 0.38, 0]}>

      {/* ═══ SITE ═══ */}
      {/* Kept tight to the building — a plinth much wider than the house left
          big empty white areas that read as unfinished rather than as site. */}
      <mesh geometry={boxGeo} material={mats.base} position={[0, GY - 0.06, 0.1]} scale={[4.6, 0.12, 3.4]} receiveShadow />
      <mesh geometry={boxGeo} material={mats.stone} position={[-0.1, GY + 0.005, 0.15]} scale={[3.8, 0.02, 2.6]} receiveShadow />
      {/* Approach path */}
      <mesh geometry={boxGeo} material={mats.body2} position={[0.25, GY + 0.02, 1.32]} scale={[0.55, 0.02, 0.9]} receiveShadow />

      {/* ═══ GROUND PAVILION — glazed, horizontal ═══ */}
      {/* Floor plate */}
      <mesh geometry={boxGeo} material={mats.stone} position={[0, GY + 0.035, 0]} scale={[GW + 0.16, 0.07, GD + 0.16]} receiveShadow />
      {/* Solid back and left enclosure */}
      <mesh geometry={boxGeo} material={mats.body} position={[0, GY + GH / 2, -GD / 2 + 0.04]} scale={[GW, GH, 0.08]} castShadow receiveShadow />
      <mesh geometry={boxGeo} material={mats.body} position={[-GW / 2 + 0.04, GY + GH / 2, 0]} scale={[0.08, GH, GD]} castShadow receiveShadow />
      {/* Ceiling plate — also the terrace floor above */}
      <mesh geometry={boxGeo} material={mats.body2} position={[0, GT + 0.035, 0]} scale={[GW + 0.16, 0.07, GD + 0.16]} castShadow receiveShadow />
      {/* Front glazing — few, wide panes rather than a dense grid */}
      <group position={[0, GY + GH / 2, 0]}>
        <CurtainWall
          faceW={GW - 0.1} faceH={GH - 0.1} cols={5} rows={1}
          glassZ={GD / 2 - 0.02} frameZ={GD / 2 + 0.012}
          frameAxis="x" glassMat={mats.glass} frameMat={mats.frame} geo={boxGeo}
        />
      </group>
      {/* Return glazing on the open end */}
      <group position={[0, GY + GH / 2, 0]}>
        <CurtainWall
          faceW={GD - 0.1} faceH={GH - 0.1} cols={3} rows={1}
          glassZ={GW / 2 - 0.02} frameZ={GW / 2 + 0.012}
          frameAxis="z" glassMat={mats.glass} frameMat={mats.frame} geo={boxGeo}
        />
      </group>
      <pointLight position={[0.1, GY + GH * 0.55, 0]} intensity={4.5} distance={4} color={WARM_LIGHT} />

      {/* ═══ UPPER VOLUME — set back, leaving a terrace ═══ */}
      <mesh geometry={boxGeo} material={mats.body} position={[UX, UB + UH / 2, UZ]} scale={[UW, UH, UD]} castShadow receiveShadow />
      {/* Timber panel — the one warm material, breaking up the render */}
      <mesh geometry={boxGeo} material={mats.timber} position={[UX - UW / 2 + 0.3, UB + UH / 2, UZ + UD / 2 + 0.012]} scale={[0.56, UH - 0.14, 0.02]} castShadow />
      <WindowBand
        width={UW * 0.52} height={0.3}
        position={[UX + 0.42, UB + UH / 2 + 0.02, UZ + UD / 2 + 0.008]}
        frameMat={mats.frame} glassMat={mats.glass} geo={boxGeo}
      />
      {/* Roof slab, overhanging on every side so it throws a shadow line */}
      <mesh geometry={boxGeo} material={mats.body2} position={[UX, UB + UH + 0.04, UZ]} scale={[UW + 0.26, 0.08, UD + 0.26]} castShadow receiveShadow />

      {/* ═══ TERRACE on the pavilion roof ═══ */}
      <mesh geometry={boxGeo} material={mats.timber} position={[UX + 0.28, GT + 0.09, 0.5]} scale={[2.0, 0.03, 0.42]} receiveShadow />
      {/* Glass balustrade + handrail */}
      <mesh geometry={boxGeo} material={mats.glass} position={[UX + 0.28, GT + 0.22, 0.71]} scale={[2.0, 0.24, 0.015]} />
      <mesh geometry={boxGeo} material={mats.frame2} position={[UX + 0.28, GT + 0.345, 0.71]} scale={[2.02, 0.025, 0.045]} castShadow />

      {/* ═══ STAIR CORE — the vertical ═══ */}
      <mesh geometry={boxGeo} material={mats.body2} position={[SX, GY + SH / 2, UZ]} scale={[SW, SH, SD]} castShadow receiveShadow />
      <mesh geometry={boxGeo} material={mats.dark} position={[SX, GY + SH + 0.035, UZ]} scale={[SW + 0.1, 0.07, SD + 0.1]} castShadow receiveShadow />
      {/* Full-height slot window */}
      <mesh geometry={boxGeo} material={mats.glass} position={[SX, GY + SH * 0.54, UZ + SD / 2 + 0.008]} scale={[0.15, SH * 0.66, 0.02]} />
      <mesh geometry={boxGeo} material={mats.frame} position={[SX, GY + SH * 0.54, UZ + SD / 2 + 0.016]} scale={[0.19, SH * 0.7, 0.015]} />

      {/* ═══ POOL — brought forward of the pavilion so it is actually seen
             rather than hidden behind the massing ═══ */}
      <mesh geometry={boxGeo} material={mats.stone} position={[1.62, GY + 0.035, 0.98]} scale={[1.2, 0.06, 0.9]} receiveShadow />
      <mesh geometry={boxGeo} material={mats.water} position={[1.62, GY + 0.055, 0.98]} scale={[1.0, 0.05, 0.7]} />

      {/* ═══ PLANTING ═══ */}
      {trees.map(([x, z, h, alt]) => (
        <group key={`${x}:${z}`} position={[x, GY, z]}>
          <mesh geometry={treeGeo.trunk} material={mats.trunk} position={[0, h * 0.3, 0]} scale={[1, h * 0.6, 1]} castShadow />
          <mesh
            geometry={treeGeo.cone}
            material={alt ? mats.leafAlt : mats.leaf}
            position={[0, h * 0.95, 0]}
            scale={[h * 0.42, h * 1.1, h * 0.42]}
            castShadow
          />
        </group>
      ))}
      {/* Low hedge blocks anchoring the entrance side */}
      {[-1.05, -0.5, 0.05].map((x) => (
        <mesh key={x} geometry={boxGeo} material={mats.leaf} position={[x, GY + 0.09, 1.28]} scale={[0.42, 0.16, 0.22]} castShadow receiveShadow />
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
    const targetZ = introZ - scroll.current * 0.5;

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

export default function PageScene({ variant, active = true }: { variant: SceneVariant; active?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const { pointer, scroll } = useSceneInput(reduced);

  const compact = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    [],
  );

  const neutralLit = variant === 'engineering' || variant === 'architecture';

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      // The architecture massing declares castShadow/receiveShadow throughout;
      // without this prop none of it rendered and the model read as a flat,
      // untextured CAD screenshot. Self-shadowing under the roof overhang and
      // the upper volume is most of what makes massing read as architecture.
      shadows={variant === 'architecture'}
      camera={{ position: [0, 0, 6.1], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={neutralLit ? 0.55 : 0.7} />
        {neutralLit ? (
          <>
            <directionalLight
              position={[4, 5, 6]}
              intensity={1.5}
              color="#ffffff"
              castShadow={variant === 'architecture'}
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0004}
              shadow-normalBias={0.02}
              shadow-camera-near={1}
              shadow-camera-far={20}
              shadow-camera-left={-4}
              shadow-camera-right={4}
              shadow-camera-top={4}
              shadow-camera-bottom={-4}
            />
            <directionalLight position={[-5, -1, 2]} intensity={0.45} color={CTPL_BLUE} />
            <directionalLight position={[2, -4, -3]} intensity={0.3} color={CTPL_RED} />
            <hemisphereLight args={['#dceaff', '#c8bfa8', 0.6]} />
          </>
        ) : (
          <>
            <directionalLight position={[4, 4, 5]} intensity={1.35} color={CTPL_BLUE} />
            <directionalLight position={[-4, -2, 3]} intensity={0.85} color={CTPL_RED} />
          </>
        )}

        {/* Environment for reflections. The engineering part is a metal —
            metalness without an environment to reflect renders as flat putty,
            which is exactly how the bracket read before. Built from local
            Lightformers rather than a preset, since drei's presets fetch an
            HDR from a third-party CDN at runtime (see villa-scene.tsx). */}
        {neutralLit && (
          <Environment resolution={256}>
            <Lightformer intensity={2.5} color="#dceaff" position={[0, 8, 0]} scale={[20, 20, 1]} rotation={[-Math.PI / 2, 0, 0]} />
            <Lightformer intensity={1.4} color="#fff2df" position={[10, 4, 8]} scale={[8, 8, 1]} />
            <Lightformer intensity={1} color="#c8bfa8" position={[-10, 2, -6]} scale={[8, 8, 1]} />
          </Environment>
        )}

        <Float
          speed={reduced ? 0 : 1}
          rotationIntensity={reduced ? 0 : (neutralLit ? 0.04 : 0.16)}
          floatIntensity={reduced ? 0 : (neutralLit ? 0 : 0.4)}
        >
          {variant === 'engineering' && <EngineeringPart reduced={reduced} compact={compact} />}
          {variant === 'ai' && <AgentConstellation reduced={reduced} compact={compact} />}
          {variant === 'architecture' && <ArchitectureMassing reduced={reduced} compact={compact} />}
          {variant === 'data' && <NeuralTraining reduced={reduced} compact={compact} />}
        </Float>

        {/* Contact shadows for architecture — grounds the massing. Positioned
            on its ground plane in world space: the group is scaled 0.8 and
            lifted 0.72, so GY (-2.0) lands at -0.88. */}
        {variant === 'architecture' && (
          <ContactShadows position={[0, -0.9, 0]} opacity={0.42} scale={5.5} blur={2.4} far={2.4} />
        )}

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
