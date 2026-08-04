/**
 * Single “next best action” for You / sticky coach — closed-loop pathway.
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

export type NextActionKind =
  | "profile"
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
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

function isSundayLocal(): boolean {
  return new Date().getDay() === 0;
}

/**
 * Priority-ordered next action from current LMS state.
 */
export function getNextBestAction(state: LocalLmsState): NextBestAction {
  const profile = getProfile(state);
  if (!profileComplete(profile)) {
    return {
      kind: "profile",
      title: "Set up your profile",
      detail: "60 seconds so Learn, Report, and cohort fit who you are.",
      href: "/learn/welcome",
      cta: "Complete profile →",
      urgency: "high",
    };
  }

  if (!state.orientation) {
    return {
      kind: "orient",
      title: "Orient your leadership frame",
      detail: "Short knowledge check before your six-face baseline.",
      href: "/learn/assessment/orientation",
      cta: "Start orientation →",
      urgency: "high",
    };
  }

  const pre = state.attempts.find((a) => a.phase === "pre");
  if (!pre) {
    return {
      kind: "baseline",
      title: "Take your baseline assessment",
      detail: "Map all six Super-Cube® faces — your growth reference point.",
      href: "/learn/assessment/pre",
      cta: "Start baseline →",
      urgency: "high",
    };
  }

  if (!state.firstRun?.firstPulse && !(state.facePulses?.length)) {
    return {
      kind: "first_pulse",
      title: "Log your first face pulse",
      detail: "30 seconds: rate the faces so trends and practices can start.",
      href: "/learn/pulse",
      cta: "First pulse →",
      urgency: "high",
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
      detail: "You’ve practised enough — take the post-assessment for pre→post proof.",
      href: "/learn/assessment/post",
      cta: "Start post-assessment →",
      urgency: "medium",
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
    };
  }

  if (post) {
    return {
      kind: "report",
      title: "Open your growth report",
      detail: "Pre→post radar, story, and shareable PDF.",
      href: "/learn/report",
      cta: "View report →",
      urgency: "low",
    };
  }

  return {
    kind: "celebrate",
    title: "You’re on track",
    detail: "Pulse logged. Keep deliberate practice on your stretch faces.",
    href: "/learn/courses",
    cta: "Open courses →",
    urgency: "low",
  };
}
