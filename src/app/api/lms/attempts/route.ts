import { NextResponse } from "next/server";
import { buildAssessmentItems } from "@/lib/lms/curriculum";
import { scoreAttempt } from "@/lib/lms/scoring";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { loadLearning } from "@/lib/lms/server/learning";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

/**
 * Submit an assessment. Scoring happens HERE, never in the browser.
 *  - pre:  once per programme; a retake returns 409 with the locked baseline.
 *  - mid:  needs a baseline; history kept.
 *  - post: needs baseline + full access + the time/sessions gate; once only.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  let body: { phase?: string; programmeId?: string; responses?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phase = body.phase;
  if (phase !== "pre" && phase !== "mid" && phase !== "post") {
    return NextResponse.json({ error: "phase must be pre, mid or post" }, { status: 400 });
  }
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const programmeId = programme.id as ProgrammeId;

  // Validate every item: integer 1..5, no extras
  const items = buildAssessmentItems(programmeId);
  const raw = body.responses && typeof body.responses === "object" ? body.responses : {};
  const responses: Record<string, number> = {};
  for (const item of items) {
    const v = Number(raw[item.id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      return NextResponse.json(
        { error: "Every item needs an answer from 1 to 5", itemId: item.id },
        { status: 400 },
      );
    }
    responses[item.id] = v;
  }

  const learning = await loadLearning(ctx.admin, ctx.user.id, programmeId);
  const pre = learning.attempts.find((a) => a.phase === "pre");

  if (phase === "pre" && pre) {
    return NextResponse.json(
      { error: "baseline_locked", message: "Your baseline is locked and cannot be retaken.", attempt: pre },
      { status: 409 },
    );
  }
  if (phase !== "pre" && !pre) {
    return NextResponse.json({ error: "baseline_required" }, { status: 409 });
  }
  if (phase === "post") {
    if (learning.attempts.some((a) => a.phase === "post")) {
      return NextResponse.json({ error: "post_locked", message: "Your after-test is already recorded." }, { status: 409 });
    }
    const ent = await getServerEntitlement(ctx.admin, ctx.user.id);
    if (!isEntitled(ent)) {
      return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
    if (!learning.gate.ok) {
      return NextResponse.json({ error: "post_gate", gate: learning.gate }, { status: 403 });
    }
  }

  const result = scoreAttempt(items, responses);
  const { data, error } = await ctx.admin
    .from("lms_attempts")
    .insert({
      user_id: ctx.user.id,
      programme_id: programmeId,
      instrument_id: items[0]?.instrumentId ?? `super_cube_${programmeId}_v1`,
      phase,
      responses,
      construct_scores: result.constructScores,
      overall: result.overall,
    })
    .select("id, phase, programme_id, construct_scores, overall, responses, created_at")
    .single();

  if (error) {
    const locked = /duplicate key|unique/i.test(error.message);
    return NextResponse.json(
      { error: locked ? `${phase}_locked` : error.message },
      { status: locked ? 409 : 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    attempt: {
      id: data.id,
      phase: data.phase,
      programmeId: data.programme_id,
      overall: data.overall,
      constructScores: data.construct_scores,
      responses: data.responses,
      completedAt: data.created_at,
    },
  });
}
