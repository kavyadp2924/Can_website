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
 *  • In-page anchor clicks glide to the target, offset for the sticky header
 *    and section nav.
 *  • `prefers-reduced-motion` disables smoothing entirely — the site falls back
 *    to native scrolling and every choreographed piece short-circuits to its
 *    final state.
 *  • Touch-only devices never start Lenis. It leaves touch scrolling native by
 *    default (no `syncTouch`), so on a phone it smoothed nothing — but its
 *    ticker still ran every frame for the life of the page, burning battery
 *    and main-thread time on exactly the devices least able to spare it.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const touchOnly = window.matchMedia('(hover: none)').matches;

    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;

    if (!touchOnly) {
      const instance = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Native window scrolling so sticky header / section nav stay pinned.
        wrapper: window,
      });
      instance.on('scroll', ScrollTrigger.update);
      raf = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenis = instance;
    }

    // Glide to in-page anchors (e.g. the Visualization "#experience" link).
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#') || href.length < 2) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      event.preventDefault();
      const headerH = document.querySelector('header')?.getBoundingClientRect().height ?? 72;
      const subnav = document.querySelector('[aria-label="On this page"]');
      const subH = subnav ? subnav.getBoundingClientRect().height : 0;
      const offset = headerH + subH + 12;

      if (lenis) {
        lenis.scrollTo(target, { offset: -offset });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', onClick);

    // ScrollTrigger already recalculates every trigger on window `load`. The
    // only thing that can still move the layout after that is a late web font,
    // so refresh once more only in that case. (This used to force two extra
    // full-page refreshes on every load — one on `load`, one on a 600ms timer —
    // each one a layout read for every trigger on the page.)
    let cancelled = false;
    const onLoad = () => {
      if (document.fonts.status !== 'loaded') {
        document.fonts.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      }
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelled = true;
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', onLoad);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
