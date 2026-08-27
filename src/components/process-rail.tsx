'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';
import { cn } from '@/lib/cn';

export type ProcessStage = {
  index: string;
  title: string;
  desc: string;
};

/**
 * Scroll-driven process. A vertical rule draws as the section is read, and
 * each stage lights as it becomes the one in view. Communicates progression —
 * not decoration.
 */
export function ProcessRail({
  stages,
  className,
}: {
  stages: ProcessStage[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const line = el.querySelector<HTMLElement>('[data-rail-line]');
    const ctx = gsap.context(() => {
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 70%',
              end: 'bottom 40%',
              scrub: 0.4,
            },
          },
        );
      }

      const items = el.querySelectorAll<HTMLElement>('[data-rail-stage]');
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-hairline sm:left-[1.4rem]"
      />
      <div
        data-rail-line
        aria-hidden="true"
        className="absolute left-[1.15rem] top-4 h-[calc(100%-2rem)] w-px origin-top bg-ctpl-gradient sm:left-[1.4rem]"
        style={{ transform: reduced ? undefined : 'scaleY(0)' }}
      />

      <ol className="space-y-3 sm:space-y-4">
        {stages.map((stage, i) => {
          const on = reduced || i <= active;
          return (
            <li
              key={stage.index}
              data-rail-stage
              className={cn(
                'relative grid grid-cols-[2.8rem_1fr] gap-4 py-5 transition-opacity duration-500 sm:grid-cols-[3.2rem_1fr] sm:gap-8 sm:py-7',
                on ? 'opacity-100' : 'opacity-45',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-[1] mt-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white font-mono text-[11px] font-semibold sm:h-10 sm:w-10',
                  on
                    ? 'border-transparent text-link shadow-[0_0_0_1px_rgba(61,107,255,0.45)]'
                    : 'border-hairline text-ink-subtle',
                )}
              >
                {stage.index}
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {stage.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                  {stage.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
