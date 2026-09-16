'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { AmbientField, BracketMotif, Eyebrow, GradientText, PrimaryLink, SecondaryLink } from './ui';
import { usePointerDepth } from '@/lib/use-pointer-depth';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';
import type { SceneVariant } from './page-scene';

const PageScene = dynamic(() => import('./page-scene'), { ssr: false, loading: () => null });

/**
 * Hero for the capability pages, built to the same choreography as the homepage
 * hero (`hero.tsx`) so the site has one load sequence rather than four:
 *
 *   atmosphere ─▶ eyebrow ─▶ brackets ─▶ 3D scene ─▶ headline lines mask up
 *   ─▶ subcopy ─▶ body ─▶ CTAs ─▶ technical readout
 *
 * It exists as its own component rather than as options bolted onto `Hero`
 * because the homepage hero is a fixed piece of copy with a fixed two-line
 * headline, while these take arbitrary body paragraphs and a scene variant.
 * Everything shared with it — the GSAP timeline shape, the pointer-depth
 * parallax, the reduced-motion bail-out, the low-power WebGL skip — is the
 * same code path.
 */
export function FeatureHero({
  eyebrow,
  title,
  accent,
  lede,
  body,
  variant,
  primary,
  secondary,
  readout,
}: {
  eyebrow: string;
  /** First headline line, in ink. */
  title: string;
  /** Second headline line, in the brand gradient. */
  accent: string;
  /** The single lead sentence under the headline. */
  lede: string;
  /** Supporting paragraphs. Rendered at body size, below the lede. */
  body?: string[];
  variant: SceneVariant;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Two short lines of atmospheric technical metadata (desktop only). */
  readout?: [string, string];
}) {
  const [showScene, setShowScene] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const depthRef = usePointerDepth();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
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
      tl.from('[data-fh="grid"]', { opacity: 0, duration: 1.1 })
        .from('[data-fh="eyebrow"]', { opacity: 0, y: 14, duration: 0.6 }, 0.15)
        .from('[data-fh="bracket"]', { opacity: 0, duration: 0.9, stagger: 0.05 }, 0.15)
        .from(canvasWrapRef.current, { opacity: 0, scale: 0.94, duration: 1.3 }, 0.3)
        .from(
          '[data-fh="line"]',
          { yPercent: 120, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out' },
          0.45,
        )
        .from('[data-fh="lede"]', { opacity: 0, y: 22, duration: 0.8 }, '-=0.55')
        .from('[data-fh="body"]', { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, '-=0.5')
        .from('[data-fh="cta"]', { opacity: 0, y: 22, duration: 0.8 }, '-=0.45')
        .from('[data-fh="readout"]', { opacity: 0, x: 12, duration: 0.7 }, '-=0.45');
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-hairline bg-ctpl-hero-wash bg-surface-subtle"
    >
      <div
        aria-hidden="true"
        className="ctpl-wash pointer-events-none absolute inset-0 opacity-70 motion-safe:animate-[washDrift_26s_ease-in-out_infinite]"
      />
      <AmbientField className="opacity-70" />
      <div
        data-fh="grid"
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
      <div data-fh="bracket" className="pointer-events-none absolute inset-0">
        <BracketMotif side="left" float />
      </div>
      <div data-fh="bracket" className="pointer-events-none absolute inset-0">
        <BracketMotif side="right" float />
      </div>

      <div
        ref={canvasWrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.45] lg:left-[46%] lg:opacity-100"
      >
        {showScene && <PageScene variant={variant} />}
      </div>

      {readout && (
        <div
          data-fh="readout"
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-24 hidden select-none font-mono text-[11px] uppercase tracking-eyebrow text-ink-subtle sm:right-8 lg:block"
        >
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red motion-safe:animate-[pulseDot_2.4s_ease-in-out_infinite]" />
            {readout[0]}
          </p>
          <p className="mt-1 opacity-70">{readout[1]}</p>
        </div>
      )}

      <div
        ref={depthRef}
        className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2"
      >
        <div>
          <div data-fh="eyebrow">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-4 max-w-2xl font-display text-display font-bold leading-[1.1] text-ink sm:text-display-lg">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-fh="line" className="block">
                {title}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-fh="line" className="block">
                <GradientText shimmer>{accent}</GradientText>
              </span>
            </span>
          </h1>

          <p data-fh="lede" className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            {lede}
          </p>

          {body?.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              data-fh="body"
              className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted"
            >
              {paragraph}
            </p>
          ))}

          {(primary || secondary) && (
            <div data-fh="cta" className="mt-9 flex flex-wrap gap-3.5">
              {primary && <PrimaryLink href={primary.href}>{primary.label}</PrimaryLink>}
              {secondary && <SecondaryLink href={secondary.href}>{secondary.label}</SecondaryLink>}
            </div>
          )}
        </div>

        {/* Reserves the scene's column on desktop so the copy never runs under
            the canvas. Height only, no content. */}
        <div aria-hidden="true" className="hidden h-[420px] lg:block" />
      </div>
    </section>
  );
}
