/**
 * AI page content.
 *
 * Product names, taglines and pipeline stages are as supplied. The `summary`
 * lines describe only what the supplied pipeline itself states — no capacity,
 * accuracy, throughput or customer claims are made anywhere on this page,
 * because none were provided. When the full product copy is available it
 * replaces `summary` here and nothing in the page component needs to change.
 */

export interface AiProduct {
  id: string;
  index: string;
  name: string;
  tagline: string;
  summary: string;
  /** The product's processing pipeline, start to finish. */
  pipeline: string[];
  /** Heading for the pipeline panel. Defaults to "Pipeline"; the inventory
   *  platform overrides it, because its list is a set of collaborating agents
   *  rather than a sequence of stages and labelling it "Pipeline" would
   *  contradict the topology drawn beside it. */
  flowLabel?: string;
}

export const PRODUCTS: AiProduct[] = [
  {
    id: 'floorplan3d',
    index: '01',
    name: 'AI FloorPlan3D',
    tagline: '2D Floor Plan to 3D Generation Platform',
    summary:
      'Takes a 2D floor plan and works up from it: spaces are detected, the structure behind them is interpreted, a 3D model is generated from that interpretation, and the result is explorable as a walkthrough rather than delivered as a static render.',
    pipeline: [
      '2D Floor Plan',
      'Space Detection',
      'Structural Interpretation',
      '3D Generation',
      'Interactive Walkthrough',
    ],
  },
  {
    id: 'cadforge',
    index: '02',
    name: 'CADForge',
    tagline: 'AI-Powered CAD Reconstruction Platform',
    summary:
      'Reconstructs editable CAD geometry from drawings that only exist as documents. A PDF or image is processed, segmented, and read — including its text, via OCR — then analysed geometrically and reassembled into structure, and written out as DXF or DWG.',
    pipeline: [
      'PDF / PNG / JPG',
      'Image Processing',
      'Segmentation',
      'Object Detection',
      'OCR',
      'Geometric Analysis',
      'Structural Reconstruction',
      'DXF / DWG',
    ],
  },
  {
    id: 'inventory',
    index: '03',
    name: 'AI Inventory Management System',
    tagline: 'Multi-Agent Inventory Intelligence Platform',
    summary:
      'Runs inventory as a set of specialist agents — inventory, procurement, sales intelligence, warehouse and analytics — coordinated by a central AI rather than as one monolithic rules engine.',
    flowLabel: 'Agents',
    pipeline: [
      'Central AI',
      'Inventory Agent',
      'Procurement',
      'Sales Intelligence',
      'Warehouse Agent',
      'Analytics',
    ],
  },
  {
    id: 'marketing',
    index: '04',
    name: 'AI Marketing Agent',
    tagline: 'Marketing Automation & Customer Engagement Platform',
    summary:
      'Carries a lead through qualification, decides the next action, runs the follow-up, and keeps the customer journey moving through to conversion — as one automated sequence rather than a set of disconnected campaigns.',
    pipeline: [
      'Lead',
      'Qualification',
      'AI Decision',
      'Follow-up',
      'Customer Journey',
      'Conversion',
    ],
  },
  {
    id: 'documentation',
    index: '05',
    name: 'Documentation AI',
    tagline: 'Intelligent Document Generation Platform',
    summary:
      'Turns raw information into a finished document: the input is processed, structured into sections, laid into a template, and produced as the final document.',
    pipeline: [
      'Raw Information',
      'AI Processing',
      'Structuring',
      'Template',
      'Final Document',
    ],
  },
];

export const WHY = [
  {
    title: 'Enterprise-Focused',
    desc: 'Built to solve real operational challenges across industries.',
  },
  {
    title: 'Intelligent Automation',
    desc: 'Reduce repetitive work and improve productivity through AI-driven workflows.',
  },
  {
    title: 'Scalable Architecture',
    desc: 'Designed to support growing businesses and enterprise requirements.',
  },
  {
    title: 'Multi-Agent Intelligence',
    desc: 'Specialized AI agents collaborate to automate complex business processes.',
  },
  {
    title: 'Customizable & Integratable',
    desc: 'Easily integrates with existing ERP, CRM, CAD, inventory, and business systems.',
  },
  {
    title: 'Future-Ready Technology',
    desc: 'Powered by Artificial Intelligence, Computer Vision, Workflow Automation, Generative AI, and Multi-Agent Systems.',
  },
];
