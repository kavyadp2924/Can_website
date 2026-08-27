import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, PageHero, Section, StickySectionNav } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Engineering & Simulation',
  description:
    'CAD engineering, FEA and CFD analysis, design validation and precision manufacturing. ISO 9001:2015 certified.',
};

export default function EngineeringPage() {
  return (
    <>
      <PageHero
        eyebrow="Engineering & Simulation"
        title="Find the failure"
        accent="on screen, not on site."
        intro="Analysis is cheapest before anything is cut and most expensive after something is installed. We do it at the front."
      />

      <StickySectionNav
        items={[
          { id: 'design', label: 'Design' },
          { id: 'analysis', label: 'Analysis' },
          { id: 'production', label: 'Production' },
        ]}
      />

      <Section
        id="design"
        index="01"
        eyebrow="Design"
        title="From concept to a drawing set someone can build from"
      >
        <FeatureGrid
          items={[
            {
              title: 'Product design and CAD',
              desc: 'Concept development, detailed modelling, and complete drawing sets with tolerances that a machinist can work to.',
            },
            {
              title: 'Design for manufacture',
              desc: 'A review that asks how it will be made, not just whether it works — before the tooling quote arrives.',
            },
            {
              title: 'Material and compliance',
              desc: 'Selection, tolerance stack-up, and the documentation your certifying body will ask for.',
            },
          ]}
        />
      </Section>

      <Section id="analysis" index="02" tone="surface" eyebrow="Analysis" title="Loaded, heated and stressed in software first">
        <FeatureGrid
          items={[
            {
              title: 'Structural FEA',
              desc: 'Stress, deflection, fatigue and buckling under the load cases the part will genuinely see — not idealised ones.',
            },
            {
              title: 'Thermal and CFD',
              desc: 'Heat transfer and fluid flow for enclosures, ducting and cooling paths.',
            },
            {
              title: 'Reportable results',
              desc: 'Documented, repeatable studies that stand up to review by your customer and your auditor.',
            },
          ]}
        />
      </Section>

      <Section id="production" index="03" eyebrow="Production" title="Made, not just specified">
        <FeatureGrid
          items={[
            {
              title: 'Precision manufacturing',
              desc: 'Machining, fabrication and assembly to the drawings we produced — so nothing is lost in translation.',
            },
            {
              title: 'Supply chain',
              desc: 'Global sourcing, vendor qualification and logistics handled as part of the project, not billed as a surprise.',
            },
            {
              title: 'ISO 9001:2015',
              desc: 'A certified quality management system covering every delivery, not a badge on a website.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Have a part that needs proving?"
        body="Send the drawings or the STEP file. We will tell you what the analysis would involve and what it would cost."
      />
    </>
  );
}
