import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { CtaBand, SectionHeading } from '@/components/ui';
import { ScrollProgress } from '@/components/motion';
import {
  AudiencesShowcase,
  DisciplinesShowcase,
  ProcessPipeline,
  StatementSection,
  StatsBand,
} from '@/components/sections';

export const metadata: Metadata = {
  title: 'Canorous Technology — Engineering, Simulation and Real-Time 3D',
  description:
    'Mechanical engineering, FEA and CFD simulation, real-time 3D and precision manufacturing under one roof. ISO 9001:2015 certified.',
};

/** The four disciplines, framed by what each one settles rather than what it is. */
const DISCIPLINES = [
  {
    title: 'Engineering & Analysis',
    desc: 'CAD, design-for-manufacture, and FEA and CFD studies that answer "will it hold?" while the answer is still cheap.',
  },
  {
    title: 'Real-Time 3D',
    desc: 'Unreal and Unity builds driven by the engineering geometry — not a rebuilt approximation of it.',
  },
  {
    title: 'Immersive & Interactive',
    desc: 'Headset walkthroughs, browser-streamed configurators, and training simulations for procedures too costly to rehearse for real.',
  },
  {
    title: 'Precision Manufacturing',
    desc: 'Machining, fabrication and assembly, with global sourcing under a certified quality system.',
  },
  {
    title: 'Software & Integration',
    desc: 'The portals, APIs and dashboards that turn a demo into something a business actually runs on.',
  },
  {
    title: 'Project Delivery',
    desc: 'One accountable team across every discipline above. No coordination tax passed back to you.',
  },
];

const AUDIENCES = [
  {
    title: 'Manufacturers',
    desc: 'Validate a design under real load cases, then demonstrate it to a buyer without building a prototype first.',
  },
  {
    title: 'Architects & developers',
    desc: 'Let a client walk the building, change the finishes, and decide in the meeting instead of the next revision.',
  },
  {
    title: 'Product designers',
    desc: 'Move between concept, analysis and photoreal presentation in hours, without exporting through three vendors.',
  },
  {
    title: 'Enterprise & training teams',
    desc: 'Rehearse dangerous or expensive procedures safely, as many times as it takes.',
  },
];

const PIPELINE = [
  { step: 'Design', desc: 'CAD and design-for-manufacture review.' },
  { step: 'Validate', desc: 'FEA and CFD under real load cases.' },
  { step: 'Visualise', desc: 'Real-time build from the same geometry.' },
  { step: 'Deliver', desc: 'Manufacturing, deployment, or both.' },
];

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Hero />

      {/* ─────────────────────────────────────── the argument ── */}
      <StatementSection
        wash
        eyebrow="Why this matters"
        heading="Most product visualisation is fiction."
        paragraphs={[
          'A studio receives a CAD file, rebuilds it by eye to make it render well, and returns something beautiful that no longer matches the engineering. It looks convincing right up until someone measures it.',
          'We do not hand the model over, because the people who ran the simulation are the people building the visual. What you show a customer is what you are actually making.',
        ]}
      />

      {/* ──────────────────────────────────────── the pipeline ── */}
      <section className="relative scroll-mt-24 border-y border-hairline bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            className="mb-12"
            eyebrow="How the work moves"
            title="One model, start to finish"
            intro="Each stage inherits the last rather than reinterpreting it. That is the whole point — every handoff between vendors is a chance for the geometry, the tolerances or the intent to drift."
          />
          <ProcessPipeline stages={PIPELINE} />
        </div>
      </section>

      {/* ─────────────────────────────────────── capabilities ── */}
      <section className="relative scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            className="mb-12"
            eyebrow="What we do"
            title="Six disciplines, one accountable team"
            intro="Usually these live in six different companies, and the coordination between them becomes your job."
          />
          <DisciplinesShowcase items={DISCIPLINES} />
        </div>
      </section>

      {/* ───────────────────────────────────────────── numbers ── */}
      <StatsBand
        stats={[
          { value: 7, suffix: '+', label: 'Years delivering' },
          { value: 30, suffix: '+', label: 'Projects shipped' },
          { value: 6, suffix: '', label: 'Disciplines in-house' },
          { value: 0, suffix: '', label: 'Vendor handoffs', literal: 'Zero' },
        ]}
      />

      {/* ───────────────────────────────────────── audiences ── */}
      <section className="relative scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            className="mb-12"
            eyebrow="Who we work with"
            title="Different industries, the same underlying problem"
          />
          <AudiencesShowcase items={AUDIENCES} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
