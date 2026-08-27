import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, PageHero, Section, StickySectionNav } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Real-Time 3D Studio',
  description:
    'Unreal Engine and Unity development, CAD-to-real-time pipelines, VR and AR builds, and pixel streaming to any browser.',
};

export default function RealTime3DPage() {
  return (
    <>
      <PageHero
        eyebrow="Real-Time 3D Studio"
        title="Sixty frames a second,"
        accent="from the real geometry."
        intro="Engineering data is not built for real time. Getting it there without losing what makes it accurate is the entire craft."
      />

      <StickySectionNav
        items={[
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'delivery', label: 'Delivery' },
        ]}
      />

      <Section id="pipeline" index="01" eyebrow="The pipeline" title="What happens between CAD and a running scene">
        <FeatureGrid
          items={[
            {
              title: 'Preparation',
              desc: 'Tessellation, retopology and hierarchy clean-up that keeps assemblies intact instead of collapsing them into a single mesh.',
            },
            {
              title: 'Materials',
              desc: 'Physically based surfaces built in Substance, so brushed aluminium reads as brushed aluminium under any lighting.',
            },
            {
              title: 'Optimisation',
              desc: 'Levels of detail, instancing and draw-call budgets set against the hardware it actually has to run on.',
            },
          ]}
        />
      </Section>

      <Section id="delivery" index="02" tone="surface" eyebrow="Delivery" title="However it needs to reach people">
        <FeatureGrid
          items={[
            {
              title: 'VR and AR builds',
              desc: 'Headset-native applications in Unreal and Unity, for demonstration or for training.',
            },
            {
              title: 'Pixel streaming',
              desc: 'The scene renders on a server and streams to a browser — no install, no GPU requirement, no lost prospect.',
            },
            {
              title: 'Configurators',
              desc: 'Variants, materials and layouts a customer can change themselves, live.',
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Got a model that needs to move?"
        body="Tell us what it is and where it has to run. We will tell you what it takes."
      />
    </>
  );
}
