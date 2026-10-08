/**
 * Phase 0 integrity rules shared by the browser and the server.
 *
 * - The baseline (pre) is taken once per programme and never overwritten.
 * - The after-test (post) unlocks only after a minimum gap AND real practice:
 *   at least one completed session on every face and a minimum share of all sessions.
 *
 * The server re-checks these rules with its own records before accepting a post attempt.
 */

import { constructs, type ConstructId } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import type { ProgrammeId } from "@/lib/programmes";

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Minimum days between baseline and after-test (default 21). */
export const POST_MIN_DAYS = num(process.env.NEXT_PUBLIC_LMS_POST_MIN_DAYS, 21);
/** Minimum share of all sessions completed before the after-test (default 50%). */
export const POST_MIN_SESSION_SHARE = num(
  process.env.NEXT_PUBLIC_LMS_POST_MIN_SESSION_SHARE,
  0.5,
);
/** Sessions per face that must be completed before the after-test (default 1). */
export const POST_MIN_SESSIONS_PER_FACE = 1;
/**
 * A device clock may disagree with the server by this much. A claimed baseline
 * keeps its device time only inside this window; anything older is the server clock,
 * so a backdated claim cannot start the 21-day wait in the past.
 */
export const CLAIM_CLOCK_SKEW_MS = 2 * 60 * 1000;
/**
 * A lesson counts toward the after-test only after the server has seen it open
 * for at least this long. Naming the lesson id is not enough.
 */
export const SESSION_TRUST_MIN_MS = 30_000;

/**
 * When a signed-out baseline is claimed, the stored time is the server clock
 * unless the device time is inside a narrow skew window (not in the future, not days ago).
 */
export function baselineRecordedAt(clientCompletedAt: unknown, now = Date.now()): string {
  const t =
    typeof clientCompletedAt === "string" || typeof clientCompletedAt === "number"
      ? Date.parse(String(clientCompletedAt))
      : Number.NaN;
  if (Number.isFinite(t) && t <= now + CLAIM_CLOCK_SKEW_MS && now - t <= CLAIM_CLOCK_SKEW_MS) {
    return new Date(t).toISOString();
  }
  return new Date(now).toISOString();
}

/** True when this server recorded the lesson opening long enough before completion. */
export function completionCountsForGate(openedAt: string | null | undefined, now = Date.now()): boolean {
  if (!openedAt) return false;
  const t = Date.parse(openedAt);
  if (!Number.isFinite(t)) return false;
  if (t > now + CLAIM_CLOCK_SKEW_MS) return false;
  return now - t >= SESSION_TRUST_MIN_MS;
}

export type PostGateInput = {
  programmeId: ProgrammeId;
  preCompletedAt?: string | null;
  completedLessonIds: Iterable<string>;
  now?: Date;
};

export type PostGate = {
  ok: boolean;
  hasPre: boolean;
  daysSincePre: number;
  daysRemaining: number;
  sessionsDone: number;
  sessionsRequired: number;
  sessionsTotal: number;
  facesMissing: ConstructId[];
  reasons: string[];
  unlocksOn: string | null;
};

export function sessionsRequiredFor(programmeId: ProgrammeId): {
  total: number;
  required: number;
} {
  const total = getCoursesForProgramme(programmeId).reduce(
    (n, c) => n + c.lessons.length,
    0,
  );
  return { total, required: Math.ceil(total * POST_MIN_SESSION_SHARE) };
}

export function evaluatePostGate(input: PostGateInput): PostGate {
  const now = input.now ?? new Date();
  const courses = getCoursesForProgramme(input.programmeId);
  const done = new Set(input.completedLessonIds);
  const { total, required } = sessionsRequiredFor(input.programmeId);

  let sessionsDone = 0;
  const facesMissing: ConstructId[] = [];
  for (const c of courses) {
    const n = c.lessons.filter((l) => done.has(l.id)).length;
    sessionsDone += n;
    if (n < POST_MIN_SESSIONS_PER_FACE) facesMissing.push(c.constructId);
  }

  const hasPre = Boolean(input.preCompletedAt);
  const preMs = hasPre ? new Date(input.preCompletedAt as string).getTime() : 0;
  const daysSincePre = hasPre
    ? Math.floor((now.getTime() - preMs) / 86_400_000)
    : 0;
  const daysRemaining = hasPre ? Math.max(0, POST_MIN_DAYS - daysSincePre) : POST_MIN_DAYS;
  const unlocksOn = hasPre
    ? new Date(preMs + POST_MIN_DAYS * 86_400_000).toISOString()
    : null;

  const reasons: string[] = [];
  if (!hasPre) reasons.push("Take your baseline first.");
  if (hasPre && daysRemaining > 0) {
    reasons.push(
      `Give practice time to work: ${daysRemaining} more day${daysRemaining === 1 ? "" : "s"} (minimum ${POST_MIN_DAYS} days after your baseline).`,
    );
  }
  if (sessionsDone < required) {
    reasons.push(
      `Complete at least ${required} of ${total} sessions (you have ${sessionsDone}).`,
    );
  }
  if (facesMissing.length > 0) {
    const names = facesMissing
      .map((id) => constructs.find((c) => c.id === id)?.name ?? id)
      .join(", ");
    reasons.push(`Complete at least one session on every face (still to do: ${names}).`);
  }

  return {
    ok: reasons.length === 0,
    hasPre,
    daysSincePre,
    daysRemaining,
    sessionsDone,
    sessionsRequired: required,
    sessionsTotal: total,
    facesMissing,
    reasons,
    unlocksOn,
  };
}

/**
 * Free sample before purchase: the Choices overview and its first skill session.
 * Everything else needs a verified purchase or a paid cohort seat.
 */
export function isSampleLesson(lessonId: string): boolean {
  return /-choices-(overview|skill-1)$/.test(lessonId);
}
