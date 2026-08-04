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
 * LMS shell with persistent sidebar navigation (desktop sticky + mobile chip row).
 * Main column holds neat page-sized content; scroll within main for next “pages”.
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
  hideJourneyRail?: boolean;
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

  return (
    <div className="learn-surface min-h-[100svh] min-h-[100dvh] bg-[#f7f7f8]">
      {hero}

      <div className="container-site grid min-w-0 gap-4 pb-8 pt-3 sm:gap-5 sm:pb-10 sm:pt-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:pt-5 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
        {/* ── Sidebar navigation (always on) ── */}
        <aside className="min-w-0 lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:self-start lg:max-h-[calc(100svh-5.5rem)] lg:overflow-y-auto">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-3.5">
            <p className="mb-2 hidden text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted lg:block">
              Navigate
            </p>

            <nav
              className="-mx-0.5 flex gap-0.5 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label="Learn navigation"
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
                          <span
                            className={`ml-auto hidden text-[0.65rem] font-normal lg:inline ${
                              active ? "text-white/55" : "text-muted"
                            }`}
                          >
                            {item.hint}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setLearnOpen((v) => !v)}
                          className={`flex shrink-0 items-center justify-center rounded-xl px-2 text-[0.7rem] font-semibold transition ${
                            active
                              ? "bg-ink text-white hover:bg-ink-soft"
                              : "text-muted hover:bg-black/[0.04] hover:text-ink"
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
                    <span
                      className={`ml-auto hidden text-[0.65rem] font-normal lg:inline ${
                        active ? "text-white/55" : "text-muted"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {learnOpen && (
              <div className="mt-2 rounded-xl border border-black/[0.07] bg-[#fafafa] p-2.5 lg:hidden">
                <LearnCourseNav
                  expanded
                  onToggle={() => setLearnOpen(false)}
                />
              </div>
            )}

            {/* Pathway progress */}
            {journey && (
              <div className="mt-3 border-t border-black/[0.06] pt-3">
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
                    className="h-full rounded-full bg-ink transition-all"
                    style={{ width: `${Math.max(journey.pct, 4)}%` }}
                  />
                </div>
                <p className="mt-2 truncate text-[0.75rem] font-medium text-ink">
                  {journey.current.short}
                  <span className="font-normal text-muted">
                    {" "}
                    · step {journey.current.n}
                  </span>
                </p>
                <Link
                  href={journey.current.href}
                  className="mt-1.5 inline-flex text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Continue pathway →
                </Link>
              </div>
            )}

            {/* More tools */}
            <div className="mt-3 border-t border-black/[0.06] pt-2">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left text-[0.75rem] font-semibold text-muted hover:text-ink"
                aria-expanded={moreOpen}
              >
                More tools
                <span aria-hidden>{moreOpen ? "−" : "+"}</span>
              </button>
              {moreOpen && (
                <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto">
                  {LEARN_SECONDARY_LINKS.map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block rounded-lg px-2 py-1.5 text-[0.75rem] font-medium transition ${
                            active
                              ? "bg-black/[0.04] font-semibold text-ink"
                              : "text-muted hover:text-ink"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="min-w-0">
          {(title || subtitle) && (
            <header className="mb-4 sm:mb-5">
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
