'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { FadeIn, Parallax } from './motion';
import { usePrefersReducedMotion } from './motion';
import { useMagnetic } from '@/lib/use-magnetic';
import { CardReveal, Reveal, ScrollBackdrop, SpotlightCard, WordReveal } from './motion-primitives';

/* ────────────────────────────────────────────────── typography ── */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-eyebrow uppercase tracking-eyebrow text-link', className)}>
      {children}
    </p>
  );
}

/**
 * Text filled with the red-to-blue gradient.
 *
 * Uses background-clip, so the text has no computable contrast ratio. Reserved
 * for large display headings — never body copy, and never anything someone must
 * read in order to act.
 */
export function GradientText({
  children,
  className,
  shimmer = false,
}: {
  children: ReactNode;
  className?: string;
  /** Animates the brand gradient across the letters for a living, premium feel. */
  shimmer?: boolean;
}) {
  return (
    <span
      className={cn(
        'bg-ctpl-gradient bg-clip-text text-transparent',
        shimmer && 'animate-shimmer',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Slow-drifting brand-colour orbs behind a section — sets an ambient,
 *  "alive" atmosphere without any hard graphics. Purely decorative. */
export function AmbientField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <span className="ctpl-orb ctpl-orb--red" />
      <span className="ctpl-orb ctpl-orb--blue" />
    </div>
  );
}

/** The CTPL "((" motif — oversized, outlined, bleeding off the section edge.
 *  With `float`, it drifts at a different rate to the scroll for depth. */
export function BracketMotif({
  side = 'left',
  float = false,
}: {
  side?: 'left' | 'right';
  float?: boolean;
}) {
  const motif = (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -top-10 select-none font-display text-[180px] font-bold leading-none text-transparent',
        side === 'left' ? '-left-2.5' : '-right-2.5 -scale-x-100',
      )}
      style={{
        WebkitTextStroke:
          side === 'left' ? '2px rgba(215,30,30,0.10)' : '2px rgba(61,107,255,0.10)',
      }}
    >
      ((
    </span>
  );

  if (!float) return motif;

  return (
    <Parallax
      speed={side === 'left' ? 0.22 : 0.3}
      className="pointer-events-none absolute inset-0"
    >
      {motif}
    </Parallax>
  );
}

/* ─────────────────────────────────────────────────── buttons ── */

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useMagnetic<HTMLAnchorElement>(0.3);
  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        'group inline-flex h-12 items-center justify-center gap-2 rounded bg-ctpl-gradient px-7 text-sm font-semibold text-white shadow-cta transition-[filter,transform] duration-ui ease-ctpl-out hover:brightness-110',
        className,
      )}
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="h-4 w-4 transition-transform duration-ui ease-ctpl-out group-hover:translate-x-1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        'group inline-flex h-12 items-center justify-center gap-2 rounded border border-border-strong bg-white/80 px-7 text-sm font-semibold text-ink backdrop-blur transition-colors duration-ui hover:bg-white',
        className,
      )}
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="h-4 w-4 transition-transform duration-ui ease-ctpl-out group-hover:translate-x-1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  );
}

/* ──────────────────────────────────────────────────── layout ── */

export function PageHero({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Trailing half of the heading, rendered in the gradient. */
  accent?: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-ctpl-hero-wash bg-surface-subtle">
      <ScrollBackdrop />
      <AmbientField className="opacity-70" />
      <BracketMotif side="left" float />
      <BracketMotif side="right" float />

      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <WordReveal
          as="h1"
          text={title}
          accent={accent}
          shimmer
          className="mt-4 text-display leading-[1.12] sm:text-display-lg"
        />
        {intro && (
          <FadeIn delay={120}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-secondary">{intro}</p>
          </FadeIn>
        )}
        {children}
      </div>
    </section>
  );
}

/** The section heading block — a mask reveal for the title, calm fade for the
 *  supporting copy. One consistent entrance across the whole site.
 *
 *  Carries its own bottom margin: it is always followed by section content, and
 *  every caller having to remember `mb-12` meant that anything rendering the
 *  heading through `Section` got no gap at all and sat flush against its cards.
 *  `cn` runs through tailwind-merge, so a caller can still override it. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  index,
  className,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  align?: 'left' | 'center';
  /** Large, faint chapter number behind the eyebrow (decorative). */
  index?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-12 max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {index && (
        <Reveal>
          <span
            aria-hidden="true"
            className="block font-display text-6xl font-bold leading-none sm:text-7xl"
            style={{ color: 'var(--ctpl-text)', opacity: 0.05 }}
          >
            {index}
          </span>
        </Reveal>
      )}
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      {title && <WordReveal text={title} className="mt-3 text-3xl sm:text-4xl" />}
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = 'default',
  wash = false,
  index,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  tone?: 'default' | 'surface';
  /** Adds a scroll-linked brand wash behind the content. */
  wash?: boolean;
  /** Large faint chapter number (decorative). */
  index?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      // scroll-mt clears the sticky header, so an #anchor does not land with the
      // heading hidden underneath it.
      className={cn(
        'relative scroll-mt-36',
        tone === 'surface' && 'border-y border-hairline bg-surface',
        className,
      )}
    >
      {wash && <ScrollBackdrop />}
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        {(eyebrow || title || intro) && (
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} index={index} />
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
  variant = 'spotlight',
}: {
  items: Array<{ title: string; desc: string }>;
  columns?: 2 | 3;
  /** spotlight = cursor glow + colour response (lively); calm = static frame (quieter). */
  variant?: 'spotlight' | 'calm';
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {items.map((item, index) => (
        // Popped in with a stagger so a row assembles rather than snapping in
        // as one block.
        <CardReveal key={item.title} delay={index * 70} className="h-full">
          <SpotlightCard className={cn('h-full', variant === 'calm' && 'motion-safe:hover:scale-100')}>
            <article className="relative h-full overflow-hidden rounded-lg border border-hairline bg-white p-6 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
              {/* Persistent faint brand line + a brighter one that draws on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-ctpl-gradient opacity-25"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-ctpl-gradient transition-transform duration-ui ease-ctpl-out group-hover:scale-x-100"
              />
              <span
                aria-hidden="true"
                className="mb-3 block font-mono text-xs font-bold text-link opacity-0 transition-opacity duration-ui group-hover:opacity-100"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </article>
          </SpotlightCard>
        </CardReveal>
      ))}
    </div>
  );
}

/**
 * Editorial alternative to cards: full-width rows with a hover-drawn brand
 * rule. Used where a wall of cards would read as generic SaaS rather than
 * considered writing.
 */
export function FeatureList({ items }: { items: Array<{ title: string; desc: string }> }) {
  return (
    <div className="border-y border-hairline">
      {items.map((item, index) => (
        <FadeIn key={item.title} delay={index * 60}>
          <div className="group relative grid gap-2 py-7 transition-[padding] duration-ui ease-ctpl-out hover:pl-3 sm:grid-cols-[16rem_1fr] sm:gap-10">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-0.5 w-0 bg-ctpl-gradient transition-[width] duration-ui ease-ctpl-out group-hover:w-full"
            />
            <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-ui group-hover:text-link">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/**
 * Sticky in-page section navigation for long, technical pages. Hidden on small
 * screens (where the page simply scrolls). Highlights the active section via an
 * IntersectionObserver and routes anchor clicks through Lenis.
 */
export function StickySectionNav({ items }: { items: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(items[0]?.id);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <div className="sticky top-[4.5rem] z-30 hidden border-b border-hairline bg-white/95 backdrop-blur-md lg:block">
      <nav aria-label="On this page" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto py-2.5">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? 'true' : undefined}
                className={cn(
                  'relative inline-flex items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-ui',
                  active === it.id
                    ? 'bg-surface text-ink'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'mr-2 inline-block h-1.5 w-1.5 rounded-full transition-colors duration-ui',
                    active === it.id ? 'bg-ctpl-gradient' : 'bg-hairline',
                  )}
                />
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function CtaBand({
  title = 'Have something to build?',
  body = 'Send us the drawings, the model, or just the problem. We will come back with an approach and a realistic timeline.',
  action = 'Start a conversation',
}: {
  title?: string;
  body?: string;
  action?: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-hairline bg-surface ctpl-wash">
      <AmbientField className="opacity-70" />
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">{body}</p>
        </Reveal>
        <PrimaryLink href="/contact/" className="shrink-0">
          {action}
        </PrimaryLink>
      </div>
    </section>
  );
}
