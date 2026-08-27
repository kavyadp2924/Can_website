import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, PageHero, Section } from '@/components/ui';
import { CardReveal, SpotlightCard } from '@/components/motion-primitives';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Tools Canorous built for its own delivery work, then made available to clients.',
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Built for our own work"
        accent="first."
        intro="Everything here started as something we needed internally and kept using."
      />

      <Section>
        <CardReveal>
          <SpotlightCard>
            <Link
              href="/products/presentation/"
              className="group relative block overflow-hidden rounded-xl border border-hairline bg-white p-8 shadow-card transition-[box-shadow,border-color,background-color] duration-ui hover:border-card-hover-edge hover:bg-card-hover hover:shadow-raised"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-ctpl-gradient" />
              <h2 className="font-display text-2xl font-bold text-ink transition-colors duration-ui group-hover:text-link">
                Presentation
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Live 3D in the room instead of screenshots of it. For teams whose work stops being
                convincing the moment it is flattened into a slide.
              </p>
              <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-link">
                Explore
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3.5 w-3.5 transition-transform duration-ui ease-ctpl-out group-hover:translate-x-1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </SpotlightCard>
        </CardReveal>
      </Section>

      <CtaBand />
    </>
  );
}
