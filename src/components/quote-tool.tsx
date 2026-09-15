'use client';

import { useRef, useState } from 'react';
import { Input, RadioGroup, Select, Stepper, Textarea } from './form-fields';
import { submitForm } from '@/lib/forms';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const STEPS = ['Service', 'Details', 'Reference', 'Contact', 'Review'];

const SERVICE_OPTIONS = [
  { value: 'engineering-fea', label: 'Engineering & FEA', desc: 'CAD, structural and fatigue analysis' },
  { value: 'cfd', label: 'CFD', desc: 'Flow and thermal simulation' },
  { value: 'real-time-3d', label: 'Real-Time 3D', desc: 'Configurators, product visualisation' },
  { value: 'immersive-architecture', label: 'Immersive Architecture', desc: 'Walkthroughs, VR training' },
  { value: 'manufacturing', label: 'Manufacturing', desc: 'Design for manufacture, production' },
  { value: 'other', label: 'Something else', desc: 'Tell us in the details step' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3-months', label: '1–3 months' },
  { value: '3-6-months', label: '3–6 months' },
  { value: 'flexible', label: 'Flexible / exploring' },
];

/**
 * Multi-step quote tool. Every step's fields stay mounted for the lifetime of
 * the form (toggled with the `hidden` attribute rather than being
 * unmounted/remounted), which keeps every field a plain uncontrolled input —
 * the same pattern as contact-form.tsx — and means a single `FormData` read
 * on submit sees every step's answers, not just the current one. `hidden`
 * also takes a step's fields out of constraint validation while it's not the
 * active step, so `form.reportValidity()` only checks what's currently shown.
 */
export function QuoteTool() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string>>({});
  const [renderedAt] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  const isLast = step === STEPS.length - 1;

  function readSummary() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setSummary({
      service: SERVICE_OPTIONS.find((o) => o.value === data.get('service'))?.label ?? '—',
      details: (data.get('details') as string) || '—',
      timeline: TIMELINE_OPTIONS.find((o) => o.value === data.get('timeline'))?.label ?? '—',
      budget: (data.get('budget') as string) || '—',
      name: (data.get('name') as string) || '—',
      email: (data.get('email') as string) || '—',
      company: (data.get('company') as string) || '—',
      attachment: (data.get('attachment') as File)?.name || 'None',
    });
  }

  function goNext() {
    if (!formRef.current?.reportValidity()) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    if (next === STEPS.length - 1) readSummary();
    setStep(next);
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLast) return;

    const form = new FormData(event.currentTarget);
    if (form.get('website')) return; // honeypot tripped — silently drop
    if (Date.now() - renderedAt < 1500) return; // submitted implausibly fast

    setStatus('sending');
    setError(null);

    const attachment = form.get('attachment');
    const file = attachment instanceof File && attachment.size > 0 ? attachment : null;

    try {
      const result = await submitForm(
        'New quote request',
        {
          service: SERVICE_OPTIONS.find((o) => o.value === form.get('service'))?.label,
          details: form.get('details'),
          timeline: TIMELINE_OPTIONS.find((o) => o.value === form.get('timeline'))?.label,
          budget: form.get('budget'),
          name: form.get('name'),
          email: form.get('email'),
          company: form.get('company'),
          phone: form.get('phone'),
        },
        file,
      );
      if (!result.ok) throw new Error(result.message ?? 'Request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('Could not send your request. Please email us directly at hello@canorous.com instead.');
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="motion-safe:animate-[riseIn_0.5s_ease-out] rounded-lg border border-success/20 bg-success-bg p-8 text-center"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success/15 motion-safe:animate-[riseIn_0.6s_cubic-bezier(0.16,1,0.3,1)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-success">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4.5 4.5L19 7" />
          </svg>
        </span>
        <p className="font-display text-lg font-semibold text-success">Request sent</p>
        <p className="mt-2 text-sm text-ink-secondary">
          Thanks — we read every one of these and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Stepper steps={STEPS} current={step} />

      <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
        {error && (
          <p
            role="alert"
            className="motion-safe:animate-[riseIn_0.4s_ease-out] rounded border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}

        {/* Step 1 — service type */}
        <div hidden={step !== 0} className="space-y-6">
          <RadioGroup label="What kind of work is this?" name="service" required={step === 0} options={SERVICE_OPTIONS} />
        </div>

        {/* Step 2 — project details */}
        <div hidden={step !== 1} className="space-y-5">
          <Textarea
            label="Tell us about the project"
            name="details"
            required={step === 1}
            rows={6}
            placeholder="What are you trying to settle, and what have you tried so far?"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Timeline" name="timeline" required={step === 1} options={TIMELINE_OPTIONS} />
            <Input label="Budget range" name="budget" placeholder="e.g. ₹5–10L" />
          </div>
        </div>

        {/* Step 3 — reference upload */}
        <div hidden={step !== 2} className="space-y-1.5">
          <label htmlFor="attachment" className="block text-sm font-medium text-ink-secondary">
            Reference drawing or document
            <span className="ml-1 text-ink-subtle">(optional)</span>
          </label>
          <input
            id="attachment"
            name="attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.step,.stp,.dwg"
            className="block w-full text-sm text-ink-muted file:mr-4 file:rounded file:border-0 file:bg-ctpl-gradient file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110"
          />
          <p className="text-xs text-ink-subtle">A drawing, CAD file or photo helps, but is not required to get a response.</p>
        </div>

        {/* Step 4 — contact info */}
        <div hidden={step !== 3} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Your name" name="name" required={step === 3} autoComplete="name" />
            <Input label="Work email" name="email" type="email" required={step === 3} autoComplete="email" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Company" name="company" autoComplete="organization" />
            <Input label="Phone" name="phone" type="tel" autoComplete="tel" />
          </div>
        </div>

        {/* Step 5 — review */}
        <div hidden={step !== 4} className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
          <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">Review before sending</p>
          <dl className="mt-2 space-y-2 text-sm">
            {[
              ['Service', summary.service],
              ['Timeline', summary.timeline],
              ['Budget', summary.budget],
              ['Contact', `${summary.name} · ${summary.email}${summary.company && summary.company !== '—' ? ` · ${summary.company}` : ''}`],
              ['Attachment', summary.attachment],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-ink-muted">{label}</dt>
                <dd className="text-ink-secondary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Honeypot — same pattern as contact-form.tsx */}
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="quote-website">Website</label>
          <input id="quote-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex h-11 items-center justify-center rounded border border-border-strong bg-white px-6 text-sm font-semibold text-ink transition-opacity duration-ui disabled:pointer-events-none disabled:opacity-0"
          >
            Back
          </button>

          {isLast ? (
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded bg-ctpl-gradient px-8 text-sm font-semibold text-white shadow-cta transition-[filter,transform] duration-ui ease-ctpl-out hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
            >
              {status === 'sending' && (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 motion-safe:animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
              )}
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-ctpl-fill px-7 text-sm font-semibold text-white shadow-cta"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
