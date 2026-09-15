import type { MetadataRoute } from 'next';
import { PROJECTS } from './work/content';

export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canorous.com';

/**
 * Generated at build time (works under `output: 'export'` since every route
 * here is static). This replaces a hand-maintained public/sitemap.xml so new
 * routes can't silently drift out of sync with what actually exists under
 * src/app.
 *
 * /privacy is intentionally omitted — robots.txt already disallows it.
 */
const ROUTES: { path: string; changefreq: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/visualization', changefreq: 'weekly', priority: 0.9 },
  { path: '/engineering', changefreq: 'monthly', priority: 0.8 },
  { path: '/ai', changefreq: 'monthly', priority: 0.8 },
  { path: '/canorous-edge', changefreq: 'monthly', priority: 0.8 },
  { path: '/solutions', changefreq: 'monthly', priority: 0.8 },
  { path: '/solutions/engineering', changefreq: 'monthly', priority: 0.7 },
  { path: '/solutions/real-time-3d', changefreq: 'monthly', priority: 0.7 },
  { path: '/solutions/immersive-architecture', changefreq: 'monthly', priority: 0.7 },
  { path: '/products', changefreq: 'monthly', priority: 0.6 },
  { path: '/products/presentation', changefreq: 'monthly', priority: 0.6 },
  { path: '/work', changefreq: 'weekly', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.7 },
  { path: '/quote', changefreq: 'monthly', priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ROUTES.map(({ path, changefreq, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: changefreq,
    priority,
  }));

  const caseStudies = PROJECTS.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...caseStudies];
}
