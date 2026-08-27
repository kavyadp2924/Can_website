import type { Metadata } from 'next';
import { VillaWalkthrough } from '@/components/villa-walkthrough';
import {
  CtaBand,
  Eyebrow,
  FeatureGrid,
  GradientText,
  PrimaryLink,
  SecondaryLink,
  Section,
  StickySectionNav,
} from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { CardReveal, Reveal, ScrollBackdrop, SpotlightCard } from '@/components/motion-primitives';
import {
  CAPABILITIES,
  PROJECTS,
  UNITY,
  UNREAL,
  VILLA_HIGHLIGHTS,
} from './content';

export const metadata: Metadata = {
  title: '3D Architectural Visualization & Immersive Experiences',
  description:
    'Canorous Technologies turns architectural drawings and floor plans into immersive 3D environments — interior and exterior visualisation, landscape, walkthroughs and real-time experiences in Unreal Engine and Unity.',
  keywords: [
    '3D architectural visualization',
    'architectural walkthrough',
    '2D floor plan to 3D',
    'interior visualization',
    'exterior visualization',
    'landscape visualization',
    'Unreal Engine architecture',
    'Unity architectural visualization',
    'real-time visualization',
    'AR VR architecture',
    'digital twin',
    'AI visualization',
    'ArchViz',
    'Canorous Technologies',
    'Chennai',
    'Auroville',
  ],
};

function Workflow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span className="rounded-full border border-hairline bg-white px-3 py-1.5 text-ink">
            {step}
          </span>
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="text-ink-subtle">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function VisualizationPage() {
  return (
    <>
      {/* ─────────────────────────────────────────────── opening ── */}
      <section className="relative overflow-hidden border-b border-hairline bg-ctpl-hero-wash bg-surface-subtle">
        <ScrollBackdrop />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <Eyebrow>3D Architectural Visualization &amp; Immersive Experiences</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-display font-bold leading-[1.1] text-ink sm:text-display-lg">
            Bringing architectural concepts{' '}
            <GradientText>to life.</GradientText>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary">
            We transform architectural drawings, floor plans and design concepts into immersive
            digital experiences — 3D modelling, interior and exterior visualisation, landscape
            development, realistic rendering, animation and interactive experiences.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Built on industry-leading real-time technology — Unreal Engine and Unity — for
            high-quality walkthroughs, interactive environments and virtual presentations.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <PrimaryLink href="#projects">See the projects</PrimaryLink>
            <SecondaryLink href="/contact/">Discuss a project</SecondaryLink>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────── projects ── */}
      <StickySectionNav
        items={[
          { id: 'projects', label: 'Projects' },
          { id: 'modern-villa', label: 'Modern Villa' },
          { id: 'engines', label: 'Engines' },
          { id: 'capabilities', label: 'Capabilities' },
        ]}
      />

      <Section
        id="projects"
        eyebrow="Our projects"
        title="Three ways a plan becomes a place"
      >
        <div className="space-y-6">
          {PROJECTS.map((project, index) => (
            <CardReveal key={project.id} delay={index * 90}>
              <article
                id={project.id}
                className="group scroll-mt-36 overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition-[box-shadow,border-color,background-color,transform] duration-ui ease-ctpl-out hover:border-card-hover-edge hover:bg-card-hover hover:shadow-raised motion-safe:hover:scale-[1.008]"
              >
                <span aria-hidden="true" className="block h-0.5 bg-ctpl-gradient" />

                <div className="grid gap-8 p-7 lg:grid-cols-[1.15fr_1fr] sm:p-9">
                  <div>
                    <Reveal clip>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-display text-2xl font-bold text-ink">{project.name}</h3>
                        {project.place && (
                          <span className="text-sm font-medium text-ink-muted">{project.place}</span>
                        )}
                      </div>
                      <p className="mt-1 text-eyebrow uppercase tracking-eyebrow text-link">
                        {project.kind}
                      </p>
                    </Reveal>
                    <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                      {project.summary}
                    </p>

                    <div className="mt-6">
                      <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">
                        Workflow
                      </p>
                      <div className="mt-3">
                        <Workflow steps={project.workflow} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-hairline bg-surface p-6">
                    <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">
                      Project scope
                    </p>
                    <ul className="mt-3 space-y-2">
                      {project.scope.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-red"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </CardReveal>
          ))}
        </div>
      </Section>

      {/* ───────────────────────────────────────── villa project ── */}
      <Section
        id="modern-villa"
        tone="surface"
        eyebrow="Modern Villa"
        title="Exterior, interior and landscape, walked in one pass"
        intro="A modern villa presented through an immersive 3D walkthrough, explored from both exterior and interior perspectives. Architectural modelling, detailed landscaping, realistic materials and lighting, and carefully designed interiors — the living room, dining area and bedrooms, set in their landscaped surroundings."
      >
        <FadeIn>
          <p className="mb-8 max-w-2xl text-sm text-ink-muted">
            The walkthrough below is interactive. Scroll to move the camera from the approach,
            past the facade, across the deck, and inside.
          </p>
        </FadeIn>
      </Section>

      <VillaWalkthrough />

      <Section eyebrow="Project highlights" title="What went into the villa">
        <FeatureGrid items={VILLA_HIGHLIGHTS} />
      </Section>

      {/* ────────────────────────────────────────────── engines ── */}
      <Section
        id="engines"
        tone="surface"
        eyebrow="Real-time architectural experiences"
        title="Beyond renders and videos"
        intro="Real-time 3D lets someone explore a space, move between viewpoints and engage with a project rather than watch a fixed camera move through it."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            { name: 'Unreal Engine', items: UNREAL, accent: 'from-brand-red' },
            { name: 'Unity', items: UNITY, accent: 'from-brand-blue' },
          ].map((engine, index) => (
            <CardReveal key={engine.name} delay={index * 90} className="h-full">
              <SpotlightCard className="h-full">
                <article className="h-full overflow-hidden rounded-xl border border-hairline bg-white p-7 shadow-card transition-[box-shadow,border-color,background-color] duration-ui group-hover:border-card-hover-edge group-hover:bg-card-hover group-hover:shadow-raised">
                  <span
                    aria-hidden="true"
                    className={`mb-5 block h-0.5 bg-gradient-to-r ${engine.accent} to-transparent`}
                  />
                  <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-ui group-hover:text-link">
                    {engine.name}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {engine.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-blue"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </SpotlightCard>
            </CardReveal>
          ))}
        </div>
      </Section>

      {/* ───────────────────────────────────────── capabilities ── */}
      <Section
        id="capabilities"
        eyebrow="From visualisation to immersive experience"
        title="Seven capabilities, one pipeline"
        intro="3D visualisation, Unreal Engine, Unity, AR/VR, digital twins, AI and interactive technology — combined into digital experiences for the built environment."
      >
        <FeatureGrid items={CAPABILITIES} />
      </Section>

      {/* ────────────────────────────────────────────── closing ── */}
      <section className="border-y border-hairline bg-ctpl-hero-wash bg-surface-subtle">
        <ScrollBackdrop />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal clip>
            <Eyebrow className="text-ink-muted">Visualize before you build</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              A project succeeds when the vision can be{' '}
              <GradientText>clearly communicated.</GradientText>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
              We help architects, builders, developers, real-estate companies and businesses
              communicate design intent, engage stakeholders and present projects with more impact.
            </p>
            <p className="mt-6 font-display text-lg font-semibold text-ink">
              From 2D plans to immersive 3D experiences.
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-eyebrow text-ink-muted">
              3D Visualisation · Unreal Engine · Unity · AR/VR · Digital Twins · AI · Interactive
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Bring your architectural vision to life"
        body="Send us the drawings, the floor plan, or just the site. We will tell you what is possible and what it takes."
        action="Start a project"
      />
    </>
  );
}
