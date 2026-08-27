import type { Metadata } from 'next';
import { CtaBand, PageHero, Section } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { ImageReveal, MediaFrame, Reveal } from '@/components/motion-primitives';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected engineering, simulation, real-time 3D and immersive projects delivered by Canorous Technology.',
};

/**
 * Selected work.
 *
 * Written as outcomes rather than a list of deliverables — what the client was
 * trying to settle, and what settled it. Images are pre-compressed WebP; a
 * static export has no image optimiser, so the source files are the delivered
 * files.
 */
const PROJECTS = [
  {
    title: 'Valve assembly, proven before tooling',
    discipline: 'Engineering & FEA',
    image: '/images/img1.png',
    outcome:
      'Finite element analysis across the full pressure range found a fatigue concentration at a transition radius. Changed in CAD in an afternoon; the same change after tooling would have been a new die.',
  },
  {
    title: 'Residential villa, walked before it was poured',
    discipline: 'Immersive Architecture',
    image: '/images/img2.jpg',
    outcome:
      'A browser-streamed walkthrough with switchable finishes. The client resolved a layout question in the first meeting that had already survived two rounds of drawings.',
  },
  {
    title: 'Industrial plant, rehearsed in the headset',
    discipline: 'VR Training',
    image: '/images/digital-plant.webp',
    outcome:
      'A procedure simulation for maintenance work that cannot safely be practised on the live installation. Repeatable, measurable, and no plant downtime.',
  },
  {
    title: 'Product configurator, no prototype shipped',
    discipline: 'Real-Time 3D',
    image: '/images/Vista-View.png',
    outcome:
      'Variants, materials and internal cutaways a prospect can drive themselves — replacing a physical sample that used to travel to every trade show.',
  },
  {
    title: 'Precision components, drawing to delivery',
    discipline: 'Manufacturing',
    image: '/images/bracket.jpg',
    outcome:
      'Design, validation and production handled as one engagement under ISO 9001:2015, with a single point of accountability throughout.',
  },
  {
    title: 'Thermal study for an enclosure redesign',
    discipline: 'CFD',
    image: '/images/simulation-analysis.webp',
    outcome:
      'Flow and heat-transfer analysis showed the proposed vent placement would not clear the hot spot. The redesign was validated in software before a single panel was cut.',
  },
];

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Work"
        title="Problems we were"
        accent="asked to settle."
        intro="Across engineering, manufacturing, architectural visualisation and immersive training."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          {PROJECTS.map((project, index) => (
            <FadeIn
              key={project.title}
              delay={(index % 2) * 90}
              className={index % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
            >
              <article className="group flex h-full flex-col">
                <ImageReveal className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-surface shadow-card">
                  <MediaFrame
                    src={project.image}
                    alt={project.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="absolute inset-0"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">
                    {project.discipline}
                  </span>
                </ImageReveal>
                <div className="pt-5">
                  <Reveal>
                    <h2 className="font-display text-xl font-semibold leading-snug text-ink">
                      {project.title}
                    </h2>
                  </Reveal>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{project.outcome}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Recognise your problem in any of these?"
        body="Tell us the version you are dealing with and we will say how we would approach it."
      />
    </>
  );
}
