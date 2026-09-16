'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';

/**
 * The multi-agent topology for the inventory platform: specialist agents around
 * a central coordinator, with the links between them drawing on entry and a
 * signal running each link afterwards.
 *
 * One SVG rather than positioned divs, so the connecting lines are real
 * geometry that stays attached to the nodes at every breakpoint instead of
 * absolute offsets that need re-tuning per viewport. The whole thing scales
 * with its container via `viewBox`.
 *
 * Reduced motion renders the finished topology with no draw-in and no
 * travelling signals.
 */

/**
 * Node positions are chosen so that every pill — including the widest label,
 * "Sales Intelligence" — sits fully inside the viewBox. `pillWidth` below is the
 * same formula used to lay the pills out, so the two cannot drift apart.
 */
const AGENTS = [
  { label: 'Inventory Agent', x: 280, y: 42 },
  { label: 'Procurement', x: 92, y: 150 },
  { label: 'Sales Intelligence', x: 468, y: 150 },
  { label: 'Warehouse Agent', x: 280, y: 250 },
  { label: 'Analytics', x: 280, y: 318 },
];

const HUB = { x: 280, y: 150 };

/** Wide enough for the label plus the status dot and its padding. */
const pillWidth = (label: string) => Math.max(label.length * 5.9 + 38, 96);

export function AgentHub() {
  const root = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
      tl.from('[data-hub-link]', {
        strokeDashoffset: 1,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power2.out',
      })
        .from(
          '[data-hub-node]',
          { opacity: 0, scale: 0.8, transformOrigin: 'center', duration: 0.5, stagger: 0.07 },
          '-=0.6',
        )
        .to('[data-hub-pulse]', {
          opacity: 1,
          duration: 0.3,
        });

      // A signal runs each link on its own phase once the topology has settled.
      gsap.to('[data-hub-pulse]', {
        keyframes: [{ scale: 1.6, opacity: 0.15 }, { scale: 1, opacity: 0.55 }],
        transformOrigin: 'center',
        duration: 2.6,
        repeat: -1,
        stagger: 0.35,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <svg
      ref={root}
      viewBox="0 0 560 350"
      role="img"
      aria-label="Five specialist agents — inventory, procurement, sales intelligence, warehouse and analytics — connected to a central AI coordinator."
      className="mx-auto block w-full max-w-lg"
    >
      <g data-hub-links>
        {AGENTS.map((agent) => (
          <line
            key={agent.label}
            data-hub-link
            x1={HUB.x}
            y1={HUB.y}
            x2={agent.x}
            y2={agent.y}
            stroke="#3D6BFF"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            pathLength={1}
            strokeDasharray={1}
          />
        ))}
      </g>

      {AGENTS.map((agent) => (
        <circle
          key={`p-${agent.label}`}
          data-hub-pulse
          cx={(HUB.x + agent.x) / 2}
          cy={(HUB.y + agent.y) / 2}
          r="3"
          fill="#D71E1E"
          opacity={reduced ? 0.55 : 0}
        />
      ))}

      {/* Central coordinator */}
      <g data-hub-node>
        <circle cx={HUB.x} cy={HUB.y} r="46" fill="#ffffff" stroke="#3D6BFF" strokeWidth="1.5" />
        <circle cx={HUB.x} cy={HUB.y} r="37" fill="none" stroke="#D71E1E" strokeWidth="0.8" strokeDasharray="3 4" />
        <text
          x={HUB.x}
          y={HUB.y - 2}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#16161d"
        >
          CENTRAL
        </text>
        <text
          x={HUB.x}
          y={HUB.y + 12}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#3D6BFF"
        >
          AI
        </text>
      </g>

      {AGENTS.map((agent) => {
        const w = pillWidth(agent.label);
        const left = agent.x - w / 2;
        return (
          <g key={`n-${agent.label}`} data-hub-node>
            <rect
              x={left}
              y={agent.y - 14}
              width={w}
              height="28"
              rx="14"
              fill="#ffffff"
              stroke="#e4e4ea"
              strokeWidth="1"
            />
            <circle cx={left + 14} cy={agent.y} r="3.5" fill="#3D6BFF" />
            {/* Anchored from the left of the pill, past the dot, so the label
                cannot drift outside the rounded rectangle it sits in. */}
            <text
              x={left + 24}
              y={agent.y + 3.5}
              textAnchor="start"
              fontFamily="monospace"
              fontSize="10"
              fill="#4a4a58"
            >
              {agent.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
