import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CtaBand, Eyebrow, Section } from '@/components/ui';
import { ImageReveal, MediaFrame, Reveal } from '@/components/motion-primitives';
import { ModelViewer } from '@/components/model-viewer';
import { PROJECTS, getProjectBySlug } from '../content';

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

function Workflow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span className="rounded-full border border-hairline bg-white px-3 py-1.5 text-ink">{step}</span>
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="text-ink-subtle">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-surface-subtle">
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <Link
            href="/work/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-link"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            All work
          </Link>
          <Eyebrow className="mt-6">{project.discipline}</Eyebrow>
          <h1 className="mt-4 font-display text-display leading-[1.12] text-ink sm:text-display-lg">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-secondary">{project.summary}</p>
        </div>
      </section>

      <Section>
        {project.modelUrl ? (
          <ModelViewer
            url={project.modelUrl}
            poster={project.image}
            label={project.title}
            className="relative aspect-[16/9] overflow-hidden rounded-xl border border-hairline bg-surface shadow-card"
          />
        ) : (
          <ImageReveal className="relative aspect-[16/9] overflow-hidden rounded-xl border border-hairline bg-surface shadow-card">
            <MediaFrame src={project.image} alt={project.title} sizes="100vw" className="absolute inset-0" priority />
          </ImageReveal>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <Reveal>
              <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">Workflow</p>
            </Reveal>
            <div className="mt-3">
              <Workflow steps={project.workflow} />
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-6">
            <p className="text-eyebrow uppercase tracking-eyebrow text-ink-muted">Project scope</p>
            <ul className="mt-3 space-y-2">
              {project.scope.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-red" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Recognise your problem in this one?"
        body="Tell us the version you are dealing with and we will say how we would approach it."
        action="Get a quote"
        href="/quote/"
      />
    </>
  );
}
