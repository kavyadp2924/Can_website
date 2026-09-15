'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Decides when a WebGL scene may exist and when it should be rendering.
 *
 *  • Nothing happens until the page has fully loaded and the browser is idle.
 *    Three.js is ~230 KB compressed and its shader compile is a long main-thread
 *    task; starting it during load froze the page for about a second on a
 *    mid-range phone and pushed every other script back.
 *  • After that, the scene mounts the first time its section nears the viewport
 *    and is then only paused/resumed — never unmounted — so scrolling back does
 *    not throw away the WebGL context and recompile every shader.
 *  • Two-core machines and data-saver connections never get WebGL. Decorative
 *    scenes can also opt out on phone-width screens, where they sit faded
 *    behind the text.
 */
export function useSceneGate(
  ref: RefObject<HTMLElement | null>,
  {
    rootMargin = '200px',
    skipOnSmallScreens = false,
    disabled = false,
  }: { rootMargin?: string; skipOnSmallScreens?: boolean; disabled?: boolean } = {},
) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || disabled) return;

    const lowPower =
      typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const smallScreen = skipOnSmallScreens && window.matchMedia('(max-width: 767px)').matches;
    if (lowPower || saveData || smallScreen) return;

    let observer: IntersectionObserver | undefined;
    let idleId = 0;
    let timeoutId = 0;

    const start = () => {
      observer = new IntersectionObserver(
        ([entry]) => {
          const visible = Boolean(entry?.isIntersecting);
          setActive(visible);
          if (visible) setMounted(true);
        },
        { rootMargin },
      );
      observer.observe(node);
    };

    const startWhenIdle = () => {
      // Safari has no requestIdleCallback.
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(start, { timeout: 2000 });
      } else {
        timeoutId = setTimeout(start, 300) as unknown as number;
      }
    };

    // Client-side navigations arrive with the document already complete.
    if (document.readyState === 'complete') startWhenIdle();
    else window.addEventListener('load', startWhenIdle, { once: true });

    return () => {
      window.removeEventListener('load', startWhenIdle);
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [ref, rootMargin, skipOnSmallScreens, disabled]);

  return { mounted, active };
}
