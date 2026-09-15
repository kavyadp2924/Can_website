'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/form-fields';
import { submitForm } from '@/lib/forms';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Contact form.
 *
 * This site is a static export with no server of its own, so submissions go
 * straight from the browser to Web3Forms (see src/lib/forms.ts) rather than
 * to a backend this site owns. The honeypot and timing check below are
 * client-side conveniences that cut obvious bot traffic on top of Web3Forms'
 * own spam filtering — neither is a substitute for the other.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [renderedAt] = useState(() => Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    if (form.get('website')) return; // honeypot tripped — silently drop
    if (Date.now() - renderedAt < 1500) return; // submitted implausibly fast

    setStatus('sending');
    setError(null);

    try {
      const result = await submitForm('New contact form message', {
        name: form.get('name'),
        email: form.get('email'),
        company: form.get('company'),
        message: form.get('message'),
      });
      if (!result.ok) throw new Error(result.message ?? 'Request failed');
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
          className="motion-safe:animate-[riseIn_0.4s_ease-out] rounded border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Your name" name="name" required autoComplete="name" />
        <Input label="Work email" name="email" type="email" required autoComplete="email" />
      </div>

      <Input label="Company" name="company" autoComplete="organization" />

      <Textarea
        label="What are you working on?"
        name="message"
        required
        rows={6}
        placeholder="A couple of sentences is plenty to start."
      />

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
        className="inline-flex h-12 items-center justify-center gap-2.5 rounded bg-ctpl-gradient px-8 text-sm font-semibold text-white shadow-cta transition-[filter,transform] duration-ui ease-ctpl-out hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
      >
        {status === 'sending' && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 motion-safe:animate-spin"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        )}
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
