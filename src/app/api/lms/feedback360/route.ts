import { NextResponse } from "next/server";
import { is360EnabledServer } from "@/lib/lms/feedback360";
import { requireUser } from "@/lib/lms/server/context";
import { createFeedbackRequest, loadFeedbackSummary, parseRaters } from "@/lib/lms/server/feedback360";
import { limitRequest } from "@/lib/server/rate-limit";
import { isMinorLearner } from "@/lib/lms/server/share-links";

/** 360 feedback for the signed-in learner (behind LMS_360=on). Adults only for now. */
export async function GET() {
  if (!is360EnabledServer()) return NextResponse.json({ error: "not_enabled" }, { status: 404 });
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const requests = await loadFeedbackSummary(ctx.admin, ctx.user.id);
  return NextResponse.json({ ok: true, requests });
}

export async function POST(request: Request) {
  if (!is360EnabledServer()) return NextResponse.json({ error: "not_enabled" }, { status: 404 });
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "feedback360-create", [`user:${ctx.user.id}`]);
  if (limited) return limited;
  // Adults only: learners marked under 18 (profile or guardian consent) cannot invite raters
  if (await isMinorLearner(ctx.admin, ctx.user.id)) return NextResponse.json({ error: "adults_only" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { raters?: unknown };
  const raters = parseRaters(body.raters);
  if (!raters) return NextResponse.json({ error: "Give 1 to 12 raters, each a manager, peer, direct report or other" }, { status: 400 });
  // One open request at a time keeps invitations manageable
  const existing = await loadFeedbackSummary(ctx.admin, ctx.user.id);
  const open = existing.find((r) => !r.closesAt || Date.parse(r.closesAt) > Date.now());
  if (open) return NextResponse.json({ error: "open_request_exists", requestId: open.id }, { status: 409 });
  const created = await createFeedbackRequest(ctx.admin, ctx.user.id, "adults", raters);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 500 });
  return NextResponse.json({ ok: true, requestId: created.request.id, links: created.links });
}
