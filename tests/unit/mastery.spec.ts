import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLesson } from "@/lib/lms/curriculum";
import { gradeAnswers, isMastered, masteryNeeded, masteryVerdict, mayComplete, recordAttempt, retryCopy } from "@/lib/lms/mastery";
import { cleanAnswers, enforceMastery } from "@/lib/lms/server/mastery";

test("about two-thirds to pass; Kids need half", () => {
  expect(masteryNeeded(3, "adults")).toBe(2);
  expect(masteryNeeded(4, "adolescents")).toBe(3);
  expect(masteryNeeded(6, "adults")).toBe(4);
  expect(masteryNeeded(3, "kids")).toBe(2);
  expect(masteryNeeded(4, "kids")).toBe(2);
  expect(masteryNeeded(0, "adults")).toBe(0);
});

test("grading counts only matching first answers", () => {
  const qs = [{ answer: 0 }, { answer: 2 }, { answer: 1 }];
  expect(gradeAnswers(qs, [0, 2, 1])).toBe(3);
  expect(gradeAnswers(qs, [0, 1, null])).toBe(1);
  expect(gradeAnswers(qs, [])).toBe(0);
});

test("complete on a pass, or on a retry after a first attempt; never a dead end", () => {
  const fail = masteryVerdict(1, 3, "adults");
  expect(fail.passed).toBe(false);
  expect(mayComplete(fail, 0, false)).toBe(false);
  expect(mayComplete(fail, 0, true)).toBe(false); // a "retry" with no first attempt is not a retry
  expect(mayComplete(fail, 1, true)).toBe(true);
  expect(mayComplete(masteryVerdict(2, 3, "adults"), 0, false)).toBe(true);
  expect(mayComplete(masteryVerdict(0, 0, "adults"), 0, false)).toBe(true); // labs have no check
});

test("attempt records keep the first try and the best score", () => {
  const first = recordAttempt(undefined, masteryVerdict(1, 3, "adults"), { retried: false, completed: false });
  expect(first).toMatchObject({ attempts: 1, firstCorrect: 1, bestCorrect: 1, firstTry: false, needed: 2 });
  expect(first.passedAt).toBeUndefined();
  const second = recordAttempt(first, masteryVerdict(3, 3, "adults"), { retried: true, completed: true });
  expect(second).toMatchObject({ attempts: 2, firstCorrect: 1, bestCorrect: 3, firstTry: false, retried: true });
  expect(second.passedAt).toBeTruthy();
  expect(isMastered(second)).toBe(true);
  const retriedLow = recordAttempt(first, masteryVerdict(1, 3, "adults"), { retried: true, completed: true });
  expect(isMastered(retriedLow)).toBe(false); // completed, kindly, but not "mastered"
});

test("retry copy is kind, and gentler for Kids", () => {
  const v = masteryVerdict(1, 3, "kids");
  const kids = retryCopy(v, "kids");
  const adults = retryCopy(masteryVerdict(1, 3, "adults"), "adults");
  expect(kids.body).toMatch(/can’t fail/);
  expect(kids.body.length).toBeLessThan(adults.body.length);
  for (const c of [kids, adults]) expect(`${c.title} ${c.body}`).not.toMatch(/fail(ed|ure)|wrong!/i);
});

test("answers are sanitised", () => {
  expect(cleanAnswers([0, "1", 2.5, -1, 3, 9], 5)).toEqual([0, null, null, null, 3]);
  expect(cleanAnswers("nope", 3)).toEqual([]);
});

/** Minimal stand-in for the Supabase admin client: count + insert on lms_session_checks. */
function fakeAdmin(opts: { missing?: boolean; prior?: number }) {
  const inserted: Record<string, unknown>[] = [];
  const admin = {
    from(table: string) {
      expect(table).toBe("lms_session_checks");
      const chain = {
        select: () => chain,
        eq: () => chain,
        then: (res: (v: unknown) => void) =>
          res(
            opts.missing
              ? { count: null, error: { code: "PGRST205", message: "Could not find the table 'public.lms_session_checks'" } }
              : { count: opts.prior ?? 0, error: null },
          ),
        insert: async (row: Record<string, unknown>) => {
          inserted.push(row);
          return { error: null };
        },
      };
      return chain;
    },
  };
  return { admin: admin as unknown as SupabaseClient, inserted };
}

test("server enforces mastery on completion and records each attempt", async () => {
  const found = getLesson("adults-choices", "adults-choices-skill-1")!;
  const qs = found.lesson.arc!.check;
  const right = qs.map((q) => q.answer);
  const wrong = qs.map((q) => (q.answer + 1) % q.options.length);
  const base = { userId: "u1", lessonId: "adults-choices-skill-1", programmeId: "adults", questions: qs };

  const pass = fakeAdmin({});
  const ok = await enforceMastery(pass.admin, { ...base, answers: right, retry: false });
  expect(ok.ok).toBe(true);
  expect(pass.inserted[0]).toMatchObject({ passed: true, completed: true, retry: false });

  const first = fakeAdmin({ prior: 0 });
  const refused = await enforceMastery(first.admin, { ...base, answers: wrong, retry: false });
  expect(refused.ok).toBe(false);
  expect(first.inserted[0]).toMatchObject({ passed: false, completed: false });

  const fakeRetry = fakeAdmin({ prior: 0 });
  expect((await enforceMastery(fakeRetry.admin, { ...base, answers: wrong, retry: true })).ok).toBe(false);

  const realRetry = fakeAdmin({ prior: 1 });
  expect((await enforceMastery(realRetry.admin, { ...base, answers: wrong, retry: true })).ok).toBe(true);

  const noAnswers = fakeAdmin({ prior: 0 });
  expect((await enforceMastery(noAnswers.admin, { ...base, answers: undefined, retry: false })).ok).toBe(false);
});

test("before the migration is applied, the server still grades (no table writes)", async () => {
  const found = getLesson("kids-mental", "kids-mental-skill-1")!;
  const qs = found.lesson.arc!.check;
  const base = { userId: "u1", lessonId: "kids-mental-skill-1", programmeId: "kids", questions: qs };
  const m = fakeAdmin({ missing: true });
  expect((await enforceMastery(m.admin, { ...base, answers: qs.map((q) => q.answer), retry: false })).ok).toBe(true);
  expect((await enforceMastery(m.admin, { ...base, answers: [], retry: false })).ok).toBe(false);
  expect((await enforceMastery(m.admin, { ...base, answers: [], retry: true })).ok).toBe(true);
  expect(m.inserted).toHaveLength(0);
});

test("practice labs have no check to master", async () => {
  const m = fakeAdmin({});
  const r = await enforceMastery(m.admin, { userId: "u", lessonId: "x", programmeId: "adults", questions: [], answers: [], retry: false });
  expect(r.ok).toBe(true);
  expect(m.inserted).toHaveLength(0);
});
