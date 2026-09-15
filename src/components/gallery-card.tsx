import Link from 'next/link';
import type { Project } from '@/app/work/content';
import { CardReveal, ImageReveal, MediaFrame, Reveal } from './motion-primitives';

/**
 * Project card for the /work gallery. Markup lifted out of work/page.tsx
 * unchanged (same ImageReveal/MediaFrame combination, same hover treatment)
 * so pulling it into a shared component is a pure refactor, not a redesign.
 */
export function GalleryCard({
  project,
  index,
  className,
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  return (
    <CardReveal delay={(index % 2) * 90} className={className}>
      <Link
        href={`/work/${project.slug}/`}
        className="group flex h-full flex-col transition-transform duration-ui ease-ctpl-out motion-safe:hover:scale-[1.015]"
      >
        <ImageReveal className="relative aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-surface shadow-card transition-[box-shadow,border-color] duration-ui group-hover:border-card-hover-edge group-hover:shadow-raised">
          <MediaFrame
            src={project.image}
            alt={project.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
            // The first row is on screen at load (and is the page's largest
            // paint on mobile), so it must not wait for lazy-loading.
            priority={index < 2}
            className="absolute inset-0 transition-transform duration-[900ms] ease-ctpl-out group-hover:scale-[1.06]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-ui group-hover:opacity-100"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur transition-transform duration-ui ease-ctpl-out group-hover:-translate-y-0.5">
            {project.discipline}
          </span>
        </ImageReveal>
        <div className="pt-5">
          <Reveal>
            <h2 className="inline bg-[linear-gradient(currentColor,currentColor)] bg-left-bottom bg-[length:0%_1px] bg-no-repeat pb-0.5 font-display text-xl font-semibold leading-snug text-ink transition-[background-size] duration-ui ease-ctpl-out group-hover:bg-[length:100%_1px]">
              {project.title}
            </h2>
          </Reveal>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{project.outcome}</p>
        </div>
      </Link>
    </CardReveal>
  );
}
