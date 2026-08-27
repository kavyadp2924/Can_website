'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { AmbientField, BracketMotif, Eyebrow, GradientText, PrimaryLink, SecondaryLink } from './ui';
import { usePointerDepth } from '@/lib/use-pointer-depth';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';

/**
 * The hero is the flagship motion section: a layered "initializing" sequence
 * rather than a single fade.
 *
 *   atmosphere grid ─▶ brackets settle ─▶ 3D scene fades in ─▶
 *   headline mask-reveals line by line ─▶ subcopy ─▶ CTAs ─▶ meta
 *
 * Pointer position drives parallax depth on the grid and the 3D layer. All of
 * it collapses to the static final state under reduced motion.
 */
const HeroScene = dynamic(() => import('./hero-scene'), { ssr: false, loading: () => null });

export function Hero() {
  const [showScene, setShowScene] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const depthRef = usePointerDepth();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Skip WebGL on machines reporting very few cores.
    const lowPower =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 2;
    if (lowPower) return;

    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowScene(Boolean(entry?.isIntersecting)),
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-hero="eyebrow"]', { opacity: 0, y: 14, duration: 0.6 })
        .from('[data-hero="bracket-l"]', { opacity: 0, duration: 0.9 }, 0)
        .from('[data-hero="bracket-r"]', { opacity: 0, duration: 0.9 }, 0)
        .from(canvasWrapRef.current, { opacity: 0, duration: 1.3 }, 0.1)
        .from(
          '[data-hero="line"]',
          { yPercent: 120, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out' },
          0.25,
        )
        .from('[data-hero="sub"]', { opacity: 0, y: 22, duration: 0.8 }, '-=0.55')
        .from('[data-hero="cta"]', { opacity: 0, y: 22, duration: 0.8 }, '-=0.55')
        .from('[data-hero="meta"]', { opacity: 0, y: 14, duration: 0.6 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

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
        className="pointer-events-none absolute inset-0 motion-safe:animate-[washDrift_20s_ease-in-out_infinite]"
      >
        <div
          className="hero-grid absolute inset-0"
          style={{
            transform: 'translate3d(calc(var(--px, 0) * 18px), calc(var(--py, 0) * 18px), 0)',
          }}
        />
      </div>
      <div data-hero="bracket-l" className="pointer-events-none absolute inset-0">
        <BracketMotif side="left" float />
      </div>
      <div data-hero="bracket-r" className="pointer-events-none absolute inset-0">
        <BracketMotif side="right" float />
      </div>

      <div
        ref={canvasWrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 lg:left-1/3 lg:opacity-100"
        style={{ transform: 'translate3d(calc(var(--px, 0) * 34px), calc(var(--py, 0) * 34px), 0)' }}
      >
        {showScene && <HeroScene />}
      </div>

      <div
        ref={depthRef}
        className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2"
      >
        <div>
          <div data-hero="eyebrow">
            <Eyebrow>Engineering · Simulation · Real-Time 3D</Eyebrow>
          </div>

          <h1 className="mt-4 max-w-2xl font-display text-display font-bold leading-[1.1] text-ink sm:text-display-lg">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero="line" className="block">
                Proven under load.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero="line" className="block">
                <GradientText shimmer>Shown before it exists.</GradientText>
              </span>
            </span>
          </h1>

          <p data-hero="sub" className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            We design the product, validate it in simulation, and build the real-time experience
            that puts it in front of your customer — from the same model, by the same team.
          </p>

          <div data-hero="cta" className="mt-9 flex flex-wrap gap-3.5">
            <PrimaryLink href="/work/">See what we have built</PrimaryLink>
            <SecondaryLink href="/contact/">Talk to an engineer</SecondaryLink>
          </div>

          <p data-hero="meta" className="mt-9 text-xs font-medium uppercase tracking-eyebrow text-ink-muted">
            ISO 9001:2015 certified · Coimbatore, India
          </p>
        </div>

        <div aria-hidden="true" className="hidden h-[440px] lg:block" />
      </div>
    </section>
  );
}
