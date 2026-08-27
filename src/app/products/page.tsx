import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, PageHero, Section } from '@/components/ui';
import { FadeIn } from '@/components/motion';

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
        <FadeIn>
          <Link
            href="/products/presentation/"
            className="group relative block overflow-hidden rounded-xl border border-hairline bg-white p-8 shadow-card transition-shadow hover:shadow-raised"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-ctpl-gradient" />
            <h2 className="font-display text-2xl font-bold text-ink group-hover:text-link">
              Presentation
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Live 3D in the room instead of screenshots of it. For teams whose work stops being
              convincing the moment it is flattened into a slide.
            </p>
            <span aria-hidden="true" className="mt-5 block text-sm font-semibold text-link">
              Explore →
            </span>
          </Link>
        </FadeIn>
      </Section>

      <CtaBand />
    </>
  );
}
