'use client';

import dynamic from 'next/dynamic';
import { useRef, type CSSProperties } from 'react';
import { AmbientField, BracketMotif, Eyebrow, GradientText, PrimaryLink, SecondaryLink } from './ui';
import { usePointerDepth } from '@/lib/use-pointer-depth';
import { useSceneGate } from '@/lib/use-scene-gate';
import type { SceneVariant } from './page-scene';

const PageScene = dynamic(() => import('./page-scene'), { ssr: false, loading: () => null });

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * Hero for the capability pages, built to the same choreography as the homepage
 * hero (`hero.tsx`) so the site has one load sequence rather than four:
 *
 *   atmosphere ─▶ eyebrow ─▶ brackets ─▶ headline lines mask up ─▶ subcopy
 *   ─▶ body ─▶ CTAs ─▶ technical readout ─▶ (once idle) 3D scene
 *
 * It exists as its own component rather than as options bolted onto `Hero`
 * because the homepage hero is a fixed piece of copy with a fixed two-line
 * headline, while these take arbitrary body paragraphs and a scene variant.
 * Everything shared with it — the CSS intro sequence, the pointer-depth
 * parallax, the reduced-motion bail-out, the deferred WebGL gate — is the
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
      <div
        aria-hidden="true"
        className="ctpl-wash pointer-events-none absolute inset-0 opacity-70 motion-safe:animate-[washDrift_26s_ease-in-out_infinite]"
      />
      <AmbientField className="opacity-70" />
      <div aria-hidden="true" className="intro-fade pointer-events-none absolute inset-0">
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
        className="pointer-events-none absolute inset-0 opacity-[0.45] lg:left-[46%] lg:opacity-100"
      >
        {showScene && (
          <div className="intro-fade absolute inset-0">
            <PageScene variant={variant} active={sceneActive} />
          </div>
        )}
      </div>

      {readout && (
        <div
          aria-hidden="true"
          style={delay(450)}
          className="intro-rise pointer-events-none absolute right-6 top-24 hidden select-none font-mono text-[11px] uppercase tracking-eyebrow text-ink-subtle sm:right-8 lg:block"
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
        className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2"
      >
        <div>
          <div className="intro-rise">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-4 max-w-2xl font-display text-display font-bold leading-[1.1] text-ink sm:text-display-lg">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-line block" style={delay(60)}>
                {title}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="intro-line block" style={delay(140)}>
                <GradientText shimmer>{accent}</GradientText>
              </span>
            </span>
          </h1>

          <p style={delay(200)} className="intro-settle mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            {lede}
          </p>

          {body?.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              style={delay(260)}
              className="intro-settle mt-4 max-w-xl text-base leading-relaxed text-ink-muted"
            >
              {paragraph}
            </p>
          ))}

          {(primary || secondary) && (
            <div style={delay(320)} className="intro-rise mt-9 flex flex-wrap gap-3.5">
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
