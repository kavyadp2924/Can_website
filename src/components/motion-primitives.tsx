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
 * Card with a cursor-following spotlight and a consistent hover "pop" —
 * a small scale, not a position shift. The card never translates on hover
 * (no lift, no tilt): the box stays put and the feedback reads instead as a
 * gentle grow-in-place, a brightening border and a cursor-tracked glow.
 * Spotlight tracking is disabled for reduced-motion and touch, and the pop
 * itself is `motion-safe`, so hover state (the border/glow) still shows
 * without any transform running.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (reduced || noHover) return;

    let raf = 0;
    let mx = 50;
    let my = 50;
    let cmx = 50;
    let cmy = 50;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mx = ((event.clientX - rect.left) / rect.width) * 100;
      my = ((event.clientY - rect.top) / rect.height) * 100;
    };
    const onLeave = () => {
      mx = 50;
      my = 50;
    };
    const loop = () => {
      cmx += (mx - cmx) * 0.15;
      cmy += (my - cmy) * 0.15;
      el.style.setProperty('--mx', `${cmx.toFixed(2)}%`);
      el.style.setProperty('--my', `${cmy.toFixed(2)}%`);
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
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'group relative transition-transform duration-ui ease-ctpl-out motion-safe:hover:scale-[1.022]',
        className,
      )}
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
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(61,107,255,0.45)' }}
      />
      {/* Diagonal gloss sweep — clipped by the card's own overflow-hidden, so
          it only reads as a light passing across rather than a static shape. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className="absolute -inset-y-1/2 left-[-45%] w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-[rgba(61,107,255,0.10)] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[380%]"
        />
      </div>
      {children}
    </div>
  );
}

/**
 * Pop-in entrance for cards: a small scale, a slight settle-rotation and a
 * back-out overshoot, rather than a plain fade-up. Reads as an object
 * arriving and settling into place — the kind of motion a card grid needs to
 * avoid feeling like a wall of text with borders around it.
 */
export function CardReveal({
  children,
  className,
  delay = 0,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Milliseconds, matching every other reveal component's `delay` prop
   *  (e.g. `FadeIn`) — converted to seconds internally since that is what
   *  GSAP's own `delay` expects. */
  delay?: number;
  /** Alternates the settle-rotation direction so neighbouring cards do not
   *  all tilt the same way on arrival. */
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 46,
        scale: 0.92,
        rotate: index % 2 === 0 ? -1.4 : 1.4,
        duration: 0.85,
        delay: delay / 1000,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, delay, index]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Word-by-word kinetic heading — each word masks up from below on its own
 * stagger rather than the whole line fading as one block. `accent` renders as
 * a single trailing gradient chunk (matching `GradientText`) so a two-tone
 * headline like "Find the failure / on screen, not on site" keeps one
 * continuous gradient across the accent phrase instead of restarting it per
 * word. Defined here (not `ui.tsx`) so both `ui.tsx` and `sections.tsx` can
 * import it without a circular dependency.
 */
export function WordReveal({
  text,
  accent,
  as = 'h2',
  className,
  shimmer = false,
}: {
  text: string;
  /** Trailing phrase rendered in the brand gradient, as one animated unit. */
  accent?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  shimmer?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const words = text.split(' ');
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.w-inner'), {
        yPercent: 115,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, text, accent]);

  return (
    <Tag ref={ref} className={cn('font-display font-bold leading-[1.05] text-ink', className)}>
      {words.map((word, i) => (
        <span key={`w-${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className="w-inner inline-block">{word}</span>
        </span>
      )).reduce<React.ReactNode[]>((acc, node, i) => {
        if (i > 0) acc.push(' ');
        acc.push(node);
        return acc;
      }, [])}
      {accent && (
        <>
          {' '}
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className={cn('w-inner inline-block bg-ctpl-gradient bg-clip-text text-transparent', shimmer && 'animate-shimmer')}
            >
              {accent}
            </span>
          </span>
        </>
      )}
    </Tag>
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
