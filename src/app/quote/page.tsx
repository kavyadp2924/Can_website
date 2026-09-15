import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/ui';
import { QuoteTool } from '@/components/quote-tool';

export const metadata: Metadata = {
  title: 'Get a quote',
  description:
    'Tell us what you are building — service, timeline and any reference material — and we will come back with an approach.',
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Get a quote"
        title="Tell us what you are"
        accent="building."
        intro="A few questions about the work, then we will come back with an approach and a realistic timeline."
      />

      <Section>
        <div className="mx-auto max-w-2xl">
          <QuoteTool />
        </div>
      </Section>
    </>
  );
}
