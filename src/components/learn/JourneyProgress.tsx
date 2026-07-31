"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getJourney,
  journeyStepFromPath,
  type JourneySnapshot,
  type JourneyStep,
  type JourneyStepStatus,
} from "@/lib/lms/journey";
import { loadLmsState } from "@/lib/lms/store";

function statusClasses(status: JourneyStepStatus, activeHere: boolean) {
  if (status === "done") {
    return activeHere
      ? "border-ink bg-ink text-white"
      : "border-ink/20 bg-ink text-white";
  }
  if (status === "current") {
    return "border-ink bg-white text-ink ring-2 ring-ink/15";
  }
  if (status === "locked") {
    return "border-black/[0.08] bg-[#f4f4f4] text-muted";
  }
  return activeHere
    ? "border-ink/30 bg-white text-ink"
    : "border-black/[0.1] bg-white text-muted";
}

function StepDot({
  step,
  activeHere,
  compact,
}: {
  step: JourneyStep;
  activeHere: boolean;
  compact?: boolean;
}) {
  const locked = step.status === "locked";
  const inner =
    step.status === "done" ? (
      <span aria-hidden>✓</span>
    ) : (
      <span>{step.n}</span>
    );

  const className = `flex shrink-0 items-center justify-center rounded-full border font-bold transition ${
    compact ? "h-6 w-6 text-[0.65rem]" : "h-8 w-8 text-[0.7rem]"
  } ${statusClasses(step.status, activeHere)}`;

  if (locked) {
    return (
      <span className={className} title={`${step.title} (locked)`}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={step.href}
      className={className}
      title={step.title}
      aria-current={activeHere || step.status === "current" ? "step" : undefined}
    >
      {inner}
    </Link>
  );
}

/** Compact rail shown on every LMS page — where am I? */
export function JourneyRail({ journey }: { journey: JourneySnapshot }) {
  const pathname = usePathname();
  const pathStep = journeyStepFromPath(pathname);

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="learn-eyebrow">Your pathway</p>
          <p className="mt-0.5 text-[0.8125rem] font-semibold tracking-tight text-ink">
            Step {journey.current.n} of {journey.total}
            <span className="font-medium text-slate">
              {" "}
              · {journey.current.short}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] font-semibold tabular-nums text-muted">
            {journey.doneCount}/{journey.total} done
          </span>
          <Link
            href={journey.current.href}
            className="learn-btn learn-btn-primary !min-h-8 !px-3 !py-1 !text-[0.75rem]"
          >
            {journey.current.cta} →
          </Link>
        </div>
      </div>

      {/* Progress track */}
      <div className="learn-progress mt-3 h-1">
        <div
          className="bg-ink transition-all duration-500"
          style={{ width: `${Math.max(journey.pct, journey.pct === 0 ? 4 : journey.pct)}%` }}
        />
      </div>

      {/* Step dots + connectors */}
      <ol className="mt-3 flex items-center justify-between gap-0.5">
        {journey.steps.map((step, i) => {
          const activeHere = pathStep === step.id;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <StepDot step={step} activeHere={activeHere} compact />
                <span
                  className={`hidden truncate text-center text-[0.6rem] font-semibold sm:block ${
                    step.status === "current" || activeHere
                      ? "text-ink"
                      : step.status === "done"
                        ? "text-ink/70"
                        : "text-muted"
                  }`}
                >
                  {step.short}
                </span>
              </div>
              {i < journey.steps.length - 1 && (
                <div
                  className={`mx-0.5 mb-0 h-px min-w-[0.35rem] flex-1 sm:mb-4 ${
                    journey.steps[i].status === "done"
                      ? "bg-ink/40"
                      : "bg-black/[0.08]"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Full vertical timeline for the dashboard */
export function JourneyTimeline({ journey }: { journey: JourneySnapshot }) {
  const pathname = usePathname();
  const pathStep = journeyStepFromPath(pathname);

  return (
    <ol className="relative space-y-0">
      {journey.steps.map((step, i) => {
        const locked = step.status === "locked";
        const current = step.status === "current";
        const done = step.status === "done";
        const activeHere = pathStep === step.id;
        const isLast = i === journey.steps.length - 1;

        const body = (
          <div
            className={`relative flex gap-3.5 rounded-2xl border p-4 transition sm:gap-4 sm:p-5 ${
              locked
                ? "cursor-not-allowed border-black/[0.05] bg-[#fafafa] opacity-55"
                : current
                  ? "border-ink bg-white shadow-[0_8px_28px_-16px_rgba(10,10,10,0.25)]"
                  : done
                    ? "border-black/[0.07] bg-white hover:border-black/15"
                    : "border-black/[0.07] bg-white hover:border-black/12 hover:bg-[#fafafa]"
            }`}
          >
            {/* Vertical connector */}
            {!isLast && (
              <span
                className={`absolute left-[1.9rem] top-[3.25rem] hidden h-[calc(100%-0.5rem)] w-px sm:left-[2.15rem] sm:block ${
                  done ? "bg-ink/25" : "bg-black/[0.08]"
                }`}
                aria-hidden
              />
            )}

            <div className="relative z-[1] shrink-0 pt-0.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-[0.75rem] font-bold sm:h-10 sm:w-10 ${statusClasses(
                  step.status,
                  activeHere
                )}`}
              >
                {done ? "✓" : step.n}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="learn-eyebrow">
                    Step {step.n}
                    {current && (
                      <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wider text-white">
                        YOU ARE HERE
                      </span>
                    )}
                    {done && !current && (
                      <span className="ml-1.5 text-[0.6rem] font-semibold tracking-wider text-ink/50">
                        COMPLETE
                      </span>
                    )}
                  </p>
                  <h3 className="mt-1 text-[0.9375rem] font-semibold tracking-tight text-ink sm:text-base">
                    {step.title}
                  </h3>
                </div>
                {!locked && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                      current
                        ? "bg-ink text-white"
                        : "bg-black/[0.04] text-ink"
                    }`}
                  >
                    {step.cta}
                    {current ? " →" : ""}
                  </span>
                )}
              </div>
              <p className="learn-body mt-1.5">{step.description}</p>
              <p className="mt-2 text-[0.8125rem] font-medium leading-snug text-ink/80">
                {step.promise}
              </p>
              <p className="learn-meta mt-2">{step.detail}</p>
            </div>
          </div>
        );

        return (
          <li key={step.id} className={isLast ? "" : "pb-3"}>
            {locked ? (
              body
            ) : (
              <Link href={step.href} className="block">
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Hook + client wrapper: loads journey from localStorage */
export function useJourney(): JourneySnapshot | null {
  const [journey, setJourney] = useState<JourneySnapshot | null>(null);
  const refresh = () => setJourney(getJourney(loadLmsState()));

  useEffect(() => {
    refresh();
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    refresh();
  }, [pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "supercube_lms_v1" || e.key === null) refresh();
    };
    const onLocal = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("sc-lms-update", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sc-lms-update", onLocal);
    };
  }, []);

  return journey;
}

export function JourneyRailLive() {
  const journey = useJourney();
  if (!journey) {
    return (
      <div className="mb-5 h-[7.5rem] animate-pulse rounded-2xl border border-black/[0.06] bg-[#f8f9fb] sm:mb-6" />
    );
  }
  return (
    <div className="mb-5 sm:mb-6">
      <JourneyRail journey={journey} />
    </div>
  );
}
