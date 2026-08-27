/**
 * Site navigation — one definition, used by the desktop nav, the mobile drawer
 * and the footer.
 *
 * Deliberately two items. Visualisation is the work the company leads with, so
 * it gets a top-level slot of its own; everything else collapses into a single
 * "Explore" menu. A flat list of five or six top-level items spreads attention
 * evenly across things that are not equally important.
 */

export interface NavChild {
  name: string;
  href: string;
  description?: string;
}

export interface NavItem {
  name: string;
  href: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    // No dropdown: this is one destination, and the page itself is the pitch.
    name: 'Visualization',
    href: '/visualization',
  },
  {
    name: 'Explore',
    href: '/solutions',
    children: [
      {
        name: 'Solutions',
        href: '/solutions',
        description: 'Engineering, real-time 3D and immersive work by industry',
      },
      {
        name: 'Engineering & Simulation',
        href: '/solutions/engineering',
        description: 'CAD, FEA and CFD through to production',
      },
      {
        name: 'Real-Time 3D Studio',
        href: '/solutions/real-time-3d',
        description: 'Unreal, Unity and browser streaming',
      },
      {
        name: 'Immersive Architecture',
        href: '/solutions/immersive-architecture',
        description: 'Walkable, configurable, decided in one meeting',
      },
      {
        name: 'Presentation',
        href: '/products/presentation',
        description: 'Live 3D in the room instead of a slide',
      },
      {
        name: 'Canorous Edge',
        href: '/canorous-edge',
        description: 'Hands-on AI training run by the engineering team',
      },
      {
        name: 'Work',
        href: '/work',
        description: 'Selected projects across every discipline',
      },
      {
        name: 'About',
        href: '/about',
        description: 'Who we are and how the work moves',
      },
      {
        name: 'Contact',
        href: '/contact',
        description: 'Tell us what you are building',
      },
    ],
  },
];

export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001';

/**
 * The API the contact form posts to.
 *
 * Baked in at build time — a static export has no runtime environment, so this
 * has to be set before `next build`, not on the host.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
