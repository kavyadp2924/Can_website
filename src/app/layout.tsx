import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SmoothScroll } from '@/components/smooth-scroll';

/**
 * next/font downloads and self-hosts these at build time, so the static export
 * carries the font files itself — no render-blocking request to a font CDN, and
 * no third-party origin to allow through a CSP.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canorous.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Canorous Technology — Engineering, Simulation and Real-Time 3D',
    template: '%s · Canorous Technology',
  },
  description:
    'We engineer the product, validate it under load, and build the real-time experience that puts it in front of your customer. One team, one model, no reinterpretation between steps.',
  openGraph: {
    type: 'website',
    siteName: 'Canorous Technology',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <SmoothScroll>
          <main id="main">{children}</main>
        </SmoothScroll>
        <SiteFooter />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Canorous Technology',
              alternateName: 'CTPL',
              url: SITE_URL,
              description:
                'Mechanical engineering, FEA and CFD simulation, real-time 3D and immersive experiences, and precision manufacturing. ISO 9001:2015 certified.',
            }),
          }}
        />
      </body>
    </html>
  );
}
