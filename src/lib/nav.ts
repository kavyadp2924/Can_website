/**
 * Site navigation — one definition, used by the desktop nav, the mobile drawer
 * and the footer.
 *
 * The four capability destinations sit at the top level, because those are what
 * someone arrives wanting; "Explore" holds only the company pages behind them.
 *
 * Note that the pages NOT listed here still exist and still route — the
 * solutions tree, the work index, the presentation product. They are reached
 * from the footer and from in-page links rather than from the header, which
 * keeps the header about what the company sells rather than about the sitemap.
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
    name: 'Engineering',
    href: '/engineering',
  },
  {
    name: 'AI',
    href: '/ai',
  },
  {
    name: 'Canorous Edge',
    href: '/canorous-edge',
  },
  {
    name: 'Explore',
    href: '/about',
    children: [
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
