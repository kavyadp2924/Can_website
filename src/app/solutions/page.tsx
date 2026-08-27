import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, FeatureGrid, PageHero, Section } from '@/components/ui';
import { FadeIn } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Engineering validation, real-time 3D and immersive experiences for manufacturers, architects, product designers and enterprise training teams.',
};

/** Section ids match the #anchors in the Solutions dropdown. */
const AUDIENCES = [
  {
    id: 'manufacturers',
    eyebrow: 'For Manufacturers',
    title: 'Answer "will it hold?" before you cut metal',
    intro:
      'Simulation catches the expensive problems while they are still drawings. Then the same geometry becomes the demo that wins the order.',
    items: [
      {
        title: 'Structural and thermal analysis',
        desc: 'Stress, deflection, fatigue and heat under the load cases the part will actually see.',
      },
      {
        title: 'Design for manufacture',
        desc: 'Reviews that surface tooling and cost problems while changing them is still cheap.',
      },
      {
        title: 'Configurable product demos',
        desc: 'Show variants, materials and internals without shipping a prototype to a trade show.',
      },
    ],
  },
  {
    id: 'architects',
    eyebrow: 'For Architects & Real Estate',
    title: 'Let them decide in the meeting',
    intro:
      'Drawings ask a client to imagine. A walkthrough does not. The questions that normally cost a revision cycle get answered while everyone is still in the room.',
    items: [
      {
        title: 'Walkable interiors and exteriors',
        desc: 'Full scale, explored at eye level, on a headset or in a browser.',
      },
      {
        title: 'Finishes changed live',
        desc: 'Swap materials, fittings and layouts during the review rather than after it.',
      },
      {
        title: 'Light studies on demand',
        desc: 'Time of day and season, without waiting on an overnight render.',
      },
    ],
  },
  {
    id: 'designers',
    eyebrow: 'For Product Designers',
    title: 'Concept to photoreal without the vendor relay',
    intro:
      'Modelling, analysis and presentation in one pipeline, so an iteration takes hours rather than a round trip through three suppliers.',
    items: [
      {
        title: 'Modelling and texturing',
        desc: 'Blender and Substance workflows, optimised for real time when it needs to be.',
      },
      {
        title: 'Product animation',
        desc: 'Exploded views, assembly sequences and hero motion for launch material.',
      },
      {
        title: 'Interactive configurators',
        desc: 'Let a customer build their own variant and see it immediately.',
      },
    ],
  },
  {
    id: 'enterprise',
    eyebrow: 'For Enterprise & Training',
    title: 'Rehearse what you cannot rehearse for real',
    intro:
      'Some procedures are too dangerous, too expensive or too rare to practise on the real equipment. Simulation removes that constraint.',
    items: [
      {
        title: 'Procedure simulation',
        desc: 'Standard operating procedures repeated safely until they are second nature.',
      },
      {
        title: 'Headset and desktop builds',
        desc: 'Unreal and Unity applications deployed to the hardware you already have.',
      },
      {
        title: 'Browser streaming',
        desc: 'Heavy scenes rendered server-side, so a laptop with no GPU still runs them.',
      },
    ],
  },
];

const DEEP_DIVES = [
  {
    href: '/solutions/engineering/',
    name: 'Engineering & Simulation',
    desc: 'CAD, FEA and CFD through to production.',
  },
  {
    href: '/solutions/real-time-3d/',
    name: 'Real-Time 3D Studio',
    desc: 'Unreal, Unity and browser streaming.',
  },
  {
    href: '/solutions/immersive-architecture/',
    name: 'Immersive Architecture',
    desc: 'Walkable, configurable, decided in one meeting.',
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="The same pipeline,"
        accent="pointed at your problem."
        intro="Four industries, four different questions — answered by one team working from one model."
      />

      {AUDIENCES.map((audience, index) => (
        <Section
          key={audience.id}
          id={audience.id}
          eyebrow={audience.eyebrow}
          title={audience.title}
          intro={audience.intro}
          tone={index % 2 === 1 ? 'surface' : 'default'}
        >
          <FeatureGrid items={audience.items} />
        </Section>
      ))}

      <Section eyebrow="In detail" title="Capability pages">
        <div className="grid gap-5 sm:grid-cols-3">
          {DEEP_DIVES.map((item, index) => (
            <FadeIn key={item.href} delay={index * 80}>
              <Link
                href={item.href}
                className="group relative block h-full overflow-hidden rounded-lg border border-hairline bg-white p-6 shadow-card transition-shadow hover:shadow-raised"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-ctpl-gradient transition-transform duration-300 group-hover:scale-x-100"
                />
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-link">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                <span aria-hidden="true" className="mt-4 block text-sm font-semibold text-link">
                  Read more →
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
