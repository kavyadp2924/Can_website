'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { alreadyVisible } from './motion-primitives';
import { usePrefersReducedMotion } from './motion';
import { cn } from '@/lib/cn';

/** Clip-path image reveal — communicates discovery, not a generic fade. */
export function ImageReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced || alreadyVisible(el)) return;

    gsap.fromTo(
      el,
      { clipPath: 'inset(12% 12% 12% 12%)', opacity: 0.35 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        duration: 1.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      },
    );
  }, { scope: ref, dependencies: [reduced] });

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      {children}
    </div>
  );
}
