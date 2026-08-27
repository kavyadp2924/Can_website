import Link from 'next/link';
import { GradientText } from './ui';
import { PORTAL_URL } from '@/lib/nav';

const COLUMNS = [
  {
    heading: 'Solutions',
    links: [
      { name: 'Engineering & Simulation', href: '/solutions/engineering/' },
      { name: 'Real-Time 3D Studio', href: '/solutions/real-time-3d/' },
      { name: 'Immersive Architecture', href: '/solutions/immersive-architecture/' },
      { name: '3D Visualization', href: '/visualization/' },
      { name: 'All solutions', href: '/solutions/' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { name: 'About', href: '/about/' },
      { name: 'Work', href: '/work/' },
      { name: 'Canorous Edge', href: '/canorous-edge/' },
      { name: 'Contact', href: '/contact/' },
    ],
  },
  {
    heading: 'More',
    links: [
      { name: 'Presentation', href: '/products/presentation/' },
      { name: 'Privacy', href: '/privacy/' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-xl font-bold tracking-wide text-ink">
              CTP<GradientText>L</GradientText>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Engineering, simulation and real-time 3D under one roof. ISO 9001:2015 certified.
            </p>
            <a
              href={PORTAL_URL}
              className="mt-4 inline-block text-sm font-medium text-link underline underline-offset-4"
            >
              Employee login
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">
                  {column.heading}
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="underline-grow text-ink-secondary hover:text-ink">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Canorous Technology. All rights reserved.</p>
          <p>ISO 9001:2015 · Quality Management System</p>
        </div>
      </div>
    </footer>
  );
}
