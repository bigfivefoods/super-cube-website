import type { SupabaseClient } from "@supabase/supabase-js";
import { evaluatePostGate, type PostGate } from "@/lib/lms/gates";
import type { ProgrammeId } from "@/lib/programmes";
import type { ConstructScore } from "@/lib/lms/scoring";

export type ServerAttempt = {
  id: string;
  programme_id: ProgrammeId;
  instrument_id: string;
  phase: "pre" | "mid" | "post";
  construct_scores: ConstructScore[];
  overall: number;
  responses: Record<string, number>;
  created_at: string;
};

export async function loadLearning(
  admin: SupabaseClient,
  userId: string,
  programmeId: ProgrammeId,
): Promise<{
  attempts: ServerAttempt[];
  completions: string[];
  gate: PostGate;
}> {
  const [{ data: attempts }, { data: completions }] = await Promise.all([
    admin
      .from("lms_attempts")
      .select("id, programme_id, instrument_id, phase, construct_scores, overall, responses, created_at")
      .eq("user_id", userId)
      .eq("programme_id", programmeId)
      .order("created_at", { ascending: true }),
    admin
      .from("lms_lesson_completions")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("programme_id", programmeId),
  ]);
  const list = (attempts ?? []) as ServerAttempt[];
  const done = (completions ?? []).map((c) => c.lesson_id as string);
  const pre = list.find((a) => a.phase === "pre");
  const gate = evaluatePostGate({
    programmeId,
    preCompletedAt: pre?.created_at ?? null,
    completedLessonIds: done,
  });
  return { attempts: list, completions: done, gate };
}
