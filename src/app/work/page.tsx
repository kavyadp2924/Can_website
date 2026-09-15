import type { Metadata } from 'next';
import { CtaBand, PageHero, Section } from '@/components/ui';
import { WorkGallery } from './work-gallery';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected engineering, simulation, real-time 3D and immersive projects delivered by Canorous Technology.',
};

/**
 * Selected work. Project content lives in ./content.ts, shared with the
 * /work/[slug] case study pages; this page just renders the filterable grid.
 */
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
        <WorkGallery />
      </Section>

      <CtaBand
        title="Recognise your problem in any of these?"
        body="Tell us the version you are dealing with and we will say how we would approach it."
        action="Get a quote"
        href="/quote/"
      />
    </>
  );
}
