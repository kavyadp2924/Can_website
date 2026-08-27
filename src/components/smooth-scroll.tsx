'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Global motion runtime.
 *
 *  • Lenis provides inertial smooth scrolling (the "premium" feel) and drives
 *    GSAP's ScrollTrigger so scroll-linked animation stays in sync with the
 *    smoothed scroll position.
 *  • In-page anchor clicks are routed through Lenis for a consistent glide.
 *  • `prefers-reduced-motion` disables smoothing entirely — the site falls back
 *    to native scrolling and every choreographed piece short-circuits to its
 *    final state.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Glide to in-page anchors (e.g. the Visualization "#experience" link).
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          event.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -80 });
        }
      }
    };
    document.addEventListener('click', onClick);

    // Recalculate trigger positions once everything (fonts, images) has settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 600);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      window.clearTimeout(timer);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
