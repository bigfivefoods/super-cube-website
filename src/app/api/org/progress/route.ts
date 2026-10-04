import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { loadLearning } from "@/lib/lms/server/learning";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

/**
 * Push a consented, non-journal progress snapshot for the learner's cohort coaches.
 * Scores, completion and certificate come from the SERVER's records, not the browser.
 * The learner must already be a member (joined via /api/org/join).
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const orgCode = String(body.orgCode || "").trim().toUpperCase();
  if (!orgCode) return NextResponse.json({ error: "orgCode required" }, { status: 400 });
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, skipped: true, reason: "no_consent" });
  }

  const { data: org } = await ctx.admin
    .from("organisations")
    .select("id")
    .eq("code", orgCode)
    .eq("active", true)
    .maybeSingle();
  if (!org) return NextResponse.json({ error: "Unknown org" }, { status: 404 });

  const { data: member } = await ctx.admin
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Join the cohort first" }, { status: 403 });

  const programmeId = (getProgramme(String(body.programmeId || ""))?.id ?? "adults") as ProgrammeId;
  const learning = await loadLearning(ctx.admin, ctx.user.id, programmeId);
  const pre = learning.attempts.find((a) => a.phase === "pre");
  const post = learning.attempts.find((a) => a.phase === "post");
  const mid = [...learning.attempts].reverse().find((a) => a.phase === "mid");

  const faceScores: Record<string, { pre?: number; mid?: number; post?: number }> = {};
  for (const [phase, att] of [["pre", pre], ["mid", mid], ["post", post]] as const) {
    for (const s of att?.construct_scores ?? []) {
      faceScores[s.constructId] = { ...(faceScores[s.constructId] ?? {}), [phase]: s.score };
    }
  }

  const { data: cert } = await ctx.admin
    .from("certificates")
    .select("id")
    .eq("user_id", ctx.user.id)
    .eq("programme_id", programmeId)
    .eq("revoked", false)
    .maybeSingle();

  const row = {
    org_id: org.id,
    user_id: ctx.user.id,
    programme_id: programmeId,
    pathway_pct: learning.gate.sessionsTotal
      ? Math.round((learning.gate.sessionsDone / learning.gate.sessionsTotal) * 100)
      : 0,
    lessons_completed: learning.gate.sessionsDone,
    pre_overall: pre?.overall ?? null,
    post_overall: post?.overall ?? null,
    growth: pre && post ? Math.round((Number(post.overall) - Number(pre.overall)) * 10) / 10 : null,
    certificate_id: cert?.id ?? null,
    face_scores: faceScores,
    pulse_count: Math.max(0, Math.min(1000, Number(body.pulseCount) || 0)),
    pulse_consistency: Math.max(0, Math.min(100, Number(body.pulseConsistency) || 0)),
    last_pulse_at: typeof body.lastPulseAt === "string" ? body.lastPulseAt : null,
    pulse_window_days: 28,
    client_updated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await ctx.admin
    .from("org_progress_snapshots")
    .upsert(row, { onConflict: "org_id,user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
