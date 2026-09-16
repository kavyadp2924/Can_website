'use client';

/**
 * Route transition. App Router re-mounts this template on every navigation, so
 * a directional mask-wipe on mount gives continuity between pages without a
 * loading screen — the incoming page unmasks top-down rather than simply
 * fading, which reads as an assembled reveal instead of a blink.
 *
 * The reveal is a pure CSS animation (gated by motion-safe) rather than a
 * JS-controlled opacity state — that way the incoming page can never get stuck
 * invisible if the effect is delayed or skipped, which would otherwise read as
 * "the link didn't navigate". Under reduced motion the animation is suppressed
 * and the page is simply visible.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-[pageReveal_0.55s_cubic-bezier(0.16,1,0.3,1)]">
      {children}
    </div>
  );
}
