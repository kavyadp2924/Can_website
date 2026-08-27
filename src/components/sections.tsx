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
            <CardReveal key={stage.step} delay={i * 90} index={i} className="h-full">
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
        <CardReveal key={item.title} delay={i * 70} index={i} className="h-full">
          <SpotlightCard className="h-full">
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-hairline bg-white p-6 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
              <div className="flex w-full items-start justify-between">
                <span className="font-mono text-xs font-bold text-link transition-transform duration-ui ease-ctpl-out group-hover:-translate-y-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3.5 w-3.5 -translate-x-1 text-link opacity-0 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-50 bg-ctpl-gradient opacity-40 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:scale-x-100 group-hover:opacity-100"
              />
              <h3 className="mt-2 font-display text-lg font-semibold text-ink transition-colors duration-ui group-hover:text-link">
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
            <CardReveal key={stat.label} delay={i * 90} index={i}>
              <div className="group text-center transition-transform duration-ui ease-ctpl-out hover:-translate-y-1 sm:text-left">
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
        <CardReveal key={item.title} delay={i * 70} index={i} className="h-full">
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
