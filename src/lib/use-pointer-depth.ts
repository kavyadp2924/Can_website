'use client';

import { useEffect, useRef } from 'react';

/**
 * Pointer-driven depth. Writes normalized cursor offset (`--px`, `--py`, range
 * -1..1) onto the hero section that contains the element this ref is attached
 * to, eased with rAF damping. Any descendant of that section can consume them:
 *
 *   transform: translate3d(calc(var(--px) * 30px), calc(var(--py) * 30px), 0)
 *
 * Layers use different multipliers to create parallax depth. Disabled under
 * reduced motion and on touch-only devices, where there is no cursor to follow.
 *
 * Performance notes, both measured:
 *  • The variables used to be written to :root. Custom properties inherit, so
 *    every write invalidated style for the entire document, not just the hero.
 *  • The easing loop used to run every frame forever, cursor or no cursor. It
 *    now runs only while the eased value is still catching up to the pointer.
 */
export function usePointerDepth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const node = ref.current;
    if (reduced || noHover || !node) return;

    const target = node.closest('section') ?? node;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      target.style.setProperty('--px', cx.toFixed(3));
      target.style.setProperty('--py', cy.toFixed(3));
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (event: MouseEvent) => {
      // Use viewport coordinates so depth works regardless of which element
      // mounts the hook.
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
