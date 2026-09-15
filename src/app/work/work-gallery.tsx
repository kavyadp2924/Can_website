'use client';

import { useMemo, useState } from 'react';
import { DISCIPLINES, PROJECTS } from './content';
import { GalleryCard } from '@/components/gallery-card';
import { cn } from '@/lib/cn';

const ALL = 'All';

/**
 * Client-side filter over the static PROJECTS array — no backend involved,
 * this is a static export. Filtering by discipline rather than the finer
 * `tags` array keeps the chip row short; tags stay on the case study pages
 * for now.
 */
export function WorkGallery() {
  const [filter, setFilter] = useState<string>(ALL);

  const visible = useMemo(
    () => (filter === ALL ? PROJECTS : PROJECTS.filter((project) => project.discipline === filter)),
    [filter],
  );

  return (
    <div>
      <div role="group" aria-label="Filter by discipline" className="mb-8 flex flex-wrap gap-2">
        {[ALL, ...DISCIPLINES].map((option) => {
          const isActive = filter === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-ui ease-ctpl-out',
                isActive
                  ? 'border-transparent bg-ctpl-gradient text-white'
                  : 'border-border-strong bg-white text-ink-muted hover:text-ink',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {visible.map((project, index) => (
          <GalleryCard
            key={project.id}
            project={project}
            index={index}
            className={index % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-muted">No projects match that filter yet.</p>
      )}
    </div>
  );
}
