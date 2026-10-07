/**
 * Process-aware next actions — Learning pathway vs Journaling loop.
 * Never interleave without a process label.
 */

import { constructs, type ConstructId } from "@/lib/content";
import { getContinueTarget } from "@/lib/lms/continue";
import {
  deriveFacePattern,
  getTodayPulse,
} from "@/lib/lms/face-tracking";
import { profileComplete, getProfile } from "@/lib/lms/profile";
import type { LocalLmsState } from "@/lib/lms/store";
import { localDayKey } from "@/lib/lms/store";
import { learnerProgrammeId, programmeCopy } from "@/lib/lms/programme-copy";

export type NextActionKind =
  | "profile"
  | "programme"
  | "orient"
  | "baseline"
  | "first_pulse"
  | "pulse_today"
  | "streak_recover"
  | "practice"
  | "lesson"
  | "post"
  | "report"
  | "weekly_review"
  | "celebrate";

/** Which track this action belongs to. */
export type ActionProcess = "learning" | "journaling" | "setup";

export interface NextBestAction {
  kind: NextActionKind;
  title: string;
  detail: string;
  href: string;
  cta: string;
  /** Optional face colour chip */
  color?: string;
  constructId?: ConstructId;
  urgency: "high" | "medium" | "low";
  /** Dual-process label for CTAs and cards */
  process: ActionProcess;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

function isSundayLocal(): boolean {
  return new Date().getDay() === 0;
}

const URGENCY_RANK = { high: 0, medium: 1, low: 2 } as const;

/**
 * Learning process only — pathway, lessons, assessments, report.
 * Excludes pulse / practice / weekly review.
 */
export function getLearningAction(
  state: LocalLmsState
): NextBestAction | null {
  const profile = getProfile(state);
  if (!profileComplete(profile)) {
    return {
      kind: "profile",
      title: "Set up your profile",
      detail: "60 seconds so Learn, Report, and cohort fit who you are.",
      href: "/learn/welcome",
      cta: "Complete profile →",
      urgency: "high",
      process: "setup",
    };
  }

  if (!state.orientation) {
    return {
      kind: "orient",
      title: "Orient your leadership frame",
      detail: programmeCopy("next.orient.detail", learnerProgrammeId(state)),
      href: "/learn/assessment/orientation",
      cta: "Start orientation →",
      urgency: "high",
      process: "learning",
    };
  }

  const pre = state.attempts.find((a) => a.phase === "pre");
  if (!pre) {
    return {
      kind: "baseline",
      title: "Take your baseline assessment",
      detail: programmeCopy("next.baseline.detail", learnerProgrammeId(state)),
      href: "/learn/assessment/pre",
      cta: "Start baseline →",
      urgency: "high",
      process: "learning",
    };
  }

  const post = state.attempts.find((a) => a.phase === "post");
  const lessonsDone = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;

  if (pre && !post && lessonsDone >= 6) {
    return {
      kind: "post",
      title: "Re-measure your growth",
      detail: programmeCopy("next.post.detail", learnerProgrammeId(state)),
      href: "/learn/assessment/post",
      cta: "Start post-assessment →",
      urgency: "medium",
      process: "learning",
    };
  }

  const cont = getContinueTarget(state, "/learn/courses", "Continue learning");
  if (cont.kind === "resume" || cont.kind === "next_lesson") {
    return {
      kind: "lesson",
      title: cont.title,
      detail: cont.detail,
      href: cont.href,
      cta: cont.kind === "resume" ? "Resume session →" : "Next session →",
      color: cont.constructColor,
      constructId: cont.constructId,
      urgency: "medium",
      process: "learning",
    };
  }

  if (post) {
    return {
      kind: "report",
      title: "Open your growth report",
      detail: programmeCopy("next.report.detail", learnerProgrammeId(state)),
      href: "/learn/report",
      cta: "View report →",
      urgency: "low",
      process: "learning",
    };
  }

  return {
    kind: "celebrate",
    title: "Pathway on track",
    detail: programmeCopy("next.celebrate.detail", learnerProgrammeId(state)),
    href: "/learn/courses",
    cta: "Open courses →",
    urgency: "low",
    process: "learning",
  };
}

/**
 * Journaling process only — pulse, practice, weekly review.
 * Never returns pathway / assessment / lesson targets.
 */
export function getJournalAction(state: LocalLmsState): NextBestAction | null {
  const profile = getProfile(state);
  // Journaling needs a minimal setup floor; otherwise defer to learning setup.
  if (!profileComplete(profile)) return null;
  // Journal prompts start after orientation so a new learner sees one path, not two.
  if (!state.orientation) return null;

  if (!state.firstRun?.firstPulse && !(state.facePulses?.length)) {
    return {
      kind: "first_pulse",
      title: "Log your first face pulse",
      detail: "30 seconds: rate the faces so trends and practices can start.",
      href: "/learn/pulse",
      cta: "First pulse →",
      urgency: "high",
      process: "journaling",
    };
  }

  const today = localDayKey();
  const streak = state.practiceStreak;
  const missedYesterday =
    streak?.lastDate &&
    streak.lastDate !== today &&
    streak.lastDate !== yesterdayKey() &&
    (streak.current ?? 0) > 0;

  if (missedYesterday) {
    return {
      kind: "streak_recover",
      title: "Comeback pulse",
      detail: "A short face check restarts momentum — no shame, just return.",
      href: "/learn/pulse",
      cta: "Pulse now →",
      urgency: "high",
      process: "journaling",
    };
  }

  if (!getTodayPulse(state)) {
    const pattern = deriveFacePattern(state);
    const focus = pattern.weakest[0];
    const face = focus ? constructs.find((c) => c.id === focus) : null;
    return {
      kind: "pulse_today",
      title: face ? `Pulse today · focus ${face.shortName}` : "Daily face pulse",
      detail: pattern.insight || "Rate 3+ faces so patterns stay current.",
      href: "/learn/pulse",
      cta: "Log pulse →",
      color: face?.color,
      constructId: focus,
      urgency: "medium",
      process: "journaling",
    };
  }

  if (isSundayLocal()) {
    return {
      kind: "weekly_review",
      title: "Weekly review",
      detail: "Pick this week’s focus face and lock three micro-practices.",
      href: "/learn/pulse",
      cta: "Review week →",
      urgency: "medium",
      process: "journaling",
    };
  }

  const pattern = deriveFacePattern(state);
  const focus = pattern.weakest[0];
  const face = focus ? constructs.find((c) => c.id === focus) : null;
  if (face) {
    return {
      kind: "practice",
      title: `Micro-practice · ${face.shortName}`,
      detail: pattern.insight,
      href: "/learn/practice",
      cta: "Practice now →",
      color: face.color,
      constructId: face.id,
      urgency: "low",
      process: "journaling",
    };
  }

  return {
    kind: "celebrate",
    title: "Journal up to date",
    detail: "Pulse logged. Keep deliberate practice on your stretch faces.",
    href: "/learn/practice",
    cta: "Open practice →",
    urgency: "low",
    process: "journaling",
  };
}

/** Human label for process-prefixed CTAs. */
export function processLabel(process: ActionProcess): string {
  if (process === "journaling") return "Journal";
  if (process === "setup") return "Setup";
  return "Learning";
}

/**
 * Single next-best action for sticky coach / account card.
 * Prefers highest urgency; ties break Learning before Journal when equal.
 */
export function getNextBestAction(state: LocalLmsState): NextBestAction {
  const learning = getLearningAction(state);
  const journal = getJournalAction(state);

  if (!learning && !journal) {
    return {
      kind: "celebrate",
      title: "You’re on track",
      detail: "Both processes look good — pick Learn or Journal when ready.",
      href: "/learn",
      cta: "Open Today →",
      urgency: "low",
      process: "learning",
    };
  }
  if (!learning) return journal!;
  if (!journal) return learning;

  // Setup and the gated pathway steps (profile → orientation → baseline) always win:
  // journal prompts wait for orientation, and the baseline anchors every chart.
  if (learning.process === "setup") return learning;
  if (learning.kind === "orient" || learning.kind === "baseline") return learning;

  if (URGENCY_RANK[learning.urgency] < URGENCY_RANK[journal.urgency]) {
    return learning;
  }
  if (URGENCY_RANK[journal.urgency] < URGENCY_RANK[learning.urgency]) {
    return journal;
  }
  // Equal urgency: prefer journal if pulse missing (daily habit), else learning
  if (
    journal.kind === "pulse_today" ||
    journal.kind === "first_pulse" ||
    journal.kind === "streak_recover"
  ) {
    return journal;
  }
  return learning;
}

/**
 * Dashboard "one next action": the pathway gate comes first. Without a programme the
 * learner can't orient or measure, so the card points at step 1 instead of a habit.
 */
export function getDashboardAction(
  state: LocalLmsState,
  hasProgramme: boolean
): NextBestAction {
  const best = getNextBestAction(state);
  if (best.kind === "profile" || hasProgramme) return best;
  return {
    kind: "programme",
    title: "Choose your programme",
    detail:
      "Kids, Adolescents or Adults: the same six faces, in language matched to your season of life.",
    href: "/learn/programmes",
    cta: "Choose programme →",
    urgency: "high",
    process: "learning",
  };
}
