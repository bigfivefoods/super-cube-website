"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LearnCourseNav } from "@/components/learn/LearnCourseNav";
import {
  JourneyRailLive,
  useJourney,
} from "@/components/learn/JourneyProgress";
import type { JourneyStepId } from "@/lib/lms/journey";

const FALLBACK_STEPS: {
  id: JourneyStepId;
  n: number;
  short: string;
  href: string;
}[] = [
  { id: "programme", n: 1, short: "Choose", href: "/learn/programmes" },
  { id: "orient", n: 2, short: "Orient", href: "/learn/assessment/orientation" },
  { id: "baseline", n: 3, short: "Baseline", href: "/learn/assessment/pre" },
  { id: "learn", n: 4, short: "Learn", href: "/learn/courses" },
  { id: "remeasure", n: 5, short: "Re-measure", href: "/learn/assessment/post" },
  { id: "report", n: 6, short: "Report", href: "/learn/report" },
];

const utilityLinks = [
  { href: "/learn", label: "Home", exact: true },
  { href: "/learn/account", label: "Account" },
];

function pathMatchesStep(pathname: string, id: JourneyStepId): boolean {
  if (pathname.startsWith("/learn/programmes") && id === "programme") return true;
  if (
    pathname.startsWith("/learn/assessment/orientation") &&
    id === "orient"
  )
    return true;
  if (pathname.startsWith("/learn/assessment/pre") && id === "baseline")
    return true;
  if (pathname.startsWith("/learn/assessment/post") && id === "remeasure")
    return true;
  if (pathname.startsWith("/learn/courses") && id === "learn") return true;
  if (pathname.startsWith("/learn/report") && id === "report") return true;
  return false;
}

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
  /** Hide compact journey rail (dashboard uses full timeline) */
  hideJourneyRail?: boolean;
}) {
  const pathname = usePathname();
  const journey = useJourney();
  const steps = journey?.steps ?? FALLBACK_STEPS.map((s) => ({
    ...s,
    title: s.short,
    description: "",
    promise: "",
    status: "upcoming" as const,
    detail: "",
    cta: "Continue",
  }));

  const onCourses = pathname.startsWith("/learn/courses");
  const [learnOpen, setLearnOpen] = useState(onCourses);

  useEffect(() => {
    if (onCourses) setLearnOpen(true);
  }, [onCourses]);

  return (
    <div className="learn-surface min-h-[100svh] min-h-[100dvh] bg-[#fafafa]">
      {hero}

      <div
        className={`container-site grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10 ${
          hero
            ? "pb-8 pt-5 sm:pb-10 sm:pt-6 lg:pb-12 lg:pt-8"
            : "pb-8 pt-20 sm:pb-10 sm:pt-24 lg:pb-12 lg:pt-24"
        }`}
      >
        <aside
          className={`min-w-0 lg:sticky lg:self-start ${
            hero ? "lg:top-6" : "lg:top-20"
          }`}
        >
          <p className="learn-eyebrow mb-2 hidden lg:mb-2.5 lg:block">
            Your journey
          </p>

          <nav
            className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1.5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Learning pathway steps"
          >
            {steps.map((step) => {
              const pathStep = pathMatchesStep(pathname, step.id);
              const locked = "status" in step && step.status === "locked";
              const current = "status" in step && step.status === "current";
              const done = "status" in step && step.status === "done";
              const isLearn = step.id === "learn";

              const cls = `flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.8125rem] font-medium tracking-tight transition lg:w-full ${
                locked
                  ? "cursor-not-allowed text-muted opacity-50"
                  : pathStep || current
                    ? "bg-ink text-white"
                    : done
                      ? "text-ink hover:bg-black/[0.04]"
                      : "text-slate hover:bg-black/[0.04] hover:text-ink"
              }`;

              const stepInner = (
                <>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${
                      pathStep || current
                        ? "bg-white/20 text-white"
                        : done
                          ? "bg-ink text-white"
                          : "border border-black/[0.12] text-muted"
                    }`}
                  >
                    {done && !pathStep && !current ? "✓" : step.n}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{step.short}</span>
                </>
              );

              if (locked) {
                return (
                  <span
                    key={step.id}
                    className={cls}
                    title="Complete previous steps first"
                  >
                    {stepInner}
                  </span>
                );
              }

              if (isLearn) {
                return (
                  <div key={step.id} className="contents lg:block lg:w-full">
                    <div className="flex shrink-0 items-stretch gap-0.5 lg:w-full">
                      <Link
                        href={step.href}
                        className={`${cls} min-w-0 flex-1`}
                        onClick={() => setLearnOpen(true)}
                      >
                        {stepInner}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setLearnOpen((v) => !v)}
                        className={`flex shrink-0 items-center justify-center rounded-xl px-2.5 text-[0.7rem] font-semibold transition ${
                          pathStep || current
                            ? "bg-ink text-white hover:bg-ink-soft"
                            : "text-muted hover:bg-black/[0.04] hover:text-ink"
                        }`}
                        aria-expanded={learnOpen}
                        aria-label={
                          learnOpen
                            ? "Collapse courses and sessions"
                            : "Expand courses and sessions"
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
                    {/* Desktop: nested under Learn step */}
                    <div className="hidden lg:block">
                      <LearnCourseNav expanded={learnOpen} nested />
                    </div>
                  </div>
                );
              }

              return (
                <Link key={step.id} href={step.href} className={cls}>
                  {stepInner}
                </Link>
              );
            })}
          </nav>

          {/* Mobile / tablet: full-width expandable course panel under journey pills */}
          {learnOpen && (
            <div className="mt-2 rounded-xl border border-black/[0.07] bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:hidden">
              <LearnCourseNav
                expanded
                onToggle={() => setLearnOpen(false)}
              />
            </div>
          )}

          <div className="mt-4 hidden border-t border-black/[0.06] pt-3 lg:block">
            {utilityLinks.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium transition ${
                    active
                      ? "font-semibold text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/pricing"
              className="mt-1 block rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium text-muted transition hover:text-ink"
            >
              Plans & pricing
            </Link>
          </div>

          {journey && (
            <p className="mt-3 hidden text-[0.7rem] text-muted lg:block">
              {journey.doneCount} of {journey.total} steps complete
            </p>
          )}
        </aside>

        <div className="min-w-0">
          {!hideJourneyRail && !hero && <JourneyRailLive />}

          {(title || subtitle) && (
            <header className="mb-5 sm:mb-6">
              {title && <h1 className="learn-title">{title}</h1>}
              {subtitle && <p className="learn-subtitle">{subtitle}</p>}
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
