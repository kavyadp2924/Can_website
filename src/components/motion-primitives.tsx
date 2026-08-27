'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';
import { cn } from '@/lib/cn';

/**
 * Scroll-triggered reveal built on GSAP ScrollTrigger.
 *
 * Unlike a plain fade, it can wipe in via `clip-path` (a mask reveal) and uses a
 * tuned power3 ease. Plays once when the element enters the viewport. Under
 * reduced motion it renders in its final state with no animation.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  clip = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  clip?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const vars: gsap.TweenVars = {
        opacity: 0,
        y,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      };
      if (clip) vars.clipPath = 'inset(0 0 100% 0)';
      gsap.from(el, vars);
    }, el);

    return () => ctx.revert();
  }, [reduced, delay, y, clip]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Card with a cursor-following spotlight and optional perspective tilt. The
 * lighting tracks the pointer with damping; the tilt is restrained (max ~8°).
 * Disabled for reduced-motion and touch. `calm` drops the tilt for cards that
 * should read as quieter in the visual rhythm.
 */
export function SpotlightCard({
  children,
  className,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (reduced || noHover || !tilt) return;

    let raf = 0;
    let mx = 50;
    let my = 50;
    let cmx = 50;
    let cmy = 50;
    let rx = 0;
    let ry = 0;
    let crx = 0;
    let cry = 0;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mx = ((event.clientX - rect.left) / rect.width) * 100;
      my = ((event.clientY - rect.top) / rect.height) * 100;
      if (tilt) {
        ry = ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 8;
        rx = -((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 8;
      }
    };
    const onLeave = () => {
      mx = 50;
      my = 50;
      rx = 0;
      ry = 0;
    };
    const loop = () => {
      cmx += (mx - cmx) * 0.15;
      cmy += (my - cmy) * 0.15;
      crx += (rx - crx) * 0.15;
      cry += (ry - cry) * 0.15;
      el.style.setProperty('--mx', `${cmx.toFixed(2)}%`);
      el.style.setProperty('--my', `${cmy.toFixed(2)}%`);
      if (tilt) {
        el.style.transform = `perspective(900px) rotateX(${crx.toFixed(2)}deg) rotateY(${cry.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [tilt]);

  return (
    <div
      ref={ref}
      className={cn('group relative', className)}
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '50%' } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx) var(--my), rgba(61,107,255,0.16), rgba(215,30,30,0.06) 45%, transparent 65%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(61,107,255,0.25)' }}
      />
      {children}
    </div>
  );
}

/**
 * A hairline gradient rule that draws in from the left when scrolled into view.
 * Used above statistics and between major sections for authored emphasis.
 */
export function LineReveal({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return <div ref={ref} className={cn('h-px bg-ctpl-gradient origin-left', className)} />;
}

/**
 * A gradient line that fills top-to-bottom (vertical) or left-to-right
 * (horizontal), scrubbed to scroll, to express progress through a timeline or
 * process list.
 */
export function ScrollLine({
  className,
  orientation = 'vertical',
  start = 'top 70%',
  end = 'bottom 75%',
}: {
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const from = orientation === 'horizontal' ? { scaleX: 0 } : { scaleY: 0 };
      const to = orientation === 'horizontal' ? { scaleX: 1 } : { scaleY: 1 };
      gsap.fromTo(el, from, {
        ...to,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement ?? el, start, end, scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, orientation, start, end]);

  return (
    <div
      ref={ref}
      className={cn(
        'bg-ctpl-gradient',
        orientation === 'horizontal' ? 'origin-left' : 'origin-top',
        className,
      )}
    />
  );
}

/**
 * Clip + lift reveal for imagery. Wraps a media container; the frame masks in
 * from the bottom while the content settles, reading as "discovery".
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: 'inset(0 0 14% 0)',
        y: 24,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Media frame with internal scroll parallax. The image is slightly overscaled
 * and translates within the (overflow-hidden) frame as the section scrolls,
 * giving depth without ever exposing a gap. Static under reduced motion.
 */
export function MediaFrame({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <div ref={imgRef} className="absolute inset-0 scale-110">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    </div>
  );
}

/**
 * Scroll-linked section backdrop. A brand-derived wash that drifts and deepens
 * as the section passes through the viewport — pure storytelling atmosphere,
 * never a new colour. Resolves to a calm static wash under reduced motion.
 */
export function ScrollBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -10, opacity: 0.35 },
        {
          yPercent: 10,
          opacity: 0.85,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('ctpl-wash pointer-events-none absolute inset-0 -z-10', className)}
    />
  );
}
