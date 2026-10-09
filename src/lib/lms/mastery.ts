/**
 * Session mastery: completing a session asks for roughly two-thirds of its
 * knowledge-check questions right on the first go, or one retry after
 * reading the explanations. Kids need half. Never a dead end: after one
 * retry the session completes whatever the score.
 *
 * Shared by the session page and /api/lms/progress (which enforces it).
 */
import type { ProgrammeId } from "@/lib/programmes";
import type { MasteryRecord } from "@/lib/lms/store";

export type MasteryVerdict = { correct: number; total: number; needed: number; passed: boolean };

/** Correct answers needed: two-thirds (rounded up), or half for Kids. */
export function masteryNeeded(total: number, programmeId: ProgrammeId | string | undefined): number {
  if (total <= 0) return 0;
  return programmeId === "kids" ? Math.ceil(total / 2) : Math.ceil((2 * total) / 3);
}

/** Grade answers (option indexes) against the questions' keys. Missing answers count as wrong. */
export function gradeAnswers(questions: readonly { answer: number }[], answers: readonly (number | null | undefined)[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
}

export function masteryVerdict(correct: number, total: number, programmeId: ProgrammeId | string | undefined): MasteryVerdict {
  const needed = masteryNeeded(total, programmeId);
  return { correct, total, needed, passed: correct >= needed };
}

/**
 * May the session be completed? Yes when the check was passed, or when the
 * learner has already had one go and has now retried with the explanations.
 */
export function mayComplete(v: MasteryVerdict, priorAttempts: number, retried: boolean): boolean {
  return v.total === 0 || v.passed || (retried && priorAttempts > 0);
}

/** Fold one attempt into the stored record. */
export function recordAttempt(
  prev: MasteryRecord | undefined,
  v: MasteryVerdict,
  opts: { retried: boolean; completed: boolean; now?: Date },
): MasteryRecord {
  const first = !prev || prev.attempts === 0;
  return {
    attempts: (prev?.attempts ?? 0) + 1,
    firstCorrect: first ? v.correct : prev!.firstCorrect,
    bestCorrect: Math.max(prev?.bestCorrect ?? 0, v.correct),
    total: v.total,
    needed: v.needed,
    firstTry: first ? v.passed : prev!.firstTry,
    retried: Boolean(prev?.retried || opts.retried),
    passedAt: prev?.passedAt ?? (opts.completed ? (opts.now ?? new Date()).toISOString() : undefined),
  };
}

/** A session counts as "mastered" when its check was passed (first try or after a retry). */
export function isMastered(r: MasteryRecord | undefined): boolean {
  return Boolean(r && r.passedAt && (r.firstTry || r.bestCorrect >= (r.needed ?? Math.ceil((2 * r.total) / 3))));
}

/** Kind, encouraging words for the retry panel. Kids get gentler, shorter words. */
export function retryCopy(v: MasteryVerdict, programmeId: ProgrammeId | string | undefined): { title: string; body: string; button: string } {
  if (programmeId === "kids") {
    return {
      title: "Good try! Let’s look at these together",
      body: `You got ${v.correct} of ${v.total}. Read the little notes below with your grown-up, then have one more go. You can’t fail this.`,
      button: "Have another go",
    };
  }
  if (programmeId === "adolescents") {
    return {
      title: "Nearly there. One more look",
      body: `You got ${v.correct} of ${v.total} first time; ${v.needed} locks the session in. Read why each answer works, then try the check once more. After that the session completes whatever your score.`,
      button: "Try the check again",
    };
  }
  return {
    title: "Worth one more look before you move on",
    body: `You got ${v.correct} of ${v.total} first time; ${v.needed} shows the idea has stuck. Read why each answer works, then try the check once more. Missing a question now is how memory gets stronger, and after this retry the session completes whatever your score.`,
    button: "Try the check again",
  };
}
