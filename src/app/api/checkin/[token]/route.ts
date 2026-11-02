import { NextResponse } from "next/server";
import { constructs } from "@/lib/content";
import { createAdminClient } from "@/lib/supabase/admin";
import { faceTagline } from "@/lib/lms/face-taglines";
import { scoreFaces, validateFaceResponses } from "@/lib/lms/checkin";
import { findCheckin } from "@/lib/lms/server/checkin";
import { limitRequest } from "@/lib/server/rate-limit";

type Params = { params: Promise<{ token: string }> };

/** Public rater endpoint. The single-use link is the credential. */
export async function GET(request: Request, { params }: Params) {
  const limited = await limitRequest(request, "checkin-rater");
  if (limited) return limited;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { token } = await params;
  const invite = await findCheckin(admin, token);
  if (!invite) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invite.completed) return NextResponse.json({ error: "already_completed" }, { status: 410 });
  if (invite.expired) return NextResponse.json({ error: "expired" }, { status: 410 });
  return NextResponse.json({
    ok: true,
    firstName: invite.firstName,
    relationship: invite.relationship,
    locale: invite.locale,
    faces: constructs.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      tagline: faceTagline(c.id, "adults"),
    })),
  });
}

export async function POST(request: Request, { params }: Params) {
  const limited = await limitRequest(request, "checkin-rater");
  if (limited) return limited;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const { token } = await params;
  const invite = await findCheckin(admin, token);
  if (!invite) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invite.completed || invite.expired) return NextResponse.json({ error: invite.completed ? "already_completed" : "expired" }, { status: 410 });
  const body = (await request.json().catch(() => ({}))) as { responses?: unknown };
  const parsed = validateFaceResponses(body.responses);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const faceScores = scoreFaces(parsed.responses);
  const { error } = await admin.from("checkin_responses").insert({
    invite_id: invite.id,
    responses: parsed.responses,
    face_scores: faceScores,
  });
  if (error) {
    const dup = /duplicate key|unique/i.test(error.message);
    return NextResponse.json({ error: dup ? "already_completed" : "save_failed" }, { status: dup ? 410 : 500 });
  }
  await admin.from("checkin_invites").update({ completed_at: new Date().toISOString() }).eq("id", invite.id);
  return NextResponse.json({ ok: true });
}
