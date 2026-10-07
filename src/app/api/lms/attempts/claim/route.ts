import { NextResponse } from "next/server";
import { awardBadges } from "@/lib/lms/server/engagement";
import { parseAttempt, recordAttempt, type AttemptMetaInput } from "@/lib/lms/server/attempts";
import { requireUser } from "@/lib/lms/server/context";
import { loadLearning } from "@/lib/lms/server/learning";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { limitRequest } from "@/lib/server/rate-limit";

const DAY = 86_400_000;
/** Oldest signed-out baseline we accept, so a stale device can't backdate the 21-day gate far. */
const MAX_AGE_DAYS = 180;

/**
 * Claim a baseline taken while signed out (stored on this device) for the
 * signed-in account. First one wins: if the account already has a baseline,
 * that one stays and is returned. The server re-scores the answers; the
 * original completion time is kept (clamped) so the 21-day gate stays honest.
 * This closes the "take it anonymously, then sign up and retake" loophole.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "attempts-claim", [`user:${ctx.user.id}`]);
  if (limited) return limited;

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

  const parsed = parseAttempt(programmeId, body.responses, body.meta ?? {});
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, itemId: parsed.itemId }, { status: 400 });

  const now = Date.now();
  const t = Date.parse(String(body.completedAt || ""));
  const createdAt = new Date(
    Number.isFinite(t) ? Math.min(now, Math.max(now - MAX_AGE_DAYS * DAY, t)) : now,
  ).toISOString();

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
