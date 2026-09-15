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
 * The contact form and quote tool therefore submit from the browser straight
 * to Web3Forms (see src/lib/forms.ts) rather than to a backend this site owns.
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

  experimental: {
    // Inline the (~10 KB compressed) stylesheet into each HTML page. A static
    // export has no server push, so otherwise the browser must fetch the CSS
    // file before it can paint anything — Lighthouse measured that round trip
    // at ~0.5s of render-blocking time on a mobile connection.
    inlineCss: true,
  },

  // Firebase Hosting serves /about/index.html for /about when this is on;
  // without it a refresh on a nested route can 404 depending on the rewrite
  // configuration.
  trailingSlash: true,
};

export default nextConfig;
