'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Scroll-effect toolkit.
 *
 * Everything here follows the same three rules:
 *
 *  1. Content is visible by default and only hidden once JavaScript has
 *     attached. A page that renders blank when a script fails is worse than a
 *     page with no animation.
 *  2. `prefers-reduced-motion` short-circuits every effect to its final state.
 *     Parallax and continuous motion are genuine vestibular triggers.
 *  3. Work happens in IntersectionObserver or a rAF-throttled scroll handler,
 *     never in an unthrottled scroll listener.
 */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Fires once when the element first enters the viewport. */
function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options ?? { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/* ────────────────────────────────────────────────── fade / slide ── */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSETS: Record<Direction, string> = {
  up: 'translateY(28px)',
  down: 'translateY(-28px)',
  left: 'translateX(36px)',
  right: 'translateX(-36px)',
  none: 'none',
};

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 650,
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [ready, setReady] = useState(false);

  // Only start hiding things once we know JS is running and motion is wanted.
  useEffect(() => setReady(true), []);

  const hidden = ready && !reduced && !inView;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? OFFSETS[direction] : 'none',
        transition: reduced ? undefined : `opacity ${duration}ms ease-out, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
        willChange: hidden ? 'opacity, transform' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** Staggers its direct children, so a grid assembles rather than snapping in. */
export function Stagger({
  children,
  step = 80,
  direction = 'up',
  className,
}: {
  children: ReactNode[];
  step?: number;
  direction?: Direction;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * step} direction={direction}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────── parallax ── */

/**
 * Moves its children at a fraction of scroll speed.
 *
 * Deliberately capped and subtle. Aggressive parallax is the single most common
 * way a "premium" site becomes unusable — it fights the user's scroll and makes
 * people motion-sick.
 */
export function Parallax({
  children,
  speed = 0.15,
  className,
}: {
  children: ReactNode;
  /** 0 = fixed with the page, 0.3 = noticeably slower. Values above 0.4 feel broken. */
  speed?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let visible = false;

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    observer.observe(node);

    const onScroll = () => {
      // Only compute while the element is actually on screen, and only once per
      // animation frame — a raw scroll handler runs far more often than the
      // browser can paint.
      if (!visible || frame) return;
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
        setOffset(centre * -speed);
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, speed]);

  return (
    <div ref={ref} className={className}>
      <div style={{ transform: reduced ? undefined : `translate3d(0, ${offset}px, 0)` }}>
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── counter ── */

/** Counts up to a target when scrolled into view. */
export function CountUp({
  to,
  suffix = '',
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic: fast at first, settling gently, which reads as
      // deliberate rather than mechanical.
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────── scroll progress ── */

/** Thin gradient progress bar pinned under the header. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const scrollable = document.body.scrollHeight - window.innerHeight;
        setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-ctpl-gradient transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────── tilt card ── */

/** Subtle 3D tilt toward the pointer. Disabled on touch and reduced motion. */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. Beyond ~8 it stops looking like depth and starts looking broken. */
  max?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    // Pointer-driven tilt is meaningless on touch, where there is no hover.
    if (window.matchMedia('(hover: none)').matches) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`,
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTransform('')}
      className={cn('transition-transform duration-300 ease-out', className)}
      style={{ transform: transform || undefined }}
    >
      {children}
    </div>
  );
}
