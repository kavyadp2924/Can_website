'use client';

import dynamic from 'next/dynamic';
import { useRef, type CSSProperties } from 'react';
import { AmbientField, BracketMotif, Eyebrow, GradientText, PrimaryLink, SecondaryLink } from './ui';
import { usePointerDepth } from '@/lib/use-pointer-depth';
import { useSceneGate } from '@/lib/use-scene-gate';

/**
 * The hero is the flagship motion section: a layered "initializing" sequence
 * rather than a single fade.
 *
 *   atmosphere grid ─▶ brackets settle ─▶ headline lines mask up ─▶
 *   subcopy ─▶ CTAs ─▶ meta ─▶ (once the page is idle) 3D scene fades in
 *
 * The sequence is CSS (`intro-*` in globals.css), not a GSAP timeline, so it
 * plays from the first painted frame of the static HTML rather than after
 * hydration. Pointer position drives parallax depth on the grid and the 3D
 * layer. All of it collapses to the static final state under reduced motion.
 */
const HeroScene = dynamic(() => import('./hero-scene'), { ssr: false, loading: () => null });

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const depthRef = usePointerDepth();
  // Decorative on phones (faded behind the headline), so it is skipped there.
  const { mounted: showScene, active: sceneActive } = useSceneGate(sectionRef, {
    skipOnSmallScreens: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-hairline bg-ctpl-hero-wash bg-surface-subtle"
    >
      {/* Atmosphere — a slow brand wash drifts for depth, and the grid
           parallaxes with the cursor on top of it. */}
      <div
        aria-hidden="true"
        className="ctpl-wash pointer-events-none absolute inset-0 opacity-70 motion-safe:animate-[washDrift_26s_ease-in-out_infinite]"
      />
      <AmbientField className="opacity-70" />
      <div
        aria-hidden="true"
        className="intro-fade pointer-events-none absolute inset-0"
      >
        <div className="pointer-events-none absolute inset-0 motion-safe:animate-[washDrift_20s_ease-in-out_infinite]">
          <div
            className="hero-grid absolute inset-0"
            style={{
              transform: 'translate3d(calc(var(--px, 0) * 18px), calc(var(--py, 0) * 18px), 0)',
            }}
          />
        </div>
      </div>
      {/* No fade on the brackets: at 180px they are the largest glyphs on the
          page, so fading them in delayed Largest Contentful Paint. */}
      <div className="pointer-events-none absolute inset-0">
        <BracketMotif side="left" float />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <BracketMotif side="right" float />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 lg:left-1/3 lg:opacity-100"
      >
        {/* No CSS-driven parallax here — the scene's own camera responds to the
            pointer and to scroll in true 3D, which reads as depth rather than a
            flat layer sliding on top of another. */}
        {showScene && (
          <div className="intro-fade absolute inset-0">
            <HeroScene active={sceneActive} />
          </div>
        )}
      </div>

      {/* Technical readout — reinforces "engineering viewport" rather than
          decorative 3D art. Purely atmospheric; no content lives only here. */}
      <div
        aria-hidden="true"
        style={delay(450)}
        className="intro-rise pointer-events-none absolute right-6 top-24 hidden select-none font-mono text-[11px] uppercase tracking-eyebrow text-ink-subtle sm:right-8 lg:block"
      >
        <p className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red motion-safe:animate-[pulseDot_2.4s_ease-in-out_infinite]" />
          Mesh · analysis live
        </p>
        <p className="mt-1 opacity-70">node.count 6 · shell.div 1</p>
      </div>

      <div
        ref={depthRef}
        className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2"
      >
        <div>
          <div className="intro-rise">
            <Eyebrow>Engineering · Simulation · Real-Time 3D</Eyebrow>
          </div>

          <h1 className="mt-4 max-w-2xl font-display text-display font-bold leading-[1.1] text-ink sm:text-display-lg">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-line block" style={delay(60)}>
                Proven under load.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-line block" style={delay(140)}>
                <GradientText shimmer>Shown before it exists.</GradientText>
              </span>
            </span>
          </h1>

          <p style={delay(200)} className="intro-settle mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            We design the product, validate it in simulation, and build the real-time experience
            that puts it in front of your customer — from the same model, by the same team.
          </p>

          <div style={delay(280)} className="intro-rise mt-9 flex flex-wrap gap-3.5">
            <PrimaryLink href="/work/">See what we have built</PrimaryLink>
            <SecondaryLink href="/contact/">Talk to an engineer</SecondaryLink>
          </div>

          <p
            style={delay(360)}
            className="intro-rise mt-9 text-xs font-medium uppercase tracking-eyebrow text-ink-muted"
          >
            ISO 9001:2015 certified · Coimbatore, India
          </p>
        </div>

        <div aria-hidden="true" className="hidden h-[440px] lg:block" />
      </div>
    </section>
  );
}
