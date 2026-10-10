"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
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
import { stepLabel } from "@/lib/lms/journey";

/** Focused flows: the lesson or questionnaire comes first on mobile (no pathway strip). */
function isFocusPath(pathname: string): boolean {
  return (
    /^\/learn\/courses\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/learn\/assessment\/(pre|post|mid|orientation)(\/|$)/.test(pathname)
  );
}

const SECTION_HEADER =
  "mb-1 mt-3 hidden px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted first:mt-0 lg:block";

/**
 * LMS shell — dual-process sidebar (Learning vs Journaling).
 * Desktop: sectioned vertical nav. Mobile: the bottom tab bar is the only
 * navigation; above the content sits one slim "Step N of 6" line (hidden in
 * sessions and assessments so the lesson starts above the fold).
 */
export function LearnShell({
  children,
  title,
  subtitle,
  hero,
  hideJourneyRail = false,
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
  const uid = useId();
  const focus = isFocusPath(pathname);
  // Today already shows the pathway (next-action card + rail); welcome has its own single bar.
  const showPathway = Boolean(journey) && !hideJourneyRail && pathname !== "/learn";

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
      {/* Second skip link: past the Learn sidebar straight to this page's content. */}
      <a href="#learn-content" className="skip-link">
        Skip to page content
      </a>
      {hero}

      <div className="container-site grid min-w-0 gap-4 pb-8 pt-3 sm:gap-5 sm:pb-10 sm:pt-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:pt-5 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
        {/* ── Sidebar navigation (desktop) / slim pathway line (mobile) ── */}
        <aside
          className={`min-w-0 lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:self-start lg:max-h-[calc(100svh-5.5rem)] lg:overflow-y-auto ${
            focus ? "hidden lg:block" : ""
          }`}
        >
          {/* Mobile: the bottom tab bar is the navigation; this is just "where am I" + next step */}
          {showPathway && (
            <div className="lg:hidden" data-testid="mobile-pathway">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-elevated px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.75rem] font-semibold text-ink">
                    {stepLabel(journey.current.n)}
                    <span className="font-medium text-slate"> · {journey.current.short}</span>
                  </p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.08]" aria-hidden>
                    <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(journey.pct, 4)}%` }} />
                  </div>
                </div>
                {/* Today already has the one next-action card; don't compete with it */}
                {(
                  <Link
                    href={journey.current.href}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-void px-3.5 text-[0.75rem] font-semibold text-void-fg"
                  >
                    Continue
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink"
                  aria-expanded={moreOpen}
                  aria-controls={`${uid}-more`}
                  aria-label="More tools"
                >
                  <span aria-hidden className="text-base leading-none">⋯</span>
                </button>
              </div>
              {moreOpen && (
                <div id={`${uid}-more`} className="mt-2 rounded-2xl border border-line bg-elevated p-3">
                  <MoreTools groups={secondaryByGroup} pathname={pathname} />
                </div>
              )}
            </div>
          )}

          <div className="hidden rounded-2xl border border-line bg-elevated p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:block">
            <p className="mb-2 text-[0.7rem] font-semibold tracking-tight text-ink">
              Super-Cube® Learn
            </p>

            <nav className="flex flex-col gap-0.5" aria-label="Learn navigation">
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

              {showPathway && (
                <div className="mt-2 rounded-xl border border-line bg-surface/80 p-2.5" data-testid="sidebar-pathway">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate">
                    Your pathway
                  </p>
                  <p className="mt-1 text-[0.75rem] font-semibold text-ink">
                    {stepLabel(journey.current.n)}
                    <span className="font-medium text-slate"> · {journey.current.short}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]" aria-hidden>
                    <div
                      className="h-full rounded-full bg-ink transition-all"
                      style={{ width: `${Math.max(journey.pct, 4)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[0.7rem] text-slate">
                    {journey.doneCount} of {journey.total} steps done
                  </p>
                  {(
                    <Link
                      href={journey.current.href}
                      className="mt-1 inline-flex text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      Continue pathway →
                    </Link>
                  )}
                </div>
              )}

              {/* JOURNALING */}
              <p className={SECTION_HEADER}>Journaling</p>
              <Link
                href={journal.href}
                className={navClass(pathname.startsWith("/learn/pulse"))}
                aria-current={pathname.startsWith("/learn/pulse") ? "page" : undefined}
              >
                <span className="truncate">{journal.label}</span>
                <span
                  className={`ml-auto text-[0.65rem] font-normal ${
                    pathname.startsWith("/learn/pulse") ? "text-white/55" : "text-muted"
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
                  className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left text-[0.75rem] font-semibold text-slate hover:text-ink"
                  aria-expanded={moreOpen}
                >
                  More tools
                  <span aria-hidden>{moreOpen ? "−" : "+"}</span>
                </button>
                {moreOpen && (
                  <div className="mt-1 max-h-52 overflow-y-auto">
                    <MoreTools groups={secondaryByGroup} pathname={pathname} />
                  </div>
                )}
              </div>
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div id="learn-content" tabIndex={-1} className="min-w-0 outline-none">
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

function MoreTools({
  groups,
  pathname,
}: {
  groups: { group: SecondaryGroup; label: string; links: typeof LEARN_SECONDARY_LINKS }[];
  pathname: string;
}) {
  return (
    <div className="space-y-2">
      {groups.map(({ group, label, links }) => (
        <div key={group}>
          <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-wider text-slate">{label}</p>
          <ul className="mt-0.5 space-y-0.5">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-2 py-2 text-[0.8125rem] font-medium transition lg:py-1.5 lg:text-[0.75rem] ${
                      active ? "bg-black/[0.04] font-semibold text-ink" : "text-slate hover:text-ink"
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
