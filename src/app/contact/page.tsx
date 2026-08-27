import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/ui';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell Canorous what you are building — engineering, simulation, real-time 3D or AI training. We will come back with an approach.',
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you are"
        accent="working on."
        intro="A couple of sentences is enough to start. We will come back with an approach and an honest view of the timeline."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <ContactForm />

          <aside className="space-y-6">
            <div className="rounded-lg border border-hairline bg-surface p-6">
              <h2 className="font-display text-base font-semibold text-ink">
                What helps us answer faster
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
                <li>• What you are building, in a sentence</li>
                <li>• Whether CAD or 3D data already exists</li>
                <li>• Where it needs to end up — browser, headset, or production</li>
                <li>• Any date you are working to</li>
              </ul>
            </div>

            <div className="rounded-lg border border-hairline bg-white p-6 shadow-card">
              <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">Direct</p>
              <a
                href="mailto:hello@canorous.com"
                className="mt-2 block font-medium text-link underline underline-offset-4"
              >
                hello@canorous.com
              </a>
              <p className="mt-3 text-sm text-ink-muted">
                Coimbatore, Tamil Nadu, India
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-white p-6 shadow-card">
              <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">
                Certification
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-ink">ISO 9001:2015</p>
              <p className="mt-1 text-sm text-ink-muted">Quality Management System</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
