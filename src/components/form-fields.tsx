'use client';

import { cn } from '@/lib/cn';

/**
 * Shared form primitives — used by the contact form and the quote tool so
 * both look and behave identically. Styling matches the field markup that
 * used to live only in contact-form.tsx (same tokens: border-border-strong,
 * focus-visible:ring-brand-blue, duration-ui/ease-ctpl-out).
 */
const fieldClass =
  'w-full rounded border border-border-strong bg-white px-3 text-sm text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-ui ease-ctpl-out focus-visible:outline-none focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1';

function FieldLabel({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <label htmlFor={name} className="block text-sm font-medium text-ink-secondary">
      {label}
      {!required && <span className="ml-1 text-ink-subtle">(optional)</span>}
    </label>
  );
}

export function Input({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  placeholder,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <FieldLabel label={label} name={name} required={required} />
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(fieldClass, 'h-11')}
      />
    </div>
  );
}

export function Textarea({
  label,
  name,
  required,
  rows = 6,
  placeholder,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <FieldLabel label={label} name={name} required={required} />
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(fieldClass, 'py-2.5')}
      />
    </div>
  );
}

export function Select({
  label,
  name,
  required,
  options,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <FieldLabel label={label} name={name} required={required} />
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className={cn(fieldClass, 'h-11 appearance-none bg-[url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23767676" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>\')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9')}
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Card-style radio group — for choices with more than a couple of words each
 *  (e.g. "service type"), where a plain `<select>` would bury the options. */
export function RadioGroup({
  label,
  name,
  required,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string; desc?: string }>;
  defaultValue?: string;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-medium text-ink-secondary">
        {label}
        {!required && <span className="ml-1 text-ink-subtle">(optional)</span>}
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="group relative flex cursor-pointer flex-col rounded border border-border-strong bg-white p-3.5 transition-[border-color,box-shadow] duration-ui ease-ctpl-out has-[:checked]:border-brand-blue has-[:checked]:ring-2 has-[:checked]:ring-brand-blue has-[:checked]:ring-offset-1"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              required={required}
              defaultChecked={defaultValue === opt.value}
              className="absolute right-3.5 top-3.5 h-4 w-4 accent-brand-blue"
            />
            <span className="pr-6 text-sm font-semibold text-ink">{opt.label}</span>
            {opt.desc && <span className="mt-1 text-xs leading-relaxed text-ink-muted">{opt.desc}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Numbered step indicator for the quote tool — same visual language as
 *  ProcessRail (numbered stages, a line joining them) but driven by explicit
 *  step state rather than ScrollTrigger. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Form progress">
      {steps.map((step, index) => {
        const isActive = index === current;
        const isDone = index < current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors duration-ui',
                  isDone && 'bg-ctpl-gradient text-white',
                  isActive && !isDone && 'border-2 border-brand-blue text-brand-blue',
                  !isActive && !isDone && 'border border-border-strong text-ink-subtle',
                )}
              >
                {isDone ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4.5 4.5L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  isActive ? 'text-ink' : 'text-ink-subtle',
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className={cn('h-px flex-1', isDone ? 'bg-brand-blue' : 'bg-hairline')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
