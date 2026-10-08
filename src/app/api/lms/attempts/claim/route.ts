import { NextResponse } from "next/server";
import { baselineRecordedAt } from "@/lib/lms/gates";
import { awardBadges } from "@/lib/lms/server/engagement";
import { parseAttempt, recordAttempt, type AttemptMetaInput } from "@/lib/lms/server/attempts";
import { requireUser } from "@/lib/lms/server/context";
import { guardianConsentBlock } from "@/lib/lms/server/guardian-gate";
import { loadLearning } from "@/lib/lms/server/learning";
import { isInstrumentV2EnabledServer, versionOfResponses } from "@/lib/lms/instruments";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { limitRequest } from "@/lib/server/rate-limit";

/**
 * Claim a baseline taken while signed out (stored on this device) for the
 * signed-in account. First one wins: if the account already has a baseline,
 * that one stays and is returned. The server re-scores the answers. The
 * stored time is the server clock unless the device time is only a small
 * clock skew away, so a backdated claim cannot open the after-test.
 * This closes the "take it anonymously, then sign up and retake" loophole.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "attempts-claim", [`user:${ctx.user.id}`]);
  if (limited) return limited;
  const blocked = await guardianConsentBlock(ctx.admin, ctx.user.id);
  if (blocked) return blocked;

  let body: { programmeId?: string; responses?: Record<string, unknown>; completedAt?: string; meta?: AttemptMetaInput };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const programmeId = programme.id as ProgrammeId;

  const learning = await loadLearning(ctx.admin, ctx.user.id, programmeId);
  const existing = learning.attempts.find((a) => a.phase === "pre");
  if (existing) {
    return NextResponse.json({
      ok: true,
      claimed: false,
      attempt: {
        id: existing.id,
        phase: "pre",
        programmeId,
        overall: Number(existing.overall),
        constructScores: existing.construct_scores,
        responses: existing.responses,
        completedAt: existing.created_at,
      },
    });
  }

  // The device's answers say which instrument they used. v2 is only accepted while it is switched on.
  const version = versionOfResponses(body.responses);
  if (version === "v2" && !isInstrumentV2EnabledServer()) {
    return NextResponse.json({ error: "instrument_v2_disabled" }, { status: 400 });
  }
  const parsed = parseAttempt(programmeId, body.responses, body.meta ?? {}, version);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, itemId: parsed.itemId }, { status: 400 });

  const createdAt = baselineRecordedAt(body.completedAt);

  const saved = await recordAttempt(ctx.admin, {
    userId: ctx.user.id,
    programmeId,
    phase: "pre",
    parsed: parsed.value,
    source: "claimed_device",
    createdAt,
  });
  if (!saved.ok) {
    // Lost a race with another device: return whatever is now locked in
    if (/duplicate key|unique/i.test(saved.error)) {
      const again = await loadLearning(ctx.admin, ctx.user.id, programmeId);
      const pre = again.attempts.find((a) => a.phase === "pre");
      if (pre) {
        return NextResponse.json({
          ok: true,
          claimed: false,
          attempt: { id: pre.id, phase: "pre", programmeId, overall: Number(pre.overall), constructScores: pre.construct_scores, responses: pre.responses, completedAt: pre.created_at },
        });
      }
    }
    return NextResponse.json({ error: saved.error }, { status: 500 });
  }
  // A claimed baseline earns its badge; it doesn't tick today's streak (it may be from another day)
  await awardBadges(ctx.admin, ctx.user.id).catch(() => []);
  return NextResponse.json({ ok: true, claimed: true, attempt: saved.attempt });
}
