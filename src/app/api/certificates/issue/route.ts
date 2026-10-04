import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { loadLearning } from "@/lib/lms/server/learning";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

function newCertificateId(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `SC-${d}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * Issue (or return) the learner's certificate. Scores come from the server's own
 * attempts; the browser only supplies the display name. Idempotent per programme.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = (await request.json().catch(() => ({}))) as {
    programmeId?: string;
    learnerName?: string;
    orgCode?: string;
  };
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const programmeId = programme.id as ProgrammeId;

  const { data: existing } = await ctx.admin
    .from("certificates")
    .select("id, learner_name, programme_id, pre_overall, post_overall, growth, issued_at")
    .eq("user_id", ctx.user.id)
    .eq("programme_id", programmeId)
    .eq("revoked", false)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, certificate: existing, existing: true });

  const ent = await getServerEntitlement(ctx.admin, ctx.user.id);
  if (!isEntitled(ent)) return NextResponse.json({ error: "payment_required" }, { status: 402 });

  const learning = await loadLearning(ctx.admin, ctx.user.id, programmeId);
  const pre = learning.attempts.find((a) => a.phase === "pre");
  const post = learning.attempts.find((a) => a.phase === "post");
  if (!pre || !post) {
    return NextResponse.json(
      { error: "not_eligible", message: "A certificate needs a locked baseline and a gated after-test." },
      { status: 403 },
    );
  }

  const name =
    String(body.learnerName || "")
      .replace(/[\u0000-\u001f<>]/g, "")
      .trim()
      .slice(0, 120) ||
    ctx.user.email ||
    "Learner";
  const growth = Math.round((Number(post.overall) - Number(pre.overall)) * 10) / 10;

  for (let i = 0; i < 3; i++) {
    const row = {
      id: newCertificateId(),
      user_id: ctx.user.id,
      learner_name: name,
      programme_id: programmeId,
      pre_overall: pre.overall,
      post_overall: post.overall,
      growth,
      pre_attempt_id: pre.id,
      post_attempt_id: post.id,
      org_code: body.orgCode ? String(body.orgCode).toUpperCase().slice(0, 24) : null,
      issued_at: new Date().toISOString(),
      meta: { issuer: "super-cube.me", scoring: "server", instrument: post.instrument_id },
    };
    const { data, error } = await ctx.admin
      .from("certificates")
      .insert(row)
      .select("id, learner_name, programme_id, pre_overall, post_overall, growth, issued_at")
      .single();
    if (!error) return NextResponse.json({ ok: true, certificate: data });
    if (!/duplicate key/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Could not allocate certificate id" }, { status: 500 });
}
