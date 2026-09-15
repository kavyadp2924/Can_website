'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once, client-side only. Only ScrollTrigger is used anywhere on the
// site; registering the whole plugin set (Flip, ScrollSmoother, MotionPath…)
// shipped all of them to every page for nothing. Import others here if needed.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
