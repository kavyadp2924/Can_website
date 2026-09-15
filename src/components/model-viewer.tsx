'use client';

import { Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import Image from 'next/image';
import { usePrefersReducedMotion } from './motion';
import { useSceneGate } from '@/lib/use-scene-gate';

/**
 * Three.js is loaded only in the browser, only after the page has loaded, and
 * only once this section is near the viewport — the same `useSceneGate` every
 * other 3D component on this site uses (hero.tsx, feature-hero.tsx,
 * villa-walkthrough.tsx).
 */
const ModelViewerScene = dynamic(() => import('./model-viewer-scene'), { ssr: false, loading: () => null });

class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ModelViewer({
  url,
  poster,
  label = 'Interactive 3D model',
  className,
}: {
  /** Path to a .glb file under public/models. */
  url: string;
  /** Static image shown before the viewer mounts and under reduced motion. */
  poster?: string;
  label?: string;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Two-core machines, data-saver and reduced motion get the static poster.
  const { mounted, active: sceneActive } = useSceneGate(sectionRef, { disabled: reduced });

  const fallback = poster ? (
    <Image src={poster} alt={label} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center bg-ctpl-hero-wash bg-surface-subtle">
      <p className="px-6 text-center text-sm text-ink-muted">{label}</p>
    </div>
  );

  return (
    <div ref={sectionRef} className={className}>
      <div className="relative h-full w-full overflow-hidden">
        {mounted ? (
          <ModelErrorBoundary fallback={fallback}>
            <ModelViewerScene url={url} active={sceneActive} />
          </ModelErrorBoundary>
        ) : (
          fallback
        )}
        {mounted && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink-muted"
          >
            Drag to rotate · scroll to zoom
          </p>
        )}
      </div>
    </div>
  );
}
