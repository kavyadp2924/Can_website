'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { GradientText } from './ui';
import { NAV_ITEMS, PORTAL_URL, type NavItem } from '@/lib/nav';

/**
 * Site header with dropdown navigation.
 *
 * Accessibility notes, because dropdown menus are usually where marketing sites
 * quietly become unusable by keyboard:
 *
 *  • The trigger is a real <button> with aria-expanded and aria-controls, so a
 *    screen reader announces the state rather than reading a mystery link.
 *  • Hover opens it for mouse users, but focus and Enter/Space do too — the menu
 *    is never hover-only.
 *  • Escape closes and returns focus to the trigger.
 *  • A click anywhere outside closes it.
 *  • Opening is delayed slightly on hover-out so the pointer can travel from the
 *    trigger to the panel without the menu vanishing mid-journey.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close menus on navigation — otherwise the dropdown stays open over the new page.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // The header gains a border and stronger blur once the page scrolls, so it
  // stays legible over the hero's 3D scene. It also hides on scroll-down and
  // reveals on scroll-up — a premium, unobtrusive pattern for long pages.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y > last && y > 140) setHidden(true);
      else setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent the page scrolling behind the open mobile drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    item.children?.some((c) => pathname === c.href.split('#')[0]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[transform,border-color,background-color,box-shadow] duration-300',
        hidden ? '-translate-y-[120%]' : 'translate-y-0',
        scrolled
          ? 'border-b border-hairline bg-white/90 backdrop-blur-md shadow-card'
          : 'border-b border-transparent bg-white/60 backdrop-blur-sm',
      )}
    >
      <nav
        ref={navRef}
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6"
      >
        <Link
          href="/"
          className="shrink-0 font-display text-2xl font-bold tracking-wide text-ink"
          aria-label="Canorous home"
        >
          CTP<GradientText>L</GradientText>
        </Link>

        {/* ─────────────────────────────────────────── desktop ── */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);

            // Canorous Edge and anything else without children is a plain link.
            if (!item.children) {
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded px-3.5 py-2 text-sm font-medium transition-colors',
                      active ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                    )}
                  >
                    {item.name}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ctpl-gradient"
                      />
                    )}
                  </Link>
                </li>
              );
            }

            const open = openMenu === item.name;
            const panelId = `menu-${item.name.replace(/\s+/g, '-').toLowerCase()}`;

            return (
              <li
                key={item.name}
                className="relative"
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(item.name);
                }}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : item.name)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded px-3.5 py-2 text-sm font-medium transition-colors',
                    active || open ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                  )}
                >
                  {item.name}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      open && 'rotate-180',
                    )}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ctpl-gradient"
                    />
                  )}
                </button>

                <div
                  id={panelId}
                  hidden={!open}
                  className={cn(
                    'absolute left-0 top-full w-[22rem] pt-3',
                    'motion-safe:animate-[fadeIn_140ms_ease-out]',
                  )}
                >
                  <div className="overflow-hidden rounded-xl border border-hairline bg-white p-2 shadow-raised">
                    <span aria-hidden="true" className="block h-0.5 bg-ctpl-gradient" />
                    <ul className="pt-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="group block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                          >
                            <span className="underline-grow block text-sm font-semibold text-ink group-hover:text-link">
                              {child.name}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={PORTAL_URL}
            className="hidden rounded border border-border-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface sm:inline-flex"
          >
            Employee login
          </a>
          <Link
            href="/contact"
            className="hidden h-10 items-center rounded bg-ctpl-gradient px-5 text-sm font-semibold text-white shadow-cta transition-[filter] hover:brightness-110 lg:inline-flex"
          >
            Talk to us
          </Link>

          {/* ───────────────────────────────────── mobile toggle ── */}
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded p-2 text-ink lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ───────────────────────────────────────────── mobile ── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-hairline bg-white px-4 pb-8 pt-2 lg:hidden"
        >
          <ul className="divide-y divide-hairline">
            {NAV_ITEMS.map((item) => (
              <li key={item.name} className="py-1">
                {item.children ? (
                  // <details> gives an accessible accordion with no JS state to
                  // manage and correct keyboard behaviour for free.
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-base font-semibold text-ink">
                      {item.name}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="h-4 w-4 transition-transform group-open:rotate-180"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <ul className="pb-2 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block py-2.5 text-sm text-ink-secondary hover:text-link"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-semibold text-ink hover:text-link"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/contact"
              className="flex h-12 items-center justify-center rounded bg-ctpl-gradient text-sm font-semibold text-white shadow-cta"
            >
              Talk to us
            </Link>
            <a
              href={PORTAL_URL}
              className="flex h-12 items-center justify-center rounded border border-border-strong text-sm font-semibold text-ink"
            >
              Employee login
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
