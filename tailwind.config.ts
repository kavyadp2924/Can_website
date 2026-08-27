import type { Config } from 'tailwindcss';

/**
 * CTPL brand system.
 *
 * Deliberately self-contained rather than importing the portal's shared preset:
 * this is a standalone project with its own deploy target, and a static
 * marketing site should not need the portal monorepo checked out to build.
 *
 * Colours resolve to the CSS custom properties in src/app/globals.css.
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: 'var(--ctpl-red)',
          blue: 'var(--ctpl-blue)',
        },
        red: {
          100: 'var(--ctpl-red-100)',
          200: 'var(--ctpl-red-200)',
          300: 'var(--ctpl-red-300)',
          500: 'var(--ctpl-red-500)',
          700: 'var(--ctpl-red-700)',
          800: 'var(--ctpl-red-800)',
          900: 'var(--ctpl-red-900)',
        },
        blue: {
          100: 'var(--ctpl-blue-100)',
          200: 'var(--ctpl-blue-200)',
          300: 'var(--ctpl-blue-300)',
          500: 'var(--ctpl-blue-500)',
          700: 'var(--ctpl-blue-700)',
          800: 'var(--ctpl-blue-800)',
          900: 'var(--ctpl-blue-900)',
        },
        ink: {
          DEFAULT: 'var(--ctpl-text)',
          secondary: 'var(--ctpl-text-secondary)',
          muted: 'var(--ctpl-text-muted)',
          subtle: 'var(--ctpl-text-subtle)',
        },
        surface: {
          DEFAULT: 'var(--ctpl-surface)',
          page: 'var(--ctpl-bg)',
          subtle: 'var(--ctpl-bg-subtle)',
        },
        hairline: 'var(--ctpl-hairline)',
        'border-strong': 'var(--ctpl-border-strong)',
        'card-hover': 'var(--ctpl-card-hover-bg)',
        'card-hover-edge': 'var(--ctpl-card-hover-border)',
        link: {
          DEFAULT: 'var(--ctpl-link)',
          hover: 'var(--ctpl-link-hover)',
        },
        success: { DEFAULT: 'var(--ctpl-success)', bg: 'var(--ctpl-success-bg)' },
        danger: { DEFAULT: 'var(--ctpl-danger)', bg: 'var(--ctpl-danger-bg)' },
      },

      fontFamily: {
        display: 'var(--ctpl-font-display)',
        sans: 'var(--ctpl-font-body)',
        mono: 'var(--ctpl-font-mono)',
      },

      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.125em', fontWeight: '600' }],
        display: ['2.75rem', { lineHeight: '1.12', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-xl': ['4.75rem', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
      },

      backgroundImage: {
        'ctpl-gradient': 'var(--ctpl-gradient)',
        'ctpl-hero-wash': 'var(--ctpl-hero-wash)',
      },

      boxShadow: {
        card: 'var(--ctpl-shadow-card)',
        raised: 'var(--ctpl-shadow-raised)',
        cta: 'var(--ctpl-shadow-cta)',
      },

      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '20px',
      },

      letterSpacing: {
        eyebrow: '0.125em',
      },

      transitionDuration: {
        micro: '160ms',
        ui: '280ms',
        content: '720ms',
        cinema: '1200ms',
      },

      transitionTimingFunction: {
        'ctpl-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ctpl-inout': 'cubic-bezier(0.62, 0.05, 0.01, 0.99)',
      },
    },
  },
  plugins: [],
} satisfies Config;
