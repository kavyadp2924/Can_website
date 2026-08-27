'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './motion';

/**
 * Three.js is loaded only in the browser and only once this section is near the
 * viewport. `ssr: false` keeps it out of the exported HTML entirely — the copy
 * below reads and the page is usable long before ~150 KB of renderer arrives.
 */
const VillaScene = dynamic(() => import('./villa-scene'), { ssr: false, loading: () => null });

/** Captions keyed to where the camera is along its path. */
const STAGES = [
  {
    at: 0,
    label: 'Approach',
    title: 'The site, in context',
    body: 'Massing, orientation and landscape read together — the things a plan cannot show and a single render only implies.',
  },
  {
    at: 0.3,
    label: 'Exterior',
    title: 'Facade and overhangs',
    body: 'Glazing depth, roof cantilever and the shadow they throw at four in the afternoon.',
  },
  {
    at: 0.6,
    label: 'Threshold',
    title: 'Deck and pool',
    body: 'The transition from outside to inside, where most of a design either works or does not.',
  },
  {
    at: 0.85,
    label: 'Interior',
    title: 'Living, dining, bedrooms',
    body: 'Inside at eye level, with the light and materials behaving the way they will on site.',
  },
];

export function VillaWalkthrough() {
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * Scroll position, held in a ref rather than state.
   *
   * The scene reads this every frame. Putting it in state would re-render the
   * React tree sixty times a second to move a camera that Three.js is already
   * animating imperatively.
   */
  const progress = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Two-core machines get the static fallback: a scroll-driven WebGL scene is
    // the last thing a laptop already struggling needs.
    const lowPower =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 2;

    const node = sectionRef.current;
    if (!node || lowPower) return;

    const observer = new IntersectionObserver(
      ([entry]) => setMounted(Boolean(entry?.isIntersecting)),
      { rootMargin: '300px' },
    );
    observer.observe(node);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        // How far through the tall section we are: 0 when its top hits the top
        // of the viewport, 1 when its bottom does.
        const travel = rect.height - window.innerHeight;
        const value = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
        progress.current = value;

        // The caption is React state, but it only changes four times across the
        // whole section rather than every frame.
        let next = 0;
        for (let i = 0; i < STAGES.length; i++) {
          if (value >= STAGES[i]!.at) next = i;
        }
        setStage((prev) => (prev === next ? prev : next));

        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const active = STAGES[stage]!;

  return (
    <section
      ref={sectionRef}
      aria-label="Villa walkthrough"
      // Tall enough to give the camera path room to travel. Under reduced
      // motion it collapses to a single screen, because a 320vh section whose
      // only purpose is scroll-driven animation is pure friction to someone who
      // has asked for no animation.
      className={reduced ? 'relative' : 'relative h-[320vh]'}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#eef1f5]">
        {mounted ? (
          <VillaScene progress={progress} />
        ) : (
          // Shown while the renderer loads, on low-power machines, and in the
          // exported HTML. Not a spinner — a spinner tells nobody anything.
          <div className="flex h-full items-center justify-center bg-ctpl-hero-wash bg-surface-subtle">
            <p className="px-6 text-center text-sm text-ink-muted">
              Interactive 3D walkthrough
            </p>
          </div>
        )}

        {/* Caption. aria-live so the stage change is announced rather than
            silently swapping under a screen-reader user. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div
            aria-live="polite"
            className="max-w-md rounded-xl border border-white/40 bg-white/80 p-6 shadow-raised backdrop-blur-md"
          >
            <p className="text-eyebrow uppercase tracking-eyebrow text-link">
              {active.label}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">{active.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{active.body}</p>

            {/* Progress rail — doubles as a hint that scrolling is the control. */}
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              {STAGES.map((s, index) => (
                <span
                  key={s.label}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index <= stage ? 'bg-ctpl-gradient' : 'bg-hairline'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {!reduced && (
          <p
            aria-hidden="true"
            className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-eyebrow uppercase tracking-eyebrow text-ink-subtle"
          >
            Scroll to walk through
          </p>
        )}
      </div>
    </section>
  );
}
