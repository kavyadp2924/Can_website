'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/nav';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Contact form.
 *
 * This site is a static export with no server of its own, so the form posts
 * straight from the browser to the portal API on a different origin. Two
 * consequences follow:
 *
 *   • The API must allow this origin through CORS, and must expose the endpoint
 *     publicly with its own rate limit — it is reachable by anyone.
 *   • Nothing here can be trusted. The honeypot and the timing check below are
 *     conveniences that cut obvious bot traffic; the real validation and rate
 *     limiting have to happen server-side, because a determined submitter will
 *     simply call the endpoint directly.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [renderedAt] = useState(() => Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          company: form.get('company'),
          message: form.get('message'),
          website: form.get('website'), // honeypot
          elapsedMs: Date.now() - renderedAt,
        }),
      });

      if (!response.ok) throw new Error('Request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
      setError(
        'Could not send your message. Please email us directly at hello@canorous.com instead.',
      );
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-lg border border-success/20 bg-success-bg p-8 text-center"
      >
        <p className="font-display text-lg font-semibold text-success">Message sent</p>
        <p className="mt-2 text-sm text-ink-secondary">
          Thanks — we read every one of these and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required autoComplete="name" />
        <Field label="Work email" name="email" type="email" required autoComplete="email" />
      </div>

      <Field label="Company" name="company" autoComplete="organization" />

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-sm font-medium text-ink-secondary">
          What are you working on?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full rounded border border-border-strong bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1"
          placeholder="A couple of sentences is plenty to start."
        />
      </div>

      {/*
        Honeypot. Hidden with inline styles rather than a utility class, because
        some bots read the stylesheet looking for exactly this trick. aria-hidden
        and tabIndex keep it away from screen readers and keyboard users.
      */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex h-12 items-center justify-center rounded bg-ctpl-gradient px-8 text-sm font-semibold text-white shadow-cta transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink-secondary">
        {label}
        {!required && <span className="ml-1 text-ink-subtle">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="h-11 w-full rounded border border-border-strong bg-white px-3 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1"
      />
    </div>
  );
}
