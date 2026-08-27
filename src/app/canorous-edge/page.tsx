import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, Section, StickySectionNav } from '@/components/ui';
import { FeatureHero } from '@/components/feature-hero';
import { FadeIn } from '@/components/motion';
import { CardReveal, Reveal, SpotlightCard } from '@/components/motion-primitives';
import { StatementSection, TagGrid } from '@/components/sections';
import { ProcessRail } from '@/components/process-rail';

export const metadata: Metadata = {
  title: 'Canorous Edge — Data Science & AI Training',
  description:
    'The Data Science and Artificial Intelligence Program: industry-approved curriculum, hands-on training, classroom and online learning, international certification and 100% placement assistance.',
};

const HIGHLIGHTS = [
  {
    title: 'Industry Approved Curriculum',
    desc: 'Learn industry-relevant skills with our carefully designed curriculum aligned with current market demands.',
  },
  {
    title: 'Hands-on Training',
    desc: 'Practice with real-world projects and datasets to gain practical experience in AI development.',
  },
  {
    title: 'Learn from Experts',
    desc: 'Get trained by industry veterans with years of experience in AI and Data Science.',
  },
  {
    title: 'Unified Learning',
    desc: 'Attend sessions in classroom or online with live interaction — choose what works for you.',
  },
  {
    title: 'Become Industry Ready',
    desc: 'Build portfolio-worthy projects and develop skills that make you job-ready from day one.',
  },
  {
    title: '100% Placement Assistance',
    desc: 'Get complete support for job placement with resume building and interview preparation.',
  },
];

const PATH = [
  {
    index: '01',
    title: 'Case Studies',
    desc: 'Work on real-world business scenarios to understand AI applications.',
  },
  {
    index: '02',
    title: 'Assignments',
    desc: 'Practice with coding exercises and theoretical assessments.',
  },
  {
    index: '03',
    title: 'Capstone Project',
    desc: 'Build a complete AI project to demonstrate your skills.',
  },
  {
    index: '04',
    title: 'Interview Prep',
    desc: 'Mock interviews and technical interview preparation.',
  },
  {
    index: '05',
    title: 'Placement Assistance',
    desc: 'Connect with top recruiters and get hired.',
  },
  {
    index: '06',
    title: 'Career Support',
    desc: 'Ongoing support even after you land your dream job.',
  },
];

const MODES = [
  {
    title: 'Classroom Training',
    desc: 'Learn in a physical classroom with direct interaction with instructors and peers.',
  },
  {
    title: 'Online Training',
    desc: 'Join live sessions from anywhere with real-time interaction and doubt clearing.',
  },
];

const CAREERS = [
  'Data Scientist',
  'ML Engineer',
  'AI Consultant',
  'NLP Engineer',
  'Data Analyst',
  'AI Researcher',
  'Deep Learning Engineer',
];

const TOOLS = [
  'Python',
  'Machine Learning',
  'NLP',
  'Data Visualization',
  'Generative AI',
  'Forecasting Analytics',
];

const CERT_POINTS = [
  {
    title: 'Globally Recognized',
    desc: 'Credentials you can present to an employer anywhere, not only locally.',
  },
  {
    title: 'QR Code Validation',
    desc: 'Each certificate carries a QR code an employer can scan to verify it.',
  },
  {
    title: 'Industry Approved',
    desc: 'Issued against a curriculum built to current hiring requirements.',
  },
];

export default function CanorousEdgePage() {
  return (
    <>
      <FeatureHero
        eyebrow="AI Training Program"
        title="Data Science &"
        accent="Artificial Intelligence"
        lede="Master the future of technology with our comprehensive AI and Machine Learning training program. Join thousands of professionals who have transformed their careers."
        variant="data"
        primary={{ href: '/contact/', label: 'Apply now' }}
        secondary={{ href: '#program', label: 'About the program' }}
        readout={['Dataset · fitting', 'features 30 · epochs live']}
      />

      <StickySectionNav
        items={[
          { id: 'program', label: 'Program' },
          { id: 'highlights', label: 'Highlights' },
          { id: 'path', label: 'Learning path' },
          { id: 'modes', label: 'Mode of learning' },
          { id: 'careers', label: 'Careers' },
          { id: 'certification', label: 'Certification' },
        ]}
      />

      <StatementSection
        eyebrow="About the Program"
        heading="Theory and practice, taught as one thing"
        wash
        paragraphs={[
          'The Data Science and Artificial Intelligence Program is a comprehensive, industry-focused training designed to equip students and professionals with the skills required to thrive in today’s data-driven world.',
          'This program combines theoretical knowledge with hands-on practical experience, enabling learners to work on real-world projects, case studies, and modern AI tools. It covers key domains such as Data Analytics, Machine Learning, Deep Learning, Natural Language Processing, and Generative AI.',
          'With a flexible classroom + online learning model, students can learn at their convenience while interacting with expert trainers. The program also emphasizes career readiness through placement assistance, resume building, and interview preparation, helping learners become job-ready AI professionals.',
        ]}
      />
      {/* The statement section is its own <section> and cannot take an id, so the
          in-page nav anchors to a marker immediately above it. */}
      <span id="program" aria-hidden="true" className="sr-only" />

      <Section
        id="highlights"
        tone="surface"
        index="01"
        eyebrow="Program Highlights"
        title="Everything you need to become a skilled AI professional"
      >
        <FeatureGrid items={HIGHLIGHTS} />
      </Section>

      <Section
        id="path"
        index="02"
        eyebrow="Your Learning Path"
        title="A structured journey from beginner to industry-ready professional"
      >
        <ProcessRail stages={PATH} />
      </Section>

      <Section
        id="modes"
        tone="surface"
        index="03"
        eyebrow="Mode of Learning"
        title="Flexible learning options to suit your schedule"
        intro="Attend sessions in classroom or online with live interaction."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {MODES.map((mode, i) => (
            <CardReveal key={mode.title} delay={i * 80} className="h-full">
              <SpotlightCard className="h-full">
                <article className="relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-hairline bg-white p-7 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-50 bg-ctpl-gradient opacity-40 transition-[transform,opacity] duration-ui ease-ctpl-out group-hover:scale-x-100 group-hover:opacity-100"
                  />
                  <span className="font-mono text-xs font-bold text-link">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                    {mode.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{mode.desc}</p>
                </article>
              </SpotlightCard>
            </CardReveal>
          ))}
        </div>
      </Section>

      <Section
        id="careers"
        index="04"
        eyebrow="Career Opportunities"
        title="Unlock exciting career paths in the AI industry"
      >
        <TagGrid items={CAREERS} />
      </Section>

      <Section
        tone="surface"
        index="05"
        eyebrow="Tools & Technologies"
        title="Master the most in-demand skills in the industry"
      >
        <TagGrid items={TOOLS} />
      </Section>

      <Section
        id="certification"
        index="06"
        eyebrow="International Certification"
        title="Earn globally recognized certificates"
        intro="Validated with a QR code for authenticity verification."
      >
        {/* items-start so the three point cards keep their natural height
            instead of stretching to match the taller certificate column. */}
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-3">
            {CERT_POINTS.map((point, i) => (
              <CardReveal key={point.title} delay={i * 70} className="h-full">
                <SpotlightCard className="h-full">
                  <article className="flex h-full flex-col gap-2 rounded-lg border border-hairline bg-white p-5 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
                    <h3 className="font-display text-base font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                      {point.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{point.desc}</p>
                  </article>
                </SpotlightCard>
              </CardReveal>
            ))}
          </div>

          {/* Deliberately a labelled placeholder, not a mocked-up certificate:
              rendering a realistic-looking credential the programme has not
              issued would be a fabricated document. */}
          <Reveal>
            <figure className="rounded-xl border border-hairline bg-surface p-6 shadow-card">
              <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-white px-4 text-center">
                <span aria-hidden="true" className="absolute inset-x-6 top-6 h-px bg-ctpl-gradient opacity-40" />
                <span className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-subtle">
                  Sample Certificate
                </span>
                <p className="text-sm font-medium text-ink-muted">
                  Certificate preview will appear here
                </p>
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 grid-cols-3 grid-rows-3 gap-0.5 rounded border border-hairline p-1"
                >
                  {[1, 0, 1, 0, 1, 1, 1, 1, 0].map((on, i) => (
                    <span
                      key={i}
                      className={on ? 'rounded-[1px] bg-ink' : 'rounded-[1px] bg-transparent'}
                    />
                  ))}
                </span>
              </div>
              <figcaption className="mt-4 text-center text-xs font-medium uppercase tracking-eyebrow text-ink-muted">
                Verified with QR Code
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      <FadeIn>
        <CtaBand
          title="Start Your AI Career Today"
          body="Join thousands of professionals who have transformed their careers with our AI training program."
          action="Apply now"
        />
      </FadeIn>
    </>
  );
}
