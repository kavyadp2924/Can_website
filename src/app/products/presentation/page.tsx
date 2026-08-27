import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, PageHero, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Presentation',
  description:
    'An interactive presentation tool for teams whose work stops being convincing once it is flattened into a slide.',
};

export default function PresentationPage() {
  return (
    <>
      <PageHero
        eyebrow="Products · Presentation"
        title="Slides flatten"
        accent="the thing you are selling."
        intro="If the value of your work is that it is three-dimensional, accurate and explorable, a screenshot of it is a downgrade you present to your own customer."
      />

      <Section eyebrow="What it does" title="Three things a deck cannot">
        <FeatureGrid
          items={[
            {
              title: 'Live scenes',
              desc: 'Rotate, section and explore the actual model mid-presentation, at the moment someone asks.',
            },
            {
              title: 'Answer "what if"',
              desc: 'Change a variant, a material or a layout in front of the room instead of promising to send an update.',
            },
            {
              title: 'Send a link, not an attachment',
              desc: 'The client opens it later on their own machine, with nothing to install and nothing to bounce off a mail server.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Want to see it with your own content?"
        body="Send us a model and we will load it in so you can judge it properly."
      />
    </>
  );
}
