import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy',
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy" accent="policy." />

      <Section>
        <div className="max-w-3xl">
          {/*
            Deliberately a placeholder rather than copied wording. A privacy
            policy is a legal commitment about what actually happens to data, and
            this site collects differently from the previous one — a single
            contact form posting to a separate API, no analytics, no cookies. The
            text has to describe that, and be reviewed, rather than inherited.
          */}
          <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8">
            <p className="text-sm leading-relaxed text-ink-secondary">
              This policy is being rewritten to describe how the new site handles data, and needs
              review before publication.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              What it will need to cover: the contact form is the only thing that collects personal
              data; submissions are sent to Canorous by email and are not shared; the site sets no
              cookies and runs no analytics.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              For anything urgent in the meantime, write to{' '}
              <a href="mailto:hello@canorous.com" className="text-link underline underline-offset-4">
                hello@canorous.com
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
