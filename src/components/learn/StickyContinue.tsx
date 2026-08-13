"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import {
  getLearningAction,
  getJournalAction,
  processLabel,
  type NextBestAction,
} from "@/lib/lms/next-action";
import { loadLmsState } from "@/lib/lms/store";
import { useJourney } from "@/components/learn/JourneyProgress";

function isUrgent(a: NextBestAction | null): a is NextBestAction {
  return Boolean(a && (a.urgency === "high" || a.urgency === "medium"));
}

/**
 * Minimal sticky next-page CTA on mobile.
 * Process-prefixed so Learning vs Journal is never ambiguous.
 * Hidden on focused flows and when nothing is urgent.
 */
export function StickyContinue() {
  const journey = useJourney();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [journey?.doneCount, pathname]);

  if (
    pathname.startsWith("/learn/pulse") ||
    pathname.startsWith("/learn/welcome") ||
    pathname.startsWith("/learn/assessment/") ||
    pathname.startsWith("/learn/courses/") ||
    pathname === "/learn" ||
    pathname === "/learn/"
  ) {
    return null;
  }

  if (!ready || !journey) return null;

  const state = loadLmsState();
  const learning = getLearningAction(state);
  const journal = getJournalAction(state);

  const urgentLearning = isUrgent(learning) ? learning : null;
  const urgentJournal = isUrgent(journal) ? journal : null;

  if (!urgentLearning && !urgentJournal) return null;

  // Dual mini-CTAs when both processes have something urgent
  if (urgentLearning && urgentJournal) {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 z-40 lg:hidden"
        style={{
          bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="container-site pointer-events-auto flex justify-center gap-2 pb-1">
          <ProcessPill action={urgentLearning} />
          <ProcessPill action={urgentJournal} />
        </div>
      </div>
    );
  }

  const action = (urgentLearning ?? urgentJournal)!;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 lg:hidden"
      style={{
        bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="container-site pointer-events-auto flex justify-center pb-1">
        <Link
          href={action.href}
          onClick={() =>
            track("continue_click", {
              kind: action.kind,
              process: action.process,
              sticky: true,
            })
          }
          className="inline-flex min-h-11 max-w-sm items-center gap-2 rounded-full border border-line sc-btn-primary px-5 text-sm font-semibold shadow-lg"
        >
          <span className="truncate">
            {processLabel(action.process)} · {shortCta(action)}
          </span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function shortCta(action: NextBestAction): string {
  if (action.kind === "pulse_today" || action.kind === "first_pulse") {
    return "Check in";
  }
  if (action.kind === "streak_recover") return "Pulse";
  if (action.kind === "practice") return "Practice";
  if (action.kind === "lesson") return "Continue";
  if (action.kind === "weekly_review") return "Review";
  return action.cta.replace(/\s*→\s*$/, "");
}

function ProcessPill({ action }: { action: NextBestAction }) {
  return (
    <Link
      href={action.href}
      onClick={() =>
        track("continue_click", {
          kind: action.kind,
          process: action.process,
          sticky: true,
          dual: true,
        })
      }
      className="inline-flex min-h-10 max-w-[11rem] items-center gap-1.5 rounded-full border border-line bg-elevated px-3.5 text-[0.75rem] font-semibold text-ink shadow-md"
    >
      <span className="truncate">
        {processLabel(action.process)} · {shortCta(action)}
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
