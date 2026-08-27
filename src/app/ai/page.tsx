import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, Section, StickySectionNav } from '@/components/ui';
import { FeatureHero } from '@/components/feature-hero';
import { Reveal } from '@/components/motion-primitives';
import { StageFlow } from '@/components/sections';
import { CadTransform } from '@/components/cad-transform';
import { AgentHub } from '@/components/agent-hub';
import { PRODUCTS, WHY, type AiProduct } from './content';

export const metadata: Metadata = {
  title: 'AI Products & Intelligent Automation',
  description:
    'AI-powered products from Canorous Technologies — AI FloorPlan3D, CADForge, AI Inventory Management, AI Marketing Agent and Documentation AI. Computer vision, multi-agent systems, workflow automation and generative AI.',
};

/**
 * One product block, used for all five.
 *
 * The product's name is the section heading (rendered by `Section`, so it gets
 * the same word reveal as every other heading on the site) — this block starts
 * at the tagline and does not repeat it. The pipeline sits beside the copy on
 * desktop and beneath it on mobile, so a long summary never squeezes the stage
 * labels into a column too narrow to read. `children` takes the product's own
 * diagram where it has one.
 */
function ProductBlock({
  product,
  children,
}: {
  product: AiProduct;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:gap-12">
      <div>
        <Reveal>
          <p className="text-base font-medium text-ink-secondary">{product.tagline}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {product.summary}
          </p>
        </Reveal>
        {children && <div className="mt-10">{children}</div>}
      </div>

      <div className="h-fit rounded-xl border border-hairline bg-white p-6 shadow-card">
        <p className="mb-4 text-eyebrow uppercase tracking-eyebrow text-ink-muted">
          {product.flowLabel ?? 'Pipeline'}
        </p>
        <StageFlow stages={product.pipeline} />
      </div>
    </div>
  );
}

export default function AiPage() {
  const [floorplan, cadforge, inventory, marketing, documentation] = PRODUCTS;

  return (
    <>
      <FeatureHero
        eyebrow="AI Products & Intelligent Automation Solutions"
        title="Transforming business operations"
        accent="with artificial intelligence."
        lede="At Canorous Technologies, we develop AI-powered products that automate complex workflows, improve operational efficiency, and accelerate digital transformation."
        body={[
          'Our solutions combine Artificial Intelligence, Computer Vision, Multi-Agent Systems, Workflow Automation, OCR, and Generative AI to solve real-world business challenges across architecture, engineering, manufacturing, sales, marketing, and enterprise operations.',
        ]}
        variant="ai"
        primary={{ href: '/contact/', label: 'Talk to us' }}
        secondary={{ href: '#floorplan3d', label: 'See the products' }}
        readout={['Graph · executing', 'layers 4 · signals live']}
      />

      <StickySectionNav
        items={[
          { id: 'floorplan3d', label: 'FloorPlan3D' },
          { id: 'cadforge', label: 'CADForge' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'marketing', label: 'Marketing' },
          { id: 'documentation', label: 'Documentation' },
          { id: 'why', label: 'Why us' },
        ]}
      />

      <Section id={floorplan.id} eyebrow="AI Product 01" title={floorplan.name}>
        <ProductBlock product={floorplan} />
      </Section>

      <Section id={cadforge.id} tone="surface" eyebrow="AI Product 02" title={cadforge.name}>
        <ProductBlock product={cadforge} />
      </Section>

      {/* The reconstruction, shown. Given its own section so the sticky viewport
          has the full column width to work in. */}
      <Section
        eyebrow="CADForge · Visual transformation"
        title="Watch a drawing become geometry"
        intro="The same five phases the platform runs, scrubbed to your scroll."
      >
        <CadTransform />
      </Section>

      <Section id={inventory.id} tone="surface" eyebrow="AI Product 03" title={inventory.name}>
        <ProductBlock product={inventory}>
          <AgentHub />
        </ProductBlock>
      </Section>

      <Section id={marketing.id} eyebrow="AI Product 04" title={marketing.name}>
        <ProductBlock product={marketing} />
      </Section>

      <Section id={documentation.id} tone="surface" eyebrow="AI Product 05" title={documentation.name}>
        <ProductBlock product={documentation} />
      </Section>

      <Section id="why" eyebrow="Why Choose Our AI Solutions?" title="Six reasons these hold up in production">
        <FeatureGrid items={WHY} />
      </Section>

      <CtaBand
        title="Build Smarter. Operate Faster. Scale Better."
        body="At Canorous Technologies, we create AI products that transform how businesses design, manage, market, document, and operate. Artificial Intelligence · Automation · Computer Vision · Multi-Agent Systems · Enterprise Solutions."
        action="Talk to us"
      />
    </>
  );
}
