import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { eventsInLastDay, MAX_EVENTS_PER_DAY, recordActivity } from "@/lib/lms/server/engagement";
import { getProgramme } from "@/lib/programmes";
import { limitRequest } from "@/lib/server/rate-limit";

/**
 * Habit ticks from the browser: a daily check-in (pulse) or a micro-practice.
 * Sessions and assessments are recorded by their own routes, never from here.
 */
const KINDS = new Set(["pulse", "practice_complete"]);
const REF_RE = /^[a-z0-9][a-z0-9-]{0,63}$/i;

export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "events", [`user:${ctx.user.id}`]);
  if (limited) return limited;
  const body = (await request.json().catch(() => ({}))) as { kind?: string; ref?: string; programmeId?: string };
  const kind = String(body.kind || "");
  if (!KINDS.has(kind)) return NextResponse.json({ error: "Unsupported activity" }, { status: 400 });
  const ref = body.ref == null || body.ref === "" ? null : String(body.ref);
  if (ref && !REF_RE.test(ref)) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  const programme = body.programmeId ? getProgramme(String(body.programmeId)) : undefined;

  if ((await eventsInLastDay(ctx.admin, ctx.user.id)) >= MAX_EVENTS_PER_DAY) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "3600" } });
  }
  try {
    const result = await recordActivity(ctx.admin, ctx.user.id, {
      kind: kind as "pulse" | "practice_complete",
      ref,
      programmeId: programme?.id ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[lms] event failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not record activity" }, { status: 500 });
  }
}
