import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { is360EnabledServer, scoreObserver, validateObserverResponses } from "@/lib/lms/feedback360";
import { findRater } from "@/lib/lms/server/feedback360";
import { limitRequest } from "@/lib/server/rate-limit";

type Params = { params: Promise<{ token: string }> };

/** Public rater endpoint: the link itself is the credential (single use, hashed at rest). */
export async function GET(request: Request, { params }: Params) {
  if (!is360EnabledServer()) return NextResponse.json({ error: "not_enabled" }, { status: 404 });
  const limited = await limitRequest(request, "feedback360-rater");
  if (limited) return limited;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { token } = await params;
  const r = await findRater(admin, token);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.completed) return NextResponse.json({ error: "already_completed" }, { status: 410 });
  if (r.closed) return NextResponse.json({ error: "closed" }, { status: 410 });
  return NextResponse.json({ ok: true, firstName: r.firstName, relationship: r.relationship, items: r.items });
}

export async function POST(request: Request, { params }: Params) {
  if (!is360EnabledServer()) return NextResponse.json({ error: "not_enabled" }, { status: 404 });
  const limited = await limitRequest(request, "feedback360-rater");
  if (limited) return limited;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { token } = await params;
  const r = await findRater(admin, token);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.completed || r.closed) return NextResponse.json({ error: "closed" }, { status: 410 });
  const body = (await request.json().catch(() => ({}))) as { responses?: unknown };
  const v = validateObserverResponses(r.items, body.responses);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const scores = scoreObserver(r.items, v.responses);
  const { error } = await admin
    .from("feedback_responses")
    .insert({ rater_id: r.raterId, responses: v.responses, construct_scores: scores });
  if (error) {
    const dup = /duplicate key|unique/i.test(error.message);
    return NextResponse.json({ error: dup ? "already_completed" : "save_failed" }, { status: dup ? 410 : 500 });
  }
  await admin.from("feedback_raters").update({ completed_at: new Date().toISOString() }).eq("id", r.raterId);
  return NextResponse.json({ ok: true });
}
