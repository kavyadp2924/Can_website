'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePrefersReducedMotion } from './motion';
import { cn } from '@/lib/cn';

/**
 * The CADForge reconstruction, shown rather than described.
 *
 * A sticky technical viewport on one side, the five phases on the other. As the
 * phases scroll past, the drawing in the viewport is rebuilt in place:
 *
 *   2D DRAWING → DETECTION → GEOMETRY → STRUCTURE → CAD RESULT
 *
 * Everything is one SVG with five layer groups whose opacity (and, for the
 * walls, `stroke-dashoffset`) is scrubbed to scroll on a single GSAP timeline —
 * one ScrollTrigger for the section rather than one per element, and no
 * per-frame React state, so the scrub stays on the compositor.
 *
 * Under reduced motion the timeline is never built: the viewport renders the
 * finished CAD state and every phase renders in its resolved style, so the
 * sequence is still readable as a sequence. The sticky column is plain CSS and
 * is left alone either way.
 */

const PHASES = [
  {
    label: '2D Drawing',
    desc: 'A drawing arrives as a PDF or an image — no layers, no geometry, nothing a CAD package can edit.',
  },
  {
    label: 'Detection',
    desc: 'Regions, openings and symbols are located across the sheet.',
  },
  {
    label: 'Geometry',
    desc: 'Detected regions are resolved into vertices and edges with real coordinates.',
  },
  {
    label: 'Structure',
    desc: 'Edges are assembled into connected structural elements rather than loose lines.',
  },
  {
    label: 'CAD Result',
    desc: 'The reconstruction is written out as layered CAD geometry.',
  },
];

export function CadTransform() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top 60%',
          end: 'bottom 85%',
          scrub: 0.5,
        },
      });

      // Phase 1 → 2: the raster input dims as detection boxes resolve over it.
      tl.to(q('[data-layer="raster"]'), { opacity: 0.28, duration: 1 })
        .to(q('[data-layer="detect"]'), { opacity: 1, duration: 1 }, '<')
        // Phase 2 → 3: boxes give way to the vertices they produced. Targets the
        // individual vertex groups, not their container — the container has no
        // opacity of its own to animate, so tweening it would be a no-op.
        .to(q('[data-layer="detect"]'), { opacity: 0.2, duration: 1 })
        .to(q('[data-layer="geom"] > g'), { opacity: 1, stagger: 0.02, duration: 0.6 }, '<')
        // Phase 3 → 4: walls draw themselves along the resolved edges.
        .to(q('[data-layer="struct"]'), { opacity: 1, duration: 0.4 })
        .to(q('[data-layer="struct"] path'), { strokeDashoffset: 0, duration: 1.4 }, '<')
        // Phase 4 → 5: the finished, dimensioned CAD sheet.
        .to(q('[data-layer="raster"]'), { opacity: 0, duration: 0.8 })
        .to(q('[data-layer="detect"]'), { opacity: 0, duration: 0.8 }, '<')
        .to(q('[data-layer="cad"]'), { opacity: 1, duration: 1 }, '<');

      // The phase caption is discrete, so it is driven by its own triggers
      // rather than by reading progress off the scrubbed timeline every frame.
      q('[data-phase]').forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 65%',
          end: 'bottom 40%',
          onEnter: () => setPhase(i),
          onEnterBack: () => setPhase(i),
        });
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  const done = reduced;

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      {/* ─────────────────────────────────────── sticky viewport ── */}
      <div className="lg:sticky lg:top-32 lg:h-fit">
        <div className="relative overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-muted">
              Reconstruction viewport
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-eyebrow text-link">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red motion-safe:animate-[pulseDot_2.4s_ease-in-out_infinite]"
              />
              {PHASES[phase].label}
            </span>
          </div>

          <svg
            viewBox="0 0 400 300"
            role="img"
            aria-label="A 2D drawing being reconstructed into layered CAD geometry: detection, then vertices, then structural walls, then a dimensioned result."
            className="block w-full bg-surface-subtle"
          >
            {/* Sheet grid */}
            <defs>
              <pattern id="cadgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="#e4e4ea" strokeWidth="0.5" />
              </pattern>
              <pattern id="cadhatch" width="6" height="6" patternUnits="userSpaceOnUse">
                <path d="M0 6L6 0" stroke="#3D6BFF" strokeWidth="0.5" opacity="0.35" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#cadgrid)" />

            {/* 1 — raster input: soft, uneven, un-editable */}
            <g data-layer="raster" opacity={done ? 0 : 1}>
              <g stroke="#8a8a9a" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" fill="none">
                <path d="M60 60 H340 V240 H60 Z" />
                <path d="M200 60 V150" />
                <path d="M200 150 H340" />
                <path d="M60 190 H200" />
              </g>
            </g>

            {/* 2 — detection: regions and openings located */}
            <g data-layer="detect" opacity={done ? 0 : 0} fill="none">
              {[
                [66, 66, 128, 118],
                [206, 66, 128, 78],
                [206, 156, 128, 78],
                [66, 196, 128, 38],
              ].map(([x, y, w, h], i) => (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    stroke="#3D6BFF"
                    strokeWidth="1.2"
                    strokeDasharray="5 4"
                  />
                  <rect x={x} y={y - 11} width="30" height="10" fill="#3D6BFF" opacity="0.85" />
                  <text x={x + 4} y={y - 3} fontSize="7" fill="#ffffff" fontFamily="monospace">
                    R{i + 1}
                  </text>
                </g>
              ))}
              {[
                [200, 110],
                [270, 150],
                [130, 190],
              ].map(([x, y], i) => (
                <rect
                  key={`o-${i}`}
                  x={x - 12}
                  y={y - 7}
                  width="24"
                  height="14"
                  stroke="#D71E1E"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              ))}
            </g>

            {/* 3 — geometry: resolved vertices */}
            <g data-layer="geom">
              {[
                [60, 60], [200, 60], [340, 60],
                [60, 150], [200, 150], [340, 150],
                [60, 190], [200, 190], [340, 190],
                [60, 240], [200, 240], [340, 240],
              ].map(([x, y], i) => (
                <g key={i} opacity={done ? 1 : 0}>
                  <circle cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#D71E1E" strokeWidth="1.4" />
                  <circle cx={x} cy={y} r="1.2" fill="#D71E1E" />
                </g>
              ))}
            </g>

            {/* 4 — structure: connected walls, drawn along the edges */}
            <g data-layer="struct" opacity={done ? 1 : 0}>
              {[
                'M60 60 H340',
                'M340 60 V240',
                'M340 240 H60',
                'M60 240 V60',
                'M200 60 V150',
                'M200 150 H340',
                'M60 190 H200',
              ].map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#16161d"
                  strokeWidth="5"
                  strokeLinecap="square"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={done ? 0 : 1}
                />
              ))}
            </g>

            {/* 5 — the finished CAD sheet: hatch, dimensions, layer labels */}
            <g data-layer="cad" opacity={done ? 1 : 0}>
              <rect x="63" y="63" width="134" height="84" fill="url(#cadhatch)" />
              <rect x="203" y="153" width="134" height="84" fill="url(#cadhatch)" />

              <g stroke="#3D6BFF" strokeWidth="0.8" fill="none">
                <path d="M60 268 H340" />
                <path d="M60 263 V273" />
                <path d="M200 263 V273" />
                <path d="M340 263 V273" />
                <path d="M368 60 V240" />
                <path d="M363 60 H373" />
                <path d="M363 240 H373" />
              </g>
              <text x="120" y="281" fontSize="8" fill="#3D6BFF" fontFamily="monospace">
                14000
              </text>
              <text x="260" y="281" fontSize="8" fill="#3D6BFF" fontFamily="monospace">
                14000
              </text>
              <text
                x="378"
                y="155"
                fontSize="8"
                fill="#3D6BFF"
                fontFamily="monospace"
                transform="rotate(-90 378 155)"
                textAnchor="middle"
              >
                18000
              </text>
              <g fontFamily="monospace" fontSize="7" fill="#6d6d80">
                <text x="66" y="56">LAYER · WALL</text>
                <text x="206" y="56">LAYER · OPENING</text>
                <text x="66" y="255">LAYER · DIM</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ───────────────────────────────────────────── phases ── */}
      <ol className="relative">
        {PHASES.map((item, i) => {
          const on = reduced || i <= phase;
          return (
            <li
              key={item.label}
              data-phase={i}
              className="border-l border-hairline py-8 pl-6 first:pt-0 lg:py-14"
            >
              <span
                className={cn(
                  'font-mono text-[11px] font-bold uppercase tracking-eyebrow transition-colors duration-ui',
                  on ? 'text-link' : 'text-ink-subtle',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                className={cn(
                  'mt-1.5 font-display text-xl font-semibold transition-colors duration-ui',
                  on ? 'text-ink' : 'text-ink-subtle',
                )}
              >
                {item.label}
              </h3>
              <p
                className={cn(
                  'mt-2 text-sm leading-relaxed transition-colors duration-ui',
                  on ? 'text-ink-muted' : 'text-ink-subtle',
                )}
              >
                {item.desc}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
