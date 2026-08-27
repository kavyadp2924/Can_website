import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, PageHero, Section, StickySectionNav } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Immersive Architecture',
  description:
    'Walkable architectural visualisation, configurable finishes and real-time lighting studies for architects and developers.',
};

export default function ImmersiveArchitecturePage() {
  return (
    <>
      <PageHero
        eyebrow="Immersive Architecture"
        title="Stop asking clients"
        accent="to imagine it."
        intro="A plan is a professional instrument that non-professionals are routinely asked to read. Most of the revision cycle is the cost of that gap."
      />

      <StickySectionNav
        items={[
          { id: 'experience', label: 'The experience' },
          { id: 'formats', label: 'Formats' },
        ]}
      />

      <Section id="experience" index="01" eyebrow="The experience" title="What the client actually gets">
        <FeatureGrid
          items={[
            {
              title: 'Walkable at human scale',
              desc: 'Interiors and exteriors explored at eye level, where proportion and sightlines become obvious.',
            },
            {
              title: 'Changed while they watch',
              desc: 'Finishes, fittings and layouts swapped during the review, so "what if it were darker?" is answered immediately.',
            },
            {
              title: 'Light through the day',
              desc: 'Time-of-day and seasonal studies on demand rather than as an overnight render queue.',
            },
          ]}
        />
      </Section>

      <Section id="formats" index="02" tone="surface" eyebrow="Formats" title="Matched to the room you are presenting in">
        <FeatureGrid
          items={[
            {
              title: 'Headset',
              desc: 'The most convincing format for scale and spatial judgement, when you can get someone to put one on.',
            },
            {
              title: 'Browser link',
              desc: 'Something a client opens on a laptop with nothing to install — the format that actually gets used.',
            },
            {
              title: 'Guided walkthrough',
              desc: 'A driven presentation for a boardroom or a sales suite, where nobody wants to hold a controller.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Have a project to visualise?"
        body="Send the model at whatever stage it is in. We will show you what is possible from it."
      />
    </>
  );
}
