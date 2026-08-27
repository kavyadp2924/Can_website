/**
 * Content for the Visualization page and its scroll-driven 3D "game" experience.
 *
 * Kept in its own module so the server-rendered page and the client-only game
 * component both read from one source — the level panels in the game are the
 * same copy that once lived as static sections, so nothing is duplicated or
 * allowed to drift.
 */

export interface Project {
  id: string;
  name: string;
  place: string | null;
  kind: string;
  summary: string;
  scope: string[];
  workflow: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'rohaan-bliss',
    name: 'Rohaan Bliss Residency',
    place: 'Chennai',
    kind: 'Residential visualisation & promotional experience',
    summary:
      'A comprehensive residential visualisation presenting the architectural design, interiors, landscape and overall living experience through high-quality digital content. Architectural information was converted into detailed 3D environments, then developed into walkthrough and promotional material for presentation and marketing.',
    scope: [
      'Residential architectural 3D modelling',
      '2D floor plan to 3D development',
      'Interior modelling and visualisation',
      'Exterior architectural visualisation',
      'Landscape and environmental development',
      'Realistic materials and lighting',
      'Interior walkthrough production',
      'AI-assisted promotional content',
      'Video editing and presentation development',
    ],
    workflow: [
      'Architectural plans',
      '3D modelling',
      'Interior & exterior',
      'Visualisation',
      'Real-time experience',
      'Walkthrough & promo',
    ],
  },
  {
    id: 'auroville',
    name: 'Auroville',
    place: null,
    kind: '2D floor plan to 3D walkthrough',
    summary:
      'Transforming a conventional 2D architectural floor plan into a detailed 3D environment and walkthrough. The result gives a far more intuitive reading of the spatial arrangement, the architectural elements, and how the different areas of the proposed space relate to one another.',
    scope: [
      '2D floor plan analysis and verification',
      'Architectural plan interpretation',
      '2D to 3D conversion',
      '3D architectural modelling',
      'Spatial visualisation',
      'Interior and architectural detailing',
      'Camera and walkthrough development',
      'Presentation-ready visualisation',
    ],
    workflow: ['2D floor plan', 'Plan analysis', '3D development', 'Visualisation', 'Walkthrough'],
  },
];

export const VILLA_HIGHLIGHTS = [
  {
    title: 'Realistic 3D visualisation',
    desc: 'Geometry and detail accurate enough that decisions made from it still hold on site.',
  },
  {
    title: 'Exterior and landscape',
    desc: 'The building in its setting — planting, levels, boundaries, and how it meets the ground.',
  },
  {
    title: 'Detailed interior visualisation',
    desc: 'Living room, dining area and bedrooms, furnished to scale rather than sketched in.',
  },
  {
    title: 'Interior walkthrough',
    desc: 'Explored at eye level, in the order you would actually move through the spaces.',
  },
  {
    title: 'Realistic lighting and materials',
    desc: 'Physically based surfaces and daylight, so a finish that reads warm here reads warm once installed.',
  },
  {
    title: 'Architectural environment',
    desc: 'The surroundings that give a building its sense of place instead of leaving it floating.',
  },
  {
    title: 'Immersive interactive presentation',
    desc: 'Explored rather than watched. The viewer chooses where to look, and that is when they believe it.',
  },
  {
    title: 'High-quality rendering',
    desc: 'Stills pulled from the same scene for brochures, listings and planning submissions.',
  },
];

export const UNREAL = [
  'Real-time architectural walkthroughs',
  'High-fidelity visualisation',
  'Interactive 3D environments',
  'Immersive presentations',
  'Virtual experiences',
  'Real-time lighting and rendering',
  'Large-scale architectural environments',
];

export const UNITY = [
  'Interactive architectural applications',
  'Real-time 3D experiences',
  'Cross-platform visualisation',
  'Interactive property presentations',
  'AR and VR experiences',
  'Digital twin applications',
  'Customised visualisation applications',
];

export const CAPABILITIES = [
  {
    title: '3D Visualisation',
    desc: 'Architectural concepts turned into detailed, realistic 3D environments.',
  },
  {
    title: 'Architectural Walkthroughs',
    desc: 'Immersive walkthroughs that communicate spatial design and project intent.',
  },
  {
    title: 'Real-Time Visualisation',
    desc: 'Interactive environments in Unreal Engine and Unity, explored live.',
  },
  {
    title: 'AR & VR',
    desc: 'Clients and stakeholders experiencing the space through immersive technology.',
  },
  {
    title: 'Digital Twins',
    desc: 'Interactive digital representations of physical assets, spaces and environments.',
  },
  {
    title: 'AI-Powered Visualisation',
    desc: 'AI woven into visualisation and content production to accelerate creative work.',
  },
  {
    title: 'Interactive Experiences',
    desc: 'Custom applications that let people explore and understand a project themselves.',
  },
];

/**
 * The order of the journey. Each entry is a "level" the camera flies through;
 * its `Panel` is rendered as HTML beside the 3D scene (see
 * src/components/visualization-game.tsx) so the copy stays selectable,
 * crawlable and screen-reader friendly rather than baked into a texture.
 */
export const LEVEL_ORDER = [
  'concept',
  'rohaan-bliss',
  'auroville',
  'villa',
  'engines',
  'capabilities',
] as const;

export type LevelId = (typeof LEVEL_ORDER)[number];
