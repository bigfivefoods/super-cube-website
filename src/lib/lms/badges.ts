/**
 * Growth badges (catalogue rows live in public.badges; the server awards them into
 * public.learner_badges). Pure so the criteria can be unit-tested and shown on the client.
 */
export const BADGE_IDS = [
  "first-session",
  "baseline-set",
  "streak-3",
  "streak-7",
  "streak-30",
  "face-complete",
  "pathway-complete",
] as const;
export type BadgeId = (typeof BADGE_IDS)[number];

export const BADGES: Record<BadgeId, { name: string; criteria: string; mark: string }> = {
  "first-session": { name: "First session", criteria: "Completed a first Super-Cube® session.", mark: "1" },
  "baseline-set": { name: "Baseline set", criteria: "Measured a starting profile across all six faces.", mark: "B" },
  "streak-3": { name: "3-day streak", criteria: "Practised, checked in or learned on 3 days in a row.", mark: "3" },
  "streak-7": { name: "7-day streak", criteria: "Practised, checked in or learned on 7 days in a row.", mark: "7" },
  "streak-30": { name: "30-day streak", criteria: "Practised, checked in or learned on 30 days in a row.", mark: "30" },
  "face-complete": { name: "Face complete", criteria: "Finished every session of one Super-Cube® face.", mark: "F" },
  "pathway-complete": { name: "Pathway complete", criteria: "Took the after-programme re-measure to see growth.", mark: "✓" },
};

export function isBadgeId(v: unknown): v is BadgeId {
  return typeof v === "string" && (BADGE_IDS as readonly string[]).includes(v);
}

export interface BadgeStats {
  sessionsDone: number;
  baseline: boolean;
  post: boolean;
  bestStreak: number;
  facesComplete: number;
}

/** Every badge the stats qualify for, in catalogue order. */
export function earnedBadges(s: BadgeStats): BadgeId[] {
  const out: BadgeId[] = [];
  if (s.sessionsDone >= 1) out.push("first-session");
  if (s.baseline) out.push("baseline-set");
  if (s.bestStreak >= 3) out.push("streak-3");
  if (s.bestStreak >= 7) out.push("streak-7");
  if (s.bestStreak >= 30) out.push("streak-30");
  if (s.facesComplete >= 1) out.push("face-complete");
  if (s.post) out.push("pathway-complete");
  return out;
}

export interface StreakView {
  current: number;
  best: number;
  freezes: number;
  lastDay: string | null;
}

/** A streak only counts as live if the learner was active today or yesterday (or a freeze covers the gap). */
export function liveStreak(s: StreakView, today: string): number {
  if (!s.lastDay) return 0;
  const gap = Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${s.lastDay}T12:00:00Z`)) / 86_400_000);
  if (gap <= 1) return s.current;
  return gap - 1 <= s.freezes ? s.current : 0;
}
