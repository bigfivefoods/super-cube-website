import { NextResponse } from "next/server";
import { recordActivitySafe } from "@/lib/lms/server/engagement";
import { parseAttempt, recordAttempt, type AttemptMetaInput } from "@/lib/lms/server/attempts";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { loadLearning } from "@/lib/lms/server/learning";
import { isInstrumentV2EnabledServer, versionOf, type InstrumentVersion } from "@/lib/lms/instruments";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { limitRequest } from "@/lib/server/rate-limit";

/**
 * Submit an assessment. Scoring happens HERE, never in the browser.
 *  - pre:  once per programme; a retake returns 409 with the locked baseline.
 *  - mid:  needs a baseline; history kept.
 *  - post: needs baseline + full access + the time/sessions gate; once only.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "attempts", [`user:${ctx.user.id}`]);
  if (limited) return limited;

  let body: { phase?: string; programmeId?: string; responses?: Record<string, unknown>; meta?: AttemptMetaInput };
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

  const learning = await loadLearning(ctx.admin, ctx.user.id, programmeId);
  const pre = learning.attempts.find((a) => a.phase === "pre");

  // Instrument version: a new baseline uses v1 (research form) unless v2 is
  // switched on AND requested. Re-measures always use the baseline's version,
  // so pre and post stay comparable.
  let version: InstrumentVersion = "v1";
  if (pre) {
    version = versionOf(pre.instrument_id);
  } else if (body.meta?.instrument === "v2") {
    if (!isInstrumentV2EnabledServer()) {
      return NextResponse.json({ error: "instrument_v2_disabled" }, { status: 400 });
    }
    version = "v2";
  }

  // Validate every item (in range, none missing) and work out data-quality flags
  const parsed = parseAttempt(programmeId, body.responses, body.meta ?? {}, version);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, itemId: parsed.itemId }, { status: 400 });
  }

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

  const saved = await recordAttempt(ctx.admin, {
    userId: ctx.user.id,
    programmeId,
    phase,
    parsed: parsed.value,
    source: "live",
  });
  if (!saved.ok) {
    const locked = /duplicate key|unique/i.test(saved.error);
    return NextResponse.json(
      { error: locked ? `${phase}_locked` : saved.error },
      { status: locked ? 409 : 500 },
    );
  }
  const engagement = await recordActivitySafe(ctx.admin, ctx.user.id, { kind: "assessment", ref: phase, programmeId });
  return NextResponse.json({ ok: true, attempt: saved.attempt, engagement });
}
