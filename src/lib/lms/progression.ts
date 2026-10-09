/**
 * Points, face light, levels, weekly goal, progress badges and per-session
 * spaced reviews. Everything is derived from the learner state (which syncs
 * through learner_state), so the same numbers appear on every device and
 * nothing here can drift from what the learner actually did.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { earnedBadges, BADGES, type BadgeId } from "@/lib/lms/badges";
import { findLessonMeta, getCoursesForProgramme, type LessonMeta } from "@/lib/lms/curriculum-meta";
import { addDays, dayDiff, localDayKey, localDayOfIso, weekStartKey } from "@/lib/lms/day";
import { isMastered } from "@/lib/lms/mastery";
import { getAllMicroPractices } from "@/lib/lms/micro-practices";
import type { LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

/* ───────────── Points ───────────── */

export const POINTS = {
  session: 10,
  faceCheck: 15,
  lab: 15,
  firstTryBonus: 5,
  practice: 3,
  reviewCorrect: 2,
} as const;

/** Light tiers per face: 0 dark … 4 fully lit. */
export const FACE_TIERS = [10, 35, 70, 105] as const;

export function faceTier(points: number): number {
  return FACE_TIERS.filter((t) => points >= t).length;
}

/** Cube face brightness (0–100) for a tier, for the SuperCube `scores` prop. */
export function tierLight(tier: number): number {
  return [0, 40, 62, 82, 100][Math.max(0, Math.min(4, tier))];
}

type PracticeIndex = Map<string, ConstructId>;
let practiceIndex: PracticeIndex | null = null;
function practiceFace(id: string): ConstructId | undefined {
  if (!practiceIndex) practiceIndex = new Map(getAllMicroPractices().map((p) => [p.id, p.constructId]));
  return practiceIndex.get(id);
}

function faceOfLesson(lessonId: string): { constructId: ConstructId; lesson: LessonMeta } | undefined {
  const found = findLessonMeta(lessonId);
  return found ? { constructId: found.course.constructId, lesson: found.lesson } : undefined;
}

export type FacePoints = Record<ConstructId, number>;

export function facePoints(state: Pick<LocalLmsState, "lessonProgress" | "mastery" | "microPracticeLog" | "sessionReviews">): FacePoints {
  const pts = Object.fromEntries(constructs.map((c) => [c.id, 0])) as FacePoints;
  for (const [lessonId, status] of Object.entries(state.lessonProgress ?? {})) {
    if (status !== "completed") continue;
    const f = faceOfLesson(lessonId);
    if (!f) continue;
    const base = f.lesson.lessonType === "quiz" ? POINTS.faceCheck : f.lesson.lessonType === "practice" ? POINTS.lab : POINTS.session;
    const bonus = state.mastery?.[lessonId]?.firstTry ? POINTS.firstTryBonus : 0;
    pts[f.constructId] += base + bonus;
  }
  for (const ids of Object.values(state.microPracticeLog ?? {})) {
    for (const id of ids) {
      const c = practiceFace(id);
      if (c) pts[c] += POINTS.practice;
    }
  }
  for (const [lessonId, byDay] of Object.entries(state.sessionReviews ?? {})) {
    const f = faceOfLesson(lessonId);
    if (!f || !byDay) continue;
    for (const r of Object.values(byDay)) if (r) pts[f.constructId] += POINTS.reviewCorrect * Math.max(0, r.correct);
  }
  return pts;
}

export function totalPoints(p: FacePoints): number {
  return Object.values(p).reduce((a, b) => a + b, 0);
}

/* ───────────── Levels ───────────── */

export type Level = { n: number; name: string; min: number; line: string };

/** Levels follow the geometry of the Super-Cube®: a point grows into a fully lit cube. */
export const LEVELS: Level[] = [
  { n: 1, name: "Point", min: 0, line: "Every cube starts with a single point. You’ve begun." },
  { n: 2, name: "Edge", min: 40, line: "Points are joining up: ideas are starting to connect." },
  { n: 3, name: "Face", min: 120, line: "A whole face is taking shape in how you lead." },
  { n: 4, name: "Cube", min: 260, line: "All six faces are in play, holding each other up." },
  { n: 5, name: "Lit Cube", min: 450, line: "Your faces are lighting up together, day after day." },
  { n: 6, name: "Super-Cube®", min: 650, line: "Leading from all six faces, consistently." },
];

export function levelFor(points: number): { level: Level; next: Level | null; pct: number; toNext: number } {
  let level = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) level = l;
  const next = LEVELS.find((l) => l.min > points) ?? null;
  const span = next ? next.min - level.min : 1;
  const pct = next ? Math.round(((points - level.min) / span) * 100) : 100;
  return { level, next, pct, toNext: next ? next.min - points : 0 };
}

/* ───────────── Weekly goal ───────────── */

export const WEEKLY_GOAL_OPTIONS = [3, 5, 7] as const;
export type WeeklyGoalTarget = (typeof WEEKLY_GOAL_OPTIONS)[number];

/** Activities per local week (Monday key → count): sessions, micro-practices and reviews. */
export function weeklyActivity(state: Pick<LocalLmsState, "sessionCompletedAt" | "microPracticeLog" | "sessionReviews">): Map<string, number> {
  const weeks = new Map<string, number>();
  const add = (day: string | null, n = 1) => {
    if (!day) return;
    const w = weekStartKey(day);
    weeks.set(w, (weeks.get(w) ?? 0) + n);
  };
  for (const iso of Object.values(state.sessionCompletedAt ?? {})) add(localDayOfIso(iso));
  for (const [day, ids] of Object.entries(state.microPracticeLog ?? {})) add(day, ids.length);
  for (const byDay of Object.values(state.sessionReviews ?? {})) {
    for (const r of Object.values(byDay ?? {})) if (r) add(localDayOfIso(r.at));
  }
  return weeks;
}

export type WeeklyGoalView = {
  target: number | null;
  done: number;
  pct: number;
  reached: boolean;
  weekStart: string;
  daysLeft: number;
  /** Weeks (Monday keys) in which the goal was reached */
  weeksHit: string[];
};

export function weeklyGoal(state: Pick<LocalLmsState, "weeklyGoal" | "sessionCompletedAt" | "microPracticeLog" | "sessionReviews">, today = localDayKey()): WeeklyGoalView {
  const target = state.weeklyGoal?.target ?? null;
  const weeks = weeklyActivity(state);
  const weekStart = weekStartKey(today);
  const done = weeks.get(weekStart) ?? 0;
  const since = state.weeklyGoal ? weekStartKey(localDayOfIso(state.weeklyGoal.setAt) ?? today) : weekStart;
  const weeksHit = target
    ? [...weeks.entries()].filter(([w, n]) => n >= target && w >= since).map(([w]) => w).sort()
    : [];
  return {
    target,
    done,
    pct: target ? Math.min(100, Math.round((done / target) * 100)) : 0,
    reached: Boolean(target && done >= target),
    weekStart,
    daysLeft: 6 - dayDiff(weekStart, today),
    weeksHit,
  };
}

/* ───────────── Per-session spaced reviews (Day 3, 7, 21) ───────────── */

export const SESSION_REVIEW_DAYS = [3, 7, 21] as const;
export type SessionReviewDay = (typeof SESSION_REVIEW_DAYS)[number];

export type SessionReviewItem = {
  lessonId: string;
  title: string;
  constructId: ConstructId;
  /** Review days due now (all are marked done by one review) */
  days: SessionReviewDay[];
  dueKey: string;
};

/** Reviews due today or earlier, oldest first, plus the next one coming up. */
export function sessionReviewQueue(
  state: Pick<LocalLmsState, "sessionCompletedAt" | "sessionReviews">,
  today = localDayKey(),
): { due: SessionReviewItem[]; next: SessionReviewItem | null } {
  const due: SessionReviewItem[] = [];
  let next: SessionReviewItem | null = null;
  for (const [lessonId, iso] of Object.entries(state.sessionCompletedAt ?? {})) {
    const f = faceOfLesson(lessonId);
    if (!f || f.lesson.checkCount === 0) continue;
    const doneDay = localDayOfIso(iso);
    if (!doneDay) continue;
    const doneReviews = state.sessionReviews?.[lessonId] ?? {};
    const open = SESSION_REVIEW_DAYS.filter((d) => !doneReviews[String(d) as "3" | "7" | "21"]);
    const dueDays = open.filter((d) => addDays(doneDay, d) <= today);
    const base = { lessonId, title: f.lesson.title, constructId: f.constructId };
    if (dueDays.length) {
      due.push({ ...base, days: dueDays, dueKey: addDays(doneDay, dueDays[0]) });
    } else if (open.length) {
      const key = addDays(doneDay, open[0]);
      if (!next || key < next.dueKey) next = { ...base, days: [open[0]], dueKey: key };
    }
  }
  due.sort((a, b) => (a.dueKey < b.dueKey ? -1 : a.dueKey > b.dueKey ? 1 : 0));
  return { due, next };
}

export function reviewsDoneCount(state: Pick<LocalLmsState, "sessionReviews">): number {
  let n = 0;
  for (const byDay of Object.values(state.sessionReviews ?? {})) n += Object.values(byDay ?? {}).filter(Boolean).length;
  return n;
}

/* ───────────── Badges ───────────── */

export const PROGRESS_BADGE_IDS = [
  "first-mastery",
  "mastery-5",
  "face-mastered",
  "reviews-3",
  "weekly-goal",
  "goal-4-weeks",
] as const;
export type ProgressBadgeId = (typeof PROGRESS_BADGE_IDS)[number];

export const PROGRESS_BADGES: Record<ProgressBadgeId, { name: string; criteria: string; mark: string }> = {
  "first-mastery": { name: "First mastery", criteria: "Mastered a session’s knowledge check.", mark: "M" },
  "mastery-5": { name: "Five mastered", criteria: "Mastered five session checks.", mark: "5" },
  "face-mastered": { name: "Face mastered", criteria: "Mastered every check on one Super-Cube® face.", mark: "◆" },
  "reviews-3": { name: "Spaced learner", criteria: "Finished three Day 3, 7 or 21 reviews.", mark: "R" },
  "weekly-goal": { name: "Goal getter", criteria: "Reached your weekly goal.", mark: "G" },
  "goal-4-weeks": { name: "Four strong weeks", criteria: "Reached your weekly goal in four weeks.", mark: "4" },
};

export function masteredCount(state: Pick<LocalLmsState, "mastery">): number {
  return Object.values(state.mastery ?? {}).filter((r) => isMastered(r)).length;
}

function facesMastered(state: Pick<LocalLmsState, "mastery">, programmeId: ProgrammeId): number {
  return getCoursesForProgramme(programmeId).filter((c) => {
    const checked = c.lessons.filter((l) => l.checkCount > 0);
    return checked.length > 0 && checked.every((l) => isMastered(state.mastery?.[l.id]));
  }).length;
}

export function earnedProgressBadges(state: LocalLmsState, programmeId: ProgrammeId): ProgressBadgeId[] {
  const out: ProgressBadgeId[] = [];
  const m = masteredCount(state);
  if (m >= 1) out.push("first-mastery");
  if (m >= 5) out.push("mastery-5");
  if (facesMastered(state, programmeId) >= 1) out.push("face-mastered");
  if (reviewsDoneCount(state) >= 3) out.push("reviews-3");
  const hits = weeklyGoal(state).weeksHit.length;
  if (hits >= 1) out.push("weekly-goal");
  if (hits >= 4) out.push("goal-4-weeks");
  return out;
}

export type BadgeView = { id: string; name: string; criteria: string; mark: string; earned: boolean; kind: "core" | "progress" };

/** The full badge wall: the core badges (worked out from this device) and the new progress badges. */
export function badgeWall(state: LocalLmsState, programmeId: ProgrammeId, serverBadges: string[] = []): BadgeView[] {
  const courses = getCoursesForProgramme(programmeId);
  const facesComplete = courses.filter((c) => c.lessons.every((l) => state.lessonProgress[l.id] === "completed")).length;
  const sessionsDone = Object.values(state.lessonProgress).filter((s) => s === "completed").length;
  const core = new Set<string>([
    ...earnedBadges({
      sessionsDone,
      baseline: state.attempts.some((a) => a.phase === "pre"),
      post: state.attempts.some((a) => a.phase === "post"),
      bestStreak: state.practiceStreak?.best ?? 0,
      facesComplete,
    }),
    ...serverBadges,
  ]);
  const progress = new Set<string>(earnedProgressBadges(state, programmeId));
  return [
    ...(Object.keys(BADGES) as BadgeId[]).map((id) => ({ id, ...BADGES[id], earned: core.has(id), kind: "core" as const })),
    ...PROGRESS_BADGE_IDS.map((id) => ({ id, ...PROGRESS_BADGES[id], earned: progress.has(id), kind: "progress" as const })),
  ];
}

/* ───────────── Summary ───────────── */

export type ProgressionView = {
  faces: FacePoints;
  tiers: Record<ConstructId, number>;
  total: number;
  level: ReturnType<typeof levelFor>;
};

export function progression(state: LocalLmsState): ProgressionView {
  const faces = facePoints(state);
  const tiers = Object.fromEntries(constructs.map((c) => [c.id, faceTier(faces[c.id])])) as Record<ConstructId, number>;
  const total = totalPoints(faces);
  return { faces, tiers, total, level: levelFor(total) };
}
