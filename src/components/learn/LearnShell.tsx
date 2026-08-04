"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LearnCourseNav } from "@/components/learn/LearnCourseNav";
import { useJourney } from "@/components/learn/JourneyProgress";
import {
  isLearnNavActive,
  LEARN_PRIMARY_NAV,
  LEARN_SECONDARY_LINKS,
} from "@/lib/lms/nav";

/**
 * LMS shell — single-column page-by-page for most routes.
 * Courses keep a desktop side tree for session navigation.
 */
export function LearnShell({
  children,
  title,
  subtitle,
  hero,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hero?: ReactNode;
  /** @deprecated unused — journey lives on Today page tiles */
  hideJourneyRail?: boolean;
  /** @deprecated single-column is default */
  wide?: boolean;
}) {
  const pathname = usePathname();
  const journey = useJourney();
  const onCourses = pathname.startsWith("/learn/courses");
  const [learnOpen, setLearnOpen] = useState(onCourses);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (onCourses) setLearnOpen(true);
  }, [onCourses]);

  if (!onCourses) {
    return (
      <div className="learn-surface min-h-[100svh] min-h-[100dvh] bg-[#f7f7f8]">
        {hero}
        <div className="container-site mx-auto min-w-0 px-4 pb-8 pt-4 sm:px-5 sm:pb-10 sm:pt-5">
          {(title || subtitle) && (
            <header className="mx-auto mb-5 max-w-lg sm:mb-6 sm:max-w-xl">
              {title && (
                <h1 className="text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="learn-surface min-h-[100svh] min-h-[100dvh] bg-[#f7f7f8]">
      {hero}
      <div className="container-site grid min-w-0 gap-5 pb-8 pt-4 sm:gap-6 sm:pb-10 sm:pt-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:self-start">
          <p className="mb-2 hidden text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted lg:block">
            Learn
          </p>
          <nav
            className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1.5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Learn primary"
          >
            {LEARN_PRIMARY_NAV.map((item) => {
              const active = isLearnNavActive(pathname, item);
              const isLearn = item.id === "learn";
              const cls = `flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.8125rem] font-medium tracking-tight transition lg:w-full ${
                active
                  ? "bg-ink text-white"
                  : "text-slate hover:bg-black/[0.04] hover:text-ink"
              }`;

              if (isLearn) {
                return (
                  <div key={item.id} className="contents lg:block lg:w-full">
                    <div className="flex shrink-0 items-stretch gap-0.5 lg:w-full">
                      <Link
                        href={item.href}
                        className={`${cls} min-w-0 flex-1`}
                        onClick={() => setLearnOpen(true)}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="truncate">{item.label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setLearnOpen((v) => !v)}
                        className={`flex shrink-0 items-center justify-center rounded-xl px-2.5 text-[0.7rem] font-semibold transition ${
                          active
                            ? "bg-ink text-white"
                            : "text-muted hover:bg-black/[0.04]"
                        }`}
                        aria-expanded={learnOpen}
                        aria-label={
                          learnOpen ? "Collapse courses" : "Expand courses"
                        }
                      >
                        <span
                          className={`inline-block transition-transform ${
                            learnOpen ? "rotate-90" : ""
                          }`}
                          aria-hidden
                        >
                          ▸
                        </span>
                      </button>
                    </div>
                    <div className="hidden lg:block">
                      <LearnCourseNav expanded={learnOpen} nested />
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cls}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {learnOpen && (
            <div className="mt-2 rounded-xl border border-black/[0.07] bg-white p-2.5 lg:hidden">
              <LearnCourseNav expanded onToggle={() => setLearnOpen(false)} />
            </div>
          )}

          {journey && (
            <div className="mt-4 hidden rounded-xl border border-black/[0.07] bg-white p-3 lg:block">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  Pathway
                </p>
                <p className="text-[0.7rem] font-semibold tabular-nums text-ink">
                  {journey.doneCount}/{journey.total}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${Math.max(journey.pct, 4)}%` }}
                />
              </div>
              <Link
                href="/learn"
                className="mt-2 inline-flex text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Back to Today →
              </Link>
            </div>
          )}

          <div className="mt-3 hidden border-t border-black/[0.06] pt-3 lg:block">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[0.75rem] font-semibold text-muted hover:text-ink"
              aria-expanded={moreOpen}
            >
              More tools
              <span aria-hidden>{moreOpen ? "−" : "+"}</span>
            </button>
            {moreOpen && (
              <ul className="mt-1 space-y-0.5">
                {LEARN_SECONDARY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium text-muted hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {(title || subtitle) && (
            <header className="mb-5 sm:mb-6">
              {title && (
                <h1 className="text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-slate">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
