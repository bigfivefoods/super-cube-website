import { NextResponse } from "next/server";
import { getLesson } from "@/lib/lms/curriculum";
import { completionCountsForGate, isSampleLesson } from "@/lib/lms/gates";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { recordActivitySafe } from "@/lib/lms/server/engagement";
import { guardianConsentBlock } from "@/lib/lms/server/guardian-gate";
import { enforceMastery } from "@/lib/lms/server/mastery";
import { courseId, getProgramme, type ProgrammeId } from "@/lib/programmes";
import type { ConstructId } from "@/lib/content";

/**
 * Record a session open or completion.
 * An open is the server's evidence that the learner was in the session.
 * A completion counts toward the after-test only after that open has lasted
 * long enough. Posting a lesson id on its own is stored but does not open the gate.
 *
 * Mastery: a session with a knowledge check completes when about two-thirds of
 * the answers are right (half for Kids), or on a second go after the learner
 * has read the explanations. Otherwise the route answers 422 "mastery_retry".
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const blocked = await guardianConsentBlock(ctx.admin, ctx.user.id);
  if (blocked) return blocked;

  const body = (await request.json().catch(() => ({}))) as {
    lessonId?: string;
    constructId?: string;
    programmeId?: string;
    action?: string;
    /** First answers to the session's knowledge check (option indexes) */
    answers?: unknown;
    /** The learner is completing after a retry with explanations */
    retry?: boolean;
  };
  const action = body.action == null || body.action === "" ? "complete" : String(body.action);
  if (action !== "open" && action !== "complete") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const constructId = String(body.constructId || "") as ConstructId;
  const lessonId = String(body.lessonId || "");
  const found = getLesson(courseId(programme.id as ProgrammeId, constructId), lessonId);
  if (!found) return NextResponse.json({ error: "Unknown session" }, { status: 400 });

  if (!isSampleLesson(lessonId)) {
    const ent = await getServerEntitlement(ctx.admin, ctx.user.id);
    if (!isEntitled(ent)) {
      return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
  }

  if (action === "open") {
    const { error } = await ctx.admin.from("lms_lesson_opens").upsert(
      {
        user_id: ctx.user.id,
        lesson_id: lessonId,
        programme_id: programme.id,
        opened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, opened: true });
  }

  const { data: openRow } = await ctx.admin
    .from("lms_lesson_opens")
    .select("opened_at")
    .eq("user_id", ctx.user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  const countsForGate = completionCountsForGate(
    (openRow as { opened_at?: string } | null)?.opened_at ?? null,
  );

  const { data: existing, error: readError } = await ctx.admin
    .from("lms_lesson_completions")
    .select("lesson_id, counts_for_gate")
    .eq("user_id", ctx.user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const row = existing as { counts_for_gate?: boolean } | null;

  // Already completed sessions are never re-checked.
  if (!row) {
    const questions = found.lesson.arc?.check ?? found.lesson.faceCheck ?? [];
    const gate = await enforceMastery(ctx.admin, {
      userId: ctx.user.id,
      lessonId,
      programmeId: programme.id,
      questions,
      answers: body.answers,
      retry: body.retry === true,
    });
    if (!gate.ok) {
      const { correct, total, needed } = gate.verdict;
      return NextResponse.json({ error: "mastery_retry", mastery: { correct, total, needed } }, { status: 422 });
    }
  }

  if (row) {
    if (countsForGate && row.counts_for_gate !== true) {
      const { error } = await ctx.admin
        .from("lms_lesson_completions")
        .update({ counts_for_gate: true })
        .eq("user_id", ctx.user.id)
        .eq("lesson_id", lessonId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      countsForGate: countsForGate || row.counts_for_gate === true,
      engagement: null,
    });
  }

  const { error } = await ctx.admin.from("lms_lesson_completions").insert({
    user_id: ctx.user.id,
    lesson_id: lessonId,
    programme_id: programme.id,
    construct_id: constructId,
    counts_for_gate: countsForGate,
  });
  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return NextResponse.json({ ok: true, countsForGate, engagement: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const engagement = await recordActivitySafe(ctx.admin, ctx.user.id, {
    kind: "session_complete",
    ref: lessonId,
    programmeId: programme.id,
    minutes: found.lesson.durationMinutes ?? null,
  });
  return NextResponse.json({ ok: true, countsForGate, engagement });
}
