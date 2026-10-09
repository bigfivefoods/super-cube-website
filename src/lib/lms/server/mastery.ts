import type { SupabaseClient } from "@supabase/supabase-js";
import { gradeAnswers, masteryVerdict, mayComplete, type MasteryVerdict } from "@/lib/lms/mastery";

export type MasteryGate =
  | { ok: true; verdict: MasteryVerdict; recorded: boolean }
  | { ok: false; verdict: MasteryVerdict };

/** Postgres / PostgREST "table not there yet" (migration not applied). */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find the table/i.test(error.message ?? "");
}

/** Keep only integer option indexes, one per question at most. */
export function cleanAnswers(raw: unknown, n: number): (number | null)[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, n).map((v) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 16 ? v : null));
}

/**
 * Enforce session mastery on completion: about two-thirds of the knowledge
 * check right (half for Kids), or a second go after a first attempt the server
 * has on record. Each graded attempt is stored in lms_session_checks.
 *
 * Before the migration is applied, the route still grades the answers and
 * accepts a pass, or a retry the client reports (it cannot see earlier attempts).
 */
export async function enforceMastery(
  admin: SupabaseClient,
  input: {
    userId: string;
    lessonId: string;
    programmeId: string;
    questions: readonly { answer: number }[];
    answers: unknown;
    retry: boolean;
  },
): Promise<MasteryGate> {
  const total = input.questions.length;
  const answers = cleanAnswers(input.answers, total);
  const verdict = masteryVerdict(gradeAnswers(input.questions, answers), total, input.programmeId);
  if (total === 0) return { ok: true, verdict, recorded: false };

  const prior = await admin
    .from("lms_session_checks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("lesson_id", input.lessonId);

  const tableMissing = isMissingTable(prior.error);
  if (prior.error && !tableMissing) {
    // Don't lock a learner out of a session over a read error: grade only.
    return mayComplete(verdict, input.retry ? 1 : 0, input.retry)
      ? { ok: true, verdict, recorded: false }
      : { ok: false, verdict };
  }
  const priorAttempts = tableMissing ? (input.retry ? 1 : 0) : (prior.count ?? 0);
  const allowed = mayComplete(verdict, priorAttempts, input.retry);

  let recorded = false;
  if (!tableMissing) {
    const { error } = await admin.from("lms_session_checks").insert({
      user_id: input.userId,
      lesson_id: input.lessonId,
      programme_id: input.programmeId,
      correct: verdict.correct,
      total: verdict.total,
      needed: verdict.needed,
      passed: verdict.passed,
      retry: input.retry,
      completed: allowed,
    });
    recorded = !error;
  }
  return allowed ? { ok: true, verdict, recorded } : { ok: false, verdict };
}
