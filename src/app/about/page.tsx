import type { Metadata } from 'next';
import { CtaBand, FeatureList, PageHero, Section } from '@/components/ui';
import { FadeIn } from '@/components/motion';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Canorous Technology brings mechanical engineers, 3D artists and software developers under one roof. ISO 9001:2015 certified.',
};

const BELIEFS = [
  {
    title: 'A handoff is where accuracy dies',
    desc: 'Every time a model moves between companies, someone reinterprets it. We removed the handoffs rather than trying to manage them.',
  },
  {
    title: 'Show, do not describe',
    desc: 'A specification argues. A working demonstration settles it. Most of our work exists to shorten the distance to that moment.',
  },
  {
    title: 'Accurate beats impressive',
    desc: 'It is easy to make something look extraordinary and wrong. Our visuals come off the engineering because they have to survive scrutiny.',
  },
  {
    title: 'Certification is a habit, not a badge',
    desc: 'ISO 9001:2015 matters because of what it forces internally — repeatable process, documented decisions, traceable changes.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Canorous"
        title="Engineers and artists,"
        accent="on the same floor."
        intro="Most companies can do one half of this well. The value is in not having to choose which half to compromise."
      >
        <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-hairline bg-white/80 px-5 py-3 backdrop-blur">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ctpl-gradient" />
          <span className="text-sm font-semibold text-ink">ISO 9001:2015</span>
          <span className="text-sm text-ink-muted">Quality Management System</span>
        </div>
      </PageHero>

      <Section wash eyebrow="The shape of the company" title="Why we are put together this way">
        <FadeIn>
          <div className="max-w-3xl space-y-5 text-base leading-relaxed text-ink-secondary">
            <p>
              Canorous started on the engineering side — CAD, simulation, and getting parts made.
              The visualisation work grew out of a recurring frustration: clients could not tell
              from a drawing whether we had understood them, and the studios they hired to make it
              look real would quietly redraw our geometry to make it render better.
            </p>
            <p>
              So we hired artists and put them next to the engineers. That one decision is what the
              rest of the company is built around. The person texturing a housing can walk over and
              ask why the fillet is that radius, and the answer changes what they model.
            </p>
            <p>
              Today the team spans mechanical engineering, analysis, 3D art, real-time development,
              software and project management. Different disciplines, one delivery, one point of
              accountability when something needs fixing.
            </p>
          </div>
        </FadeIn>
      </Section>

      <Section tone="surface" eyebrow="What we hold to" title="Four things we do not compromise on">
        <FeatureList items={BELIEFS} />
      </Section>

      <CtaBand
        title="Want to see how it works in practice?"
        body="We will walk you through a real project from the first CAD file to the finished experience."
      />
    </>
  );
}
