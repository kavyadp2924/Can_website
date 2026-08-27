import type { Metadata } from 'next';
import { CtaBand, FeatureGrid, Section, StickySectionNav } from '@/components/ui';
import { FeatureHero } from '@/components/feature-hero';
import { FadeIn } from '@/components/motion';
import { Reveal } from '@/components/motion-primitives';
import { CapabilityList, TagGrid } from '@/components/sections';
import { ProcessRail } from '@/components/process-rail';

export const metadata: Metadata = {
  title: 'Engineering Design & Analysis',
  description:
    'Engineering design and analysis services from Canorous Technologies — OpenCAD-based 2D and 3D design, structural and component analysis, design optimization and technical documentation.',
};

const DESIGN_SERVICES = [
  '2D engineering design',
  '3D engineering modelling',
  'Component design',
  'Assembly design',
  'Detailed technical drawings',
  'Design modifications and optimization',
  'Engineering documentation',
  'CAD model development',
];

const ANALYSIS_CAPABILITIES = [
  'Structural analysis',
  'Design validation',
  'Load and stress evaluation',
  'Component analysis',
  'Performance evaluation',
  'Design optimization',
  'Engineering feasibility analysis',
];

const WORKFLOW = [
  {
    index: '01',
    title: 'Requirement Analysis',
    desc: 'We understand the project requirements, functional objectives, technical constraints, and design specifications.',
  },
  {
    index: '02',
    title: 'Concept Development',
    desc: 'Initial engineering concepts and design approaches are developed based on the project requirements.',
  },
  {
    index: '03',
    title: 'CAD Design',
    desc: 'Detailed 2D and 3D engineering models are developed using OpenCAD-based workflows.',
  },
  {
    index: '04',
    title: 'Engineering Analysis',
    desc: 'The proposed design is evaluated against relevant engineering parameters to identify potential design limitations and performance considerations.',
  },
  {
    index: '05',
    title: 'Design Optimization',
    desc: 'Based on the analysis results, the design can be refined and optimized for performance, manufacturability, efficiency, and reliability.',
  },
  {
    index: '06',
    title: 'Technical Documentation',
    desc: 'Final engineering drawings, models, specifications, and supporting documentation are prepared for downstream engineering and manufacturing processes.',
  },
];

const SERVICES = [
  'Engineering Design',
  'CAD Modelling',
  '2D & 3D Design',
  'Engineering Analysis',
  'Design Optimization',
  'Technical Documentation',
];

const WHY = [
  {
    title: 'Precision-Driven Design',
    desc: 'Engineering models and drawings developed with attention to dimensional and functional requirements.',
  },
  {
    title: 'Analysis-Based Decisions',
    desc: 'Use engineering analysis to evaluate and improve designs before implementation.',
  },
  {
    title: 'Integrated Workflow',
    desc: 'Design, analysis, optimization, and documentation are handled as a connected engineering process.',
  },
  {
    title: 'Digital Engineering',
    desc: 'Leverage modern CAD and computational technologies to improve engineering workflows.',
  },
  {
    title: 'Scalable Solutions',
    desc: 'Support individual components, assemblies, and larger engineering projects based on project requirements.',
  },
];

export default function EngineeringPage() {
  return (
    <>
      <FeatureHero
        eyebrow="Engineering Design & Analysis"
        title="Engineering solutions built for"
        accent="precision and performance."
        lede="At Canorous Technologies, we provide engineering design and analysis services that transform technical concepts into accurate, practical, and production-ready engineering solutions."
        body={[
          'Using OpenCAD-based design workflows, engineering principles, computational tools, and digital modelling technologies, we support the complete process from initial concept and design development through analysis, refinement, and technical documentation.',
          'Our engineering capabilities are focused on delivering accurate designs, reliable analysis, and efficient engineering workflows for a wide range of applications.',
        ]}
        variant="engineering"
        primary={{ href: '/contact/', label: 'Discuss a project' }}
        secondary={{ href: '#workflow', label: 'See the workflow' }}
        readout={['Model · datum locked', 'holes 2 · bevel 0.04']}
      />

      <StickySectionNav
        items={[
          { id: 'design', label: 'Design' },
          { id: 'analysis', label: 'Analysis' },
          { id: 'workflow', label: 'Workflow' },
          { id: 'services', label: 'Services' },
          { id: 'why', label: 'Why Canorous' },
        ]}
      />

      <Section
        id="design"
        index="01"
        eyebrow="Engineering Design"
        title="Designs developed from the requirement, not around it"
        intro="We develop detailed engineering designs based on project requirements, technical specifications, drawings, and functional requirements."
      >
        <CapabilityList title="Services Include" items={DESIGN_SERVICES} />
      </Section>

      <Section
        id="analysis"
        tone="surface"
        index="02"
        eyebrow="Engineering Analysis"
        title="Evaluated before it is committed to"
        intro="We perform engineering analysis to evaluate designs, identify potential issues, and support informed engineering decisions."
      >
        <FadeIn>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Our analysis-driven approach helps validate designs before manufacturing or
            implementation, reducing the risk of costly design changes later in the development
            process.
          </p>
        </FadeIn>
        <CapabilityList title="Analysis Capabilities" items={ANALYSIS_CAPABILITIES} />
      </Section>

      <Section
        id="workflow"
        index="03"
        eyebrow="OpenCAD-Based Engineering Workflow"
        title="Six stages, run as one connected process"
        intro="Our engineering workflow combines CAD modelling with analysis and design validation to create a structured development process."
      >
        <ProcessRail stages={WORKFLOW} />
      </Section>

      <Section
        id="services"
        tone="surface"
        index="04"
        eyebrow="From Concept to Engineering Solution"
        title="Bridging conceptual design and practical implementation"
        intro="By combining CAD design, engineering analysis, digital modelling, and technical documentation, we help businesses develop engineering solutions that are accurate, efficient, and ready for the next stage of development."
      >
        <Reveal>
          <h3 className="mb-5 text-eyebrow uppercase tracking-eyebrow text-ink-muted">
            Engineering Services
          </h3>
        </Reveal>
        <TagGrid items={SERVICES} />
      </Section>

      <Section
        id="why"
        index="05"
        eyebrow="Why Canorous Technologies?"
        title="Five reasons the work holds up"
      >
        <FeatureGrid items={WHY} />
      </Section>

      <CtaBand
        title="Engineering the Future"
        body="From initial concepts to detailed CAD designs and engineering analysis, we provide technology-driven engineering solutions that help businesses design better, validate faster, and move confidently toward production. Design. Analyze. Optimize. Deliver."
        action="Start a conversation"
      />
    </>
  );
}
