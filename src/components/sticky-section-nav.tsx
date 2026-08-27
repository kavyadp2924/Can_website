'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export function StickySectionNav({
  items,
}: {
  items: Array<{ id: string; label: string }>;
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 z-20 -mx-4 mb-10 border-y border-hairline bg-white/90 px-4 py-3 backdrop-blur-md lg:top-24"
    >
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                'relative block rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-ui',
                active === item.id ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
              {active === item.id && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-0.5 h-px bg-ctpl-gradient"
                />
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
