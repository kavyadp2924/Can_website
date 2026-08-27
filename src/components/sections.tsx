'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from './motion';
import { FadeIn, CountUp } from './motion';
import { Eyebrow, AmbientField } from './ui';
import { CardReveal, LineReveal, SpotlightCard, WordReveal } from './motion-primitives';

export { WordReveal };


/* ───────────────────────────── editorial statement ── */

export function StatementSection({
  eyebrow,
  heading,
  paragraphs,
  wash = false,
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  wash?: boolean;
}) {
  return (
    <section className="relative scroll-mt-24 overflow-hidden">
      {wash && (
        <>
          <div
            aria-hidden="true"
            className="ctpl-wash pointer-events-none absolute inset-0 opacity-60 motion-safe:animate-[washDrift_30s_ease-in-out_infinite]"
          />
          <AmbientField className="opacity-60" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <Eyebrow>{eyebrow}</Eyebrow>
        <WordReveal
          text={heading}
          className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl"
        />
        <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-ink-secondary">
          {paragraphs.map((p, i) => (
            <FadeIn key={i} delay={i * 120}>
              <p>{p}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── process pipeline ── */

export function ProcessPipeline({
  stages,
}: {
  stages: Array<{ step: string; desc: string }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>('[data-stage]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.stage));
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // The connecting rail draws left-to-right as the whole strip scrolls
  // through view, independent of which stage is "active" — a sense of the
  // whole pipeline advancing, not just a colour flip per card.
  useEffect(() => {
    const root = ref.current;
    const rail = railRef.current;
    if (!root || !rail || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rail,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top 75%', end: 'bottom 55%', scrub: 0.4 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[1.375rem] hidden h-px bg-hairline lg:block"
      />
      <div
        ref={railRef}
        aria-hidden="true"
        className="absolute left-0 right-0 top-[1.375rem] hidden h-px origin-left bg-ctpl-gradient lg:block"
        style={{ transform: reduced ? undefined : 'scaleX(0)' }}
      />
      <ol className="relative grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, i) => {
          const isActive = active === i;
          return (
            <CardReveal key={stage.step} delay={i * 90} className="h-full">
              <li data-stage={i} className="group relative flex h-full flex-col items-start">
                <div className="mb-4 flex w-full items-center">
                  <span
                    className={cn(
                      'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white font-mono text-xs font-bold transition-all duration-ui ease-ctpl-out',
                      isActive
                        ? 'scale-110 border-transparent bg-ctpl-gradient text-white shadow-cta'
                        : 'border-hairline text-ink-subtle group-hover:scale-105 group-hover:border-card-hover-edge group-hover:text-link',
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full bg-ctpl-gradient opacity-40 motion-safe:animate-ping"
                      />
                    )}
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3
                  className={cn(
                    'font-display text-lg font-semibold transition-colors duration-ui',
                    isActive ? 'text-ink' : 'text-ink-secondary group-hover:text-ink',
                  )}
                >
                  {stage.step}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{stage.desc}</p>
              </li>
            </CardReveal>
          );
        })}
      </ol>
    </div>
  );
}

/* ───────────────────────────── disciplines showcase ── */

export function DisciplinesShowcase({
  items,
}: {
  items: Array<{ title: string; desc: string }>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <CardReveal key={item.title} delay={i * 70} className="h-full">
          <SpotlightCard className="h-full">
            {/* Content flows from the top with explicit gaps. `justify-between`
                here would spread the number, title and body to the card's full
                height, so a short card and a tall one in the same row would
                have visibly different internal spacing. */}
            <article className="relative flex h-full flex-col gap-2 overflow-hidden rounded-lg border border-hairline bg-white p-6 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-50 bg-ctpl-gradient opacity-40 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:scale-x-100 group-hover:opacity-100"
              />
              <div className="flex w-full items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-link transition-transform duration-ui ease-ctpl-out group-hover:-translate-y-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-link opacity-0 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </article>
          </SpotlightCard>
        </CardReveal>
      ))}
    </div>
  );
}

/* ───────────────────────────── statistics band ── */

export function StatsBand({
  stats,
}: {
  stats: Array<{ value: number; suffix: string; label: string; literal?: string }>;
}) {
  return (
    <section className="relative overflow-hidden border-y border-hairline bg-surface-subtle ctpl-wash">
      <AmbientField className="opacity-60" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <LineReveal className="mb-12 max-w-xs" />
        <div className="grid gap-10 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <CardReveal key={stat.label} delay={i * 90}>
              {/* Responds in place, like every other card surface on the site —
                  a translate here would be the one element that jumps. */}
              <div className="group text-center sm:text-left">
                <p className="font-display text-5xl font-bold tracking-tight text-ink sm:text-6xl">
                  {stat.literal ?? <CountUp to={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-eyebrow text-ink-muted">
                  <span className="inline-block h-px w-4 -translate-y-1.5 bg-brand-blue align-middle transition-[width] duration-ui ease-ctpl-out group-hover:w-7" />{' '}
                  {stat.label}
                </p>
              </div>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── audiences showcase ── */

export function AudiencesShowcase({
  items,
}: {
  items: Array<{ title: string; desc: string }>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item, i) => (
        <CardReveal key={item.title} delay={i * 70} className="h-full">
          <SpotlightCard className="h-full">
            <article className="relative h-full overflow-hidden rounded-xl border border-hairline bg-white p-7 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-50 bg-ctpl-gradient opacity-40 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:scale-x-100 group-hover:opacity-100"
              />
              <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
              <span
                aria-hidden="true"
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-eyebrow text-link opacity-0 transition-opacity duration-ui group-hover:opacity-100"
              >
                Where this fits
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3 transition-transform duration-ui ease-ctpl-out group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </article>
          </SpotlightCard>
        </CardReveal>
      ))}
    </div>
  );
}

/* ───────────────────────────── stage flow (pipelines) ── */

/**
 * A named pipeline, drawn as a vertical chain that fills as it is read.
 *
 * Used for the product workflows on the AI page — `2D FLOOR PLAN → SPACE
 * DETECTION → … → INTERACTIVE WALKTHROUGH` and the rest. Vertical rather than
 * horizontal at every breakpoint on purpose: the longest of these is eight
 * stages, and a horizontal chain that long either wraps (breaking the
 * connector) or shrinks the labels past reading size on a phone.
 *
 * The rail is scrubbed to scroll; each stage lights as it passes the middle of
 * the viewport. Under reduced motion the rail is drawn complete and every stage
 * renders in its lit state, so the sequence still reads.
 */
export function StageFlow({
  stages,
  className,
}: {
  stages: string[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('[data-flow-stage]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive((prev) => Math.max(prev, Number((entry.target as HTMLElement).dataset.flowStage)));
          }
        });
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: 0 },
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    const rail = railRef.current;
    if (!el || !rail || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rail,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.4 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="absolute bottom-5 left-[0.6875rem] top-5 w-px bg-hairline"
      />
      <div
        ref={railRef}
        aria-hidden="true"
        className="absolute left-[0.6875rem] top-5 h-[calc(100%-2.5rem)] w-px origin-top bg-ctpl-gradient"
        style={{ transform: reduced ? undefined : 'scaleY(0)' }}
      />
      <ol className="relative space-y-1">
        {stages.map((stage, i) => {
          const on = reduced || i <= active;
          return (
            <li
              key={stage}
              data-flow-stage={i}
              className="grid grid-cols-[1.375rem_1fr] items-center gap-x-4 py-2.5"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-[1] flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border bg-white transition-all duration-ui ease-ctpl-out',
                  on ? 'border-transparent shadow-[0_0_0_1px_rgba(61,107,255,0.45)]' : 'border-hairline',
                )}
              >
                <span
                  className={cn(
                    'block rounded-full transition-all duration-ui ease-ctpl-out',
                    on ? 'h-2 w-2 bg-ctpl-gradient' : 'h-1.5 w-1.5 bg-hairline',
                  )}
                />
              </span>
              <span
                className={cn(
                  'font-mono text-[11px] font-semibold uppercase leading-snug tracking-eyebrow transition-colors duration-ui sm:text-xs',
                  on ? 'text-ink' : 'text-ink-subtle',
                )}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ───────────────────────────── tag grid ── */

/**
 * A grid of short labels — job titles, tool names — that resolve in sequence.
 *
 * These are lists of nouns with no supporting copy, so they get a tighter
 * treatment than a card: a bordered chip that takes the same brand-blue hover
 * response as every other surface, and a monospace index that reinforces the
 * technical register.
 */
export function TagGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <CardReveal key={item} delay={i * 60}>
          <li className="group flex items-center gap-3 rounded-lg border border-hairline bg-white px-4 py-3.5 shadow-card transition-[box-shadow,border-color,background-color,transform] duration-ui ease-ctpl-out hover:border-card-hover-edge hover:bg-card-hover hover:shadow-raised motion-safe:hover:scale-[1.02]">
            <span
              aria-hidden="true"
              className="font-mono text-[11px] font-bold text-link transition-colors duration-ui"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              aria-hidden="true"
              className="h-4 w-px shrink-0 bg-hairline transition-colors duration-ui group-hover:bg-card-hover-edge"
            />
            <span className="text-sm font-semibold leading-snug text-ink transition-colors duration-ui group-hover:text-link">
              {item}
            </span>
          </li>
        </CardReveal>
      ))}
    </ul>
  );
}

/* ───────────────────────────── capability list ── */

/**
 * A titled list of capabilities — the "Services Include" / "Analysis
 * Capabilities" blocks. Each row draws its own marker as it arrives, so a long
 * list assembles rather than appearing whole.
 */
export function CapabilityList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-6 shadow-card sm:p-8">
      <span aria-hidden="true" className="mb-5 block h-0.5 w-16 bg-ctpl-gradient" />
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <FadeIn key={item} delay={i * 55}>
            <li className="group flex gap-3 text-sm leading-relaxed text-ink-secondary">
              <span
                aria-hidden="true"
                className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-ctpl-gradient transition-transform duration-ui ease-ctpl-out group-hover:scale-150"
              />
              {item}
            </li>
          </FadeIn>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────────── scroll-active wrapper ── */

export function ScrollActive({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && (entry.intersectionRatio ?? 0) > 0.4),
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.4, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <li ref={ref} className={cn(className, active && 'is-active')}>
      {children}
    </li>
  );
}
