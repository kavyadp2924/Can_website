'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { TextPlugin } from 'gsap/TextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register once, client-side only.
// All plugins are now free (courtesy of Webflow).
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Observer, Flip, ScrollSmoother, TextPlugin, MotionPathPlugin);
}

export { gsap, ScrollTrigger, Observer, Flip, ScrollSmoother, TextPlugin, MotionPathPlugin };
