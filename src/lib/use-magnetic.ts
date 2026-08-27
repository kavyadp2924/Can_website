'use client';

import { useEffect, useRef } from 'react';

/**
 * Magnetic cursor interaction. The element eases toward the pointer while it is
 * hovered, then springs back to rest on leave. Damping is rAF-based so it never
 * snaps. Disabled for reduced-motion and touch (no hover) devices.
 */
export function useMagnetic<T extends HTMLElement = HTMLAnchorElement>(strength = 0.35) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (reduced || noHover) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength]);

  return ref;
}
