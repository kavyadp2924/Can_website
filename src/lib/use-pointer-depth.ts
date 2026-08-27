'use client';

import { useEffect, useRef } from 'react';

/**
 * Pointer-driven depth. Writes normalized cursor offset (`--px`, `--py`, range
 * -1..1) onto :root, eased with rAF damping. Any descendant can consume them:
 *
 *   transform: translate3d(calc(var(--px) * 30px), calc(var(--py) * 30px), 0)
 *
 * Layers use different multipliers to create parallax depth. Disabled under
 * reduced motion.
 */
export function usePointerDepth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (event: MouseEvent) => {
      // Use viewport coordinates so depth works regardless of which element
      // mounts the hook.
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const root = document.documentElement;
      root.style.setProperty('--px', cx.toFixed(3));
      root.style.setProperty('--py', cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
