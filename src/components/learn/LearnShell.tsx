"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LearnCourseNav } from "@/components/learn/LearnCourseNav";
import { useJourney } from "@/components/learn/JourneyProgress";
import {
  getNavItem,
  isLearnNavActive,
  LEARN_JOURNAL_PRACTICE,
  LEARN_SECONDARY_LINKS,
  SECONDARY_GROUP_LABELS,
  type LearnNavItem,
  type SecondaryGroup,
} from "@/lib/lms/nav";

const SECTION_HEADER =
  "mb-1 mt-3 hidden px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted first:mt-0 lg:block";

/**
 * LMS shell — dual-process sidebar (Learning vs Journaling).
 * Desktop: sectioned vertical nav. Mobile chips: primary destinations only.
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

  const today = getNavItem("today");
  const learn = getNavItem("learn");
  const journal = getNavItem("journal");
  const progress = getNavItem("progress");
  const you = getNavItem("you");

  const practiceActive =
    pathname === LEARN_JOURNAL_PRACTICE.href ||
    pathname.startsWith(`${LEARN_JOURNAL_PRACTICE.href}/`);

  const secondaryByGroup = (
    ["learning", "journaling", "account"] as SecondaryGroup[]
  ).map((group) => ({
    group,
    label: SECONDARY_GROUP_LABELS[group],
    links: LEARN_SECONDARY_LINKS.filter((l) => l.group === group),
  }));

  return (
    <div className="learn-surface min-h-[100svh] min-h-[100dvh] bg-surface">
      {hero}

      <div className="container-site grid min-w-0 gap-4 pb-8 pt-3 sm:gap-5 sm:pb-10 sm:pt-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:pt-5 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
        {/* ── Sidebar navigation ── */}
        <aside className="min-w-0 lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:self-start lg:max-h-[calc(100svh-5.5rem)] lg:overflow-y-auto">
          <div className="rounded-2xl border border-line bg-elevated p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-3.5">
            <p className="mb-2 hidden text-[0.7rem] font-semibold tracking-tight text-ink lg:block">
              Super-Cube Learn
            </p>

            {/* Mobile: flat primary chips */}
            <nav
              className="-mx-0.5 flex gap-0.5 overflow-x-auto px-0.5 pb-0.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
              aria-label="Learn navigation"
            >
              {[today, learn, journal, progress, you].map((item) => (
                <MobileChip key={item.id} item={item} pathname={pathname} />
              ))}
            </nav>

            {/* Desktop: dual-process sections */}
            <nav
              className="hidden lg:flex lg:flex-col lg:gap-0.5"
              aria-label="Learn navigation"
            >
              {/* TODAY */}
              <p className={SECTION_HEADER}>Today</p>
              <NavLink item={today} pathname={pathname} />

              {/* LEARNING */}
              <p className={SECTION_HEADER}>Learning</p>
              <LearnExpandable
                item={learn}
                pathname={pathname}
                open={learnOpen}
                setOpen={setLearnOpen}
              />
              <NavLink item={progress} pathname={pathname} />

              {journey && (
                <div className="mt-2 rounded-xl border border-line bg-surface/80 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Pathway
                    </p>
                    <p className="text-[0.7rem] font-semibold tabular-nums text-ink">
                      {journey.doneCount}/{journey.total}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                      className="h-full rounded-full bg-ink transition-all"
                      style={{ width: `${Math.max(journey.pct, 4)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 truncate text-[0.75rem] font-medium text-ink">
                    {journey.current.short}
                    <span className="font-normal text-muted">
                      {" "}
                      · step {journey.current.n}
                    </span>
                  </p>
                  <Link
                    href={journey.current.href}
                    className="mt-1 inline-flex text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    Continue pathway →
                  </Link>
                </div>
              )}

              {/* JOURNALING */}
              <p className={SECTION_HEADER}>Journaling</p>
              <Link
                href={journal.href}
                className={navClass(
                  pathname.startsWith("/learn/pulse")
                )}
                aria-current={
                  pathname.startsWith("/learn/pulse") ? "page" : undefined
                }
              >
                <span className="truncate">{journal.label}</span>
                <span
                  className={`ml-auto text-[0.65rem] font-normal ${
                    pathname.startsWith("/learn/pulse")
                      ? "text-white/55"
                      : "text-muted"
                  }`}
                >
                  {journal.hint}
                </span>
              </Link>
              <Link
                href={LEARN_JOURNAL_PRACTICE.href}
                className={navClass(practiceActive)}
                aria-current={practiceActive ? "page" : undefined}
              >
                <span className="truncate">{LEARN_JOURNAL_PRACTICE.label}</span>
                <span
                  className={`ml-auto text-[0.65rem] font-normal ${
                    practiceActive ? "text-white/55" : "text-muted"
                  }`}
                >
                  {LEARN_JOURNAL_PRACTICE.hint}
                </span>
              </Link>

              {/* YOU */}
              <p className={SECTION_HEADER}>You</p>
              <NavLink item={you} pathname={pathname} />

              <div className="mt-2 border-t border-line pt-2">
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
                  <div className="mt-1 max-h-52 space-y-2 overflow-y-auto">
                    {secondaryByGroup.map(({ group, label, links }) => (
                      <div key={group}>
                        <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
                          {label}
                        </p>
                        <ul className="mt-0.5 space-y-0.5">
                          {links.map((link) => {
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile: course expand + pathway + more */}
            {learnOpen && (
              <div className="mt-2 rounded-xl border border-line bg-surface p-2.5 lg:hidden">
                <LearnCourseNav expanded onToggle={() => setLearnOpen(false)} />
              </div>
            )}

            {journey && (
              <div className="mt-3 border-t border-line pt-3 lg:hidden">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
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

            <div className="mt-3 border-t border-line pt-2 lg:hidden">
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
                <div className="mt-1 max-h-40 space-y-2 overflow-y-auto">
                  {secondaryByGroup.map(({ group, label, links }) => (
                    <div key={group}>
                      <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
                        {label}
                      </p>
                      <ul className="mt-0.5 space-y-0.5">
                        {links.map((link) => {
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
                    </div>
                  ))}
                </div>
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

function navClass(active: boolean) {
  return `flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.8125rem] font-medium tracking-tight transition ${
    active
      ? "bg-void text-void-fg"
      : "text-slate hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-ink"
  }`;
}

function NavLink({
  item,
  pathname,
}: {
  item: LearnNavItem;
  pathname: string;
}) {
  const active = isLearnNavActive(pathname, item);
  return (
    <Link
      href={item.href}
      className={navClass(active)}
      aria-current={active ? "page" : undefined}
    >
      <span className="truncate">{item.label}</span>
      <span
        className={`ml-auto text-[0.65rem] font-normal ${
          active ? "text-white/55" : "text-muted"
        }`}
      >
        {item.hint}
      </span>
    </Link>
  );
}

function MobileChip({
  item,
  pathname,
}: {
  item: LearnNavItem;
  pathname: string;
}) {
  const active = isLearnNavActive(pathname, item);
  return (
    <Link
      href={item.href}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.8125rem] font-medium tracking-tight transition ${
        active
          ? "bg-void text-void-fg"
          : "text-slate hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-ink"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function LearnExpandable({
  item,
  pathname,
  open,
  setOpen,
}: {
  item: LearnNavItem;
  pathname: string;
  open: boolean;
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void;
}) {
  const active = isLearnNavActive(pathname, item);
  return (
    <div className="w-full">
      <div className="flex w-full items-stretch gap-0.5">
        <Link
          href={item.href}
          className={`${navClass(active)} min-w-0 flex-1`}
          onClick={() => setOpen(true)}
          aria-current={active ? "page" : undefined}
        >
          <span className="truncate">{item.label}</span>
          <span
            className={`ml-auto text-[0.65rem] font-normal ${
              active ? "text-white/55" : "text-muted"
            }`}
          >
            {item.hint}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex shrink-0 items-center justify-center rounded-xl px-2 text-[0.7rem] font-semibold transition ${
            active
              ? "bg-void text-void-fg hover:opacity-90"
              : "text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-ink"
          }`}
          aria-expanded={open}
          aria-label={open ? "Collapse courses" : "Expand courses"}
        >
          <span
            className={`inline-block transition-transform ${
              open ? "rotate-90" : ""
            }`}
            aria-hidden
          >
            ▸
          </span>
        </button>
      </div>
      <LearnCourseNav expanded={open} nested />
    </div>
  );
}
