'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from './motion';
import { FadeIn, CountUp } from './motion';
import { Eyebrow, AmbientField } from './ui';
import { Reveal, SpotlightCard, LineReveal } from './motion-primitives';

/* ───────────────────────────── word-by-word mask reveal ── */

export function WordReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.w-inner'), {
        yPercent: 115,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, text]);

  return (
    <h2 ref={ref} className={cn('font-display font-bold leading-[1.05] text-ink', className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span className="w-inner inline-block">{word}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h2>
  );
}

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
  const [active, setActive] = useState(0);

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

  return (
    <div ref={ref}>
      <ol className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, i) => {
          const isActive = active === i;
          return (
            <li
              key={stage.step}
              data-stage={i}
              className="relative flex flex-col items-start"
            >
              <div className="mb-4 flex w-full items-center">
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold transition-all duration-ui ease-ctpl-out',
                    isActive
                      ? 'border-transparent bg-ctpl-gradient text-white shadow-cta'
                      : 'border-hairline bg-white text-ink-subtle',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {i < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="ml-3 hidden h-px flex-1 bg-gradient-to-r from-brand-blue/40 to-transparent lg:block"
                  />
                )}
              </div>
              <h3
                className={cn(
                  'font-display text-lg font-semibold transition-colors duration-ui',
                  isActive ? 'text-ink' : 'text-ink-secondary',
                )}
              >
                {stage.step}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{stage.desc}</p>
            </li>
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
        <FadeIn key={item.title} delay={i * 60}>
          <SpotlightCard className="h-full" tilt={i === 0}>
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-hairline bg-white p-6 shadow-card transition-shadow duration-ui group-hover:shadow-raised">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-0.5 bg-ctpl-gradient',
                  i === 0 ? 'opacity-100' : 'opacity-25',
                )}
              />
              <span className="font-mono text-xs font-bold text-link">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </article>
          </SpotlightCard>
        </FadeIn>
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
            <FadeIn key={stat.label} delay={i * 90}>
              <div className="text-center sm:text-left">
                <p className="font-display text-5xl font-bold tracking-tight text-ink sm:text-6xl">
                  {stat.literal ?? <CountUp to={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-eyebrow text-ink-muted">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
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
        <FadeIn key={item.title} delay={i * 70} direction={i % 2 ? 'right' : 'left'}>
          <SpotlightCard className="h-full" tilt={i === 0}>
            <article className="relative h-full overflow-hidden rounded-xl border border-hairline bg-white p-7 shadow-card transition-shadow duration-ui group-hover:shadow-raised">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-0.5 bg-ctpl-gradient',
                  i === 0 ? 'opacity-100' : 'opacity-25',
                )}
              />
              <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
            </article>
          </SpotlightCard>
        </FadeIn>
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
