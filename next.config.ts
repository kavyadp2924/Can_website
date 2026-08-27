import type { NextConfig } from 'next';

/**
 * Static export, for Firebase Hosting.
 *
 * `output: 'export'` writes plain HTML/CSS/JS to ./out with no Node process
 * involved at runtime. That has consequences worth knowing before adding
 * anything to this site:
 *
 *   • No Server Actions, Route Handlers or server-side data fetching.
 *   • No middleware.
 *   • next/image must be unoptimized — the optimiser is a server.
 *   • Every route must be statically knowable at build time.
 *
 * The contact form therefore submits from the browser to the portal API on a
 * different origin, rather than posting back to this site.
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // No image optimiser exists in a static export. Source images are
    // pre-compressed to WebP instead — see the note in public/images.
    unoptimized: true,
  },

  // Firebase Hosting serves /about/index.html for /about when this is on;
  // without it a refresh on a nested route can 404 depending on the rewrite
  // configuration.
  trailingSlash: true,

  env: {
    // Baked in at build time. A static site has no runtime environment, so this
    // must be set before `next build`, not on the host.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  },
};

export default nextConfig;
