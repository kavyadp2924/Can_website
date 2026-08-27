import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, PageHero, PrimaryLink, SecondaryLink, Section } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { ScrollLine } from '@/components/motion-primitives';
import { ScrollActive } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Canorous Edge',
  description:
    'Canorous Edge — hands-on AI training taught by working engineers, with real projects, international certification and placement support.',
};

const HIGHLIGHTS = [
  {
    title: 'Taught by people who ship',
    desc: 'Working engineers, not career instructors. The examples come from systems that are running in production right now.',
  },
  {
    title: 'Projects from week one',
    desc: 'You build things. By the end you have work you can show an interviewer rather than a certificate and some notes.',
  },
  {
    title: 'A curriculum that tracks hiring',
    desc: 'Mapped against the roles companies are actually recruiting for, and revised when that changes.',
  },
  {
    title: 'One continuous path',
    desc: 'Fundamentals through to deployment as a single track, so nothing is learned in isolation and then forgotten.',
  },
  {
    title: 'International certification',
    desc: 'Recognised credentials you can put in front of an employer anywhere, not just locally.',
  },
  {
    title: 'Placement support that continues',
    desc: 'Introductions, referrals and interview preparation — support that does not stop the day the course ends.',
  },
];

const PATH = [
  { step: '01', title: 'Foundations', desc: 'Python, the mathematics that actually matters, and working with real data.' },
  { step: '02', title: 'Core machine learning', desc: 'Supervised and unsupervised methods, honest evaluation, feature work.' },
  { step: '03', title: 'Deep learning', desc: 'Neural networks, computer vision and language models.' },
  { step: '04', title: 'Applied projects', desc: 'End-to-end systems built on messy datasets, the kind you meet at work.' },
  { step: '05', title: 'Deployment and careers', desc: 'Serving models, MLOps fundamentals, portfolio and interview preparation.' },
];

export default function CanorousEdgePage() {
  return (
    <>
      <PageHero
        eyebrow="Canorous Edge"
        title="Learn AI by building it,"
        accent="not by watching it."
        intro="A hands-on programme run by the engineering team — the same people who build production systems here."
      >
        <div className="mt-8 flex flex-wrap gap-3.5">
          <PrimaryLink href="/contact/">Apply now</PrimaryLink>
          <SecondaryLink href="#curriculum">See the curriculum</SecondaryLink>
        </div>
      </PageHero>

      <Section eyebrow="What makes it different" title="Six things you get">
        <FeatureGrid items={HIGHLIGHTS} />
      </Section>

      <Section
        id="curriculum"
        tone="surface"
        eyebrow="The path"
        title="Five stages, each built on the last"
        intro="Nothing is taught as a standalone module you can pass and then never use again."
      >
        <div className="relative">
          <ScrollLine className="absolute left-[0.34rem] top-2 h-[calc(100%-1rem)] w-0.5 rounded-full sm:left-[0.59rem]" />
          <ol className="space-y-4 pl-6 sm:pl-8">
            {PATH.map((stage, index) => (
              <ScrollActive key={stage.step} className="stage-item relative">
                <FadeIn delay={index * 70}>
                  <div className="stage-card relative rounded-lg border border-hairline bg-white p-5 shadow-card">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.15rem] top-6 h-3 w-3 rounded-full bg-ctpl-gradient ring-4 ring-surface sm:-left-[2.65rem]"
                    />
                    <p className="stage-num font-mono text-xs font-semibold text-link">
                      {stage.step}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink">{stage.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{stage.desc}</p>
                  </div>
                </FadeIn>
              </ScrollActive>
            ))}
          </ol>
        </div>
      </Section>

      <CtaBand
        title="Ready to start?"
        body="Tell us your background and we will suggest the right entry point."
        action="Apply now"
      />
    </>
  );
}
