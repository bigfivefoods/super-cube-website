import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { sendEmail } from "@/lib/email";
import { emailSiteUrl } from "@/lib/email/layout";
import { checkinInviteEmail } from "@/lib/email/templates";
import { parseInvites } from "@/lib/lms/checkin";
import { requireUser } from "@/lib/lms/server/context";
import { createCheckinInvites, deleteCheckinInvite, loadCheckinSummary } from "@/lib/lms/server/checkin";
import { isMinorLearner } from "@/lib/lms/server/share-links";
import type { ProgrammeId } from "@/lib/programmes";
import { limitRequest } from "@/lib/server/rate-limit";

function programmeOf(raw: unknown): ProgrammeId {
  return raw === "kids" || raw === "adolescents" || raw === "adults" ? raw : "adults";
}

/** The signed-in learner's manager and peer check-ins. Aggregates only. */
export async function GET() {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: "sign_in" }, { status: ctx.status });
  if (await isMinorLearner(ctx.admin, ctx.user.id)) return NextResponse.json({ error: "adults_only" }, { status: 403 });
  const summary = await loadCheckinSummary(ctx.admin, ctx.user.id);
  if (!summary.ok) {
    const notReady = /checkin_invites|does not exist|schema cache/i.test(summary.error);
    return NextResponse.json({ error: notReady ? "not_ready" : "unavailable" }, { status: notReady ? 503 : 500 });
  }
  return NextResponse.json(summary, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: "sign_in" }, { status: ctx.status });
  const limited = await limitRequest(request, "checkin-create", [`user:${ctx.user.id}`]);
  if (limited) return limited;
  if (await isMinorLearner(ctx.admin, ctx.user.id)) return NextResponse.json({ error: "adults_only" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { invites?: unknown; programmeId?: unknown; locale?: unknown };
  const invites = parseInvites(body.invites);
  if (!invites) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const programmeId = programmeOf(body.programmeId);
  if (programmeId !== "adults") return NextResponse.json({ error: "adults_only" }, { status: 403 });
  const locale = isLocale(String(body.locale ?? "")) ? String(body.locale) : "en";

  const { data: profile } = await ctx.admin.from("profiles").select("full_name").eq("id", ctx.user.id).maybeSingle();
  const learnerName = String((profile as { full_name?: string } | null)?.full_name ?? "").trim() || null;

  const created = await createCheckinInvites(ctx.admin, ctx.user.id, ctx.user.email ?? null, programmeId, locale, invites);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: created.error === "not_ready" ? 503 : 400 });

  const site = emailSiteUrl();
  let sent = 0;
  let failed = 0;
  for (const invite of created.created) {
    const url = `${site}/feedback/checkin/${invite.token}`;
    const mail = checkinInviteEmail({
      site,
      learnerName,
      relationship: invite.relationship,
      url,
      locale,
    });
    const result = await sendEmail({ to: invite.email, subject: mail.subject, html: mail.html, text: mail.text, tags: ["checkin_invite"] });
    if (!result.ok) {
      failed += 1;
      await deleteCheckinInvite(ctx.admin, invite.id);
    } else {
      sent += 1;
    }
  }
  if (sent === 0) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  return NextResponse.json({ ok: true, sent, failed });
}
