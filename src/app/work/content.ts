/**
 * Selected work — content for the /work gallery and its per-project case
 * study pages (/work/[slug]). Kept in its own module, same pattern as
 * visualization/content.ts and ai/content.ts, so both the filterable grid and
 * the static detail routes read from one source.
 *
 * Written as outcomes rather than a list of deliverables — what the client
 * was trying to settle, and what settled it. No unverified marketing claims
 * (capacity/accuracy/throughput) — only what's actually verified/supplied.
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  discipline: string;
  tags: string[];
  image: string;
  outcome: string;
  summary: string;
  scope: string[];
  workflow: string[];
  /** Optional glTF/GLB model to render inline on the case study page. */
  modelUrl?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'valve-assembly',
    slug: 'valve-assembly-fea',
    title: 'Valve assembly, proven before tooling',
    discipline: 'Engineering & FEA',
    tags: ['Engineering', 'FEA', 'Manufacturing'],
    image: '/images/img1.png',
    outcome:
      'Finite element analysis across the full pressure range found a fatigue concentration at a transition radius. Changed in CAD in an afternoon; the same change after tooling would have been a new die.',
    summary:
      'A valve assembly was analysed under its full operating pressure range before committing to tooling. The FEA run surfaced a fatigue concentration at a transition radius that hand calculations had not flagged.',
    scope: [
      'CAD review and geometry preparation',
      'Finite element analysis across the operating pressure range',
      'Fatigue concentration investigation',
      'Geometry revision and re-validation',
    ],
    workflow: ['CAD', 'FEA setup', 'Analysis', 'Design revision', 'Re-validation'],
    // Placeholder CC0 sample model (mechanical gearbox assembly) proving the
    // viewer pipeline end-to-end — see DEPLOYMENT.md's asset pipeline notes.
    // Swap for the real assembly's own .glb export once one exists.
    modelUrl: '/models/gearbox.glb',
  },
  {
    id: 'residential-villa',
    slug: 'residential-villa-walkthrough',
    title: 'Residential villa, walked before it was poured',
    discipline: 'Immersive Architecture',
    tags: ['Architecture', 'Real-Time 3D', 'Visualization'],
    image: '/images/img2.jpg',
    outcome:
      'A browser-streamed walkthrough with switchable finishes. The client resolved a layout question in the first meeting that had already survived two rounds of drawings.',
    summary:
      'A residential design was rebuilt as an explorable, browser-streamed environment with switchable interior finishes, so a layout question that had survived two rounds of drawings could be resolved in a single meeting.',
    scope: [
      'Architectural 3D modelling from drawings',
      'Material and finish variants',
      'Real-time lighting setup',
      'Browser-streamed walkthrough delivery',
    ],
    workflow: ['Drawings', '3D modelling', 'Materials & lighting', 'Real-time build', 'Walkthrough'],
  },
  {
    id: 'industrial-plant-vr',
    slug: 'industrial-plant-vr-training',
    title: 'Industrial plant, rehearsed in the headset',
    discipline: 'VR Training',
    tags: ['VR', 'Training', 'Visualization'],
    image: '/images/digital-plant.webp',
    outcome:
      'A procedure simulation for maintenance work that cannot safely be practised on the live installation. Repeatable, measurable, and no plant downtime.',
    summary:
      'A maintenance procedure that cannot safely be rehearsed on the live installation was built as a repeatable VR simulation instead, so trainees could practise it as many times as needed without any plant downtime.',
    scope: [
      'Plant environment modelling',
      'Procedure sequencing and interaction design',
      'VR headset deployment',
      'Repeatable training scenario setup',
    ],
    workflow: ['Plant modelling', 'Procedure design', 'VR build', 'Deployment'],
  },
  {
    id: 'product-configurator',
    slug: 'product-configurator-real-time-3d',
    title: 'Product configurator, no prototype shipped',
    discipline: 'Real-Time 3D',
    tags: ['Real-Time 3D', 'Product', 'Configurator'],
    image: '/images/Vista-View.webp',
    outcome:
      'Variants, materials and internal cutaways a prospect can drive themselves — replacing a physical sample that used to travel to every trade show.',
    summary:
      'Instead of shipping a physical sample to every trade show, the product was rebuilt as a real-time configurator — variants, materials and internal cutaways a prospect can drive themselves.',
    scope: [
      'Product model preparation for real-time rendering',
      'Variant and material configuration logic',
      'Cutaway/exploded-view interaction',
      'Trade-show-ready deployment',
    ],
    workflow: ['Model prep', 'Configurator logic', 'Real-time build', 'Deployment'],
    // Placeholder CC0 sample model (consumer electronics product) proving the
    // viewer pipeline end-to-end — see DEPLOYMENT.md's asset pipeline notes.
    // Swap for the real product's own .glb export once one exists.
    modelUrl: '/models/boombox.glb',
  },
  {
    id: 'precision-components',
    slug: 'precision-components-manufacturing',
    title: 'Precision components, drawing to delivery',
    discipline: 'Manufacturing',
    tags: ['Manufacturing', 'Engineering'],
    image: '/images/bracket.jpg',
    outcome:
      'Design, validation and production handled as one engagement under ISO 9001:2015, with a single point of accountability throughout.',
    summary:
      'A set of precision components moved from drawing to delivery as one engagement — design, validation and production — under ISO 9001:2015, with a single point of accountability throughout.',
    scope: [
      'Design for manufacture review',
      'Validation ahead of production',
      'Production under ISO 9001:2015',
      'Delivery and quality documentation',
    ],
    workflow: ['Design review', 'Validation', 'Production', 'Delivery'],
    // Placeholder CC0 sample model (precision-machined metal product) proving
    // the viewer pipeline end-to-end — see DEPLOYMENT.md's asset pipeline
    // notes. Swap for a real delivered component's own .glb export once one
    // exists.
    modelUrl: '/models/camera.glb',
  },
  {
    id: 'thermal-study',
    slug: 'thermal-study-cfd',
    title: 'Thermal study for an enclosure redesign',
    discipline: 'CFD',
    tags: ['CFD', 'Engineering', 'Simulation'],
    image: '/images/simulation-analysis.webp',
    outcome:
      'Flow and heat-transfer analysis showed the proposed vent placement would not clear the hot spot. The redesign was validated in software before a single panel was cut.',
    summary:
      'An enclosure redesign was checked in CFD before fabrication. Flow and heat-transfer analysis showed the proposed vent placement would not clear the hot spot, and the corrected layout was validated in software before a single panel was cut.',
    scope: [
      'CFD model setup from CAD geometry',
      'Flow and heat-transfer analysis',
      'Vent placement evaluation',
      'Redesign validation',
    ],
    workflow: ['CAD', 'CFD setup', 'Analysis', 'Redesign', 'Validation'],
  },
];

export const DISCIPLINES = Array.from(new Set(PROJECTS.map((project) => project.discipline)));

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
