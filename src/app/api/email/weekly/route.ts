import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { emailSiteUrl, isProgrammeId } from "@/lib/email/layout";
import { sameSiteUrl, verifiedRecipient } from "@/lib/email/recipient";
import { weeklyEmail } from "@/lib/email/templates";
import { limitRequest } from "@/lib/server/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * Weekly review email for the signed-in learner.
 * Body: { weekLabel?, summary?, weakest?, programmeId?, planUrl? }
 *
 * Locked down like /api/email/welcome: only ever sent to the session user's
 * own confirmed email (body "email" is ignored), plan links must stay on the
 * site, signed-out callers get 401, everything else returns { ok: true }.
 */
export async function POST(request: Request) {
  const ipLimited = await limitRequest(request, "email-ip");
  if (ipLimited) return ipLimited;

  const supabase = await createClient();
  const user = supabase
    ? await supabase.auth
        .getUser()
        .then((r) => r.data.user)
        .catch(() => null)
    : null;
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const to = verifiedRecipient(user);
  if (!to) return NextResponse.json({ ok: true });

  const limited = await limitRequest(request, "email-weekly", [`user:${to.userId}`]);
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const clean = (v: unknown, max: number) =>
    String(v ?? "")
      .replace(/[\u0000-\u001f]/g, " ")
      .trim()
      .slice(0, max);
  const site = emailSiteUrl();
  const email = weeklyEmail({
    site,
    name: to.name,
    weekLabel: clean(body.weekLabel, 60) || "This week",
    summary: clean(body.summary, 400) || undefined,
    focus: clean(body.weakest, 160) || undefined,
    programmeId: isProgrammeId(body.programmeId) ? body.programmeId : null,
    planUrl: sameSiteUrl(body.planUrl, site, `${site}/learn`),
  });

  const result = await sendEmail({
    to: to.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: ["weekly-review"],
  });
  if (!result.ok) console.error("[email/weekly] send failed", result.provider);
  return NextResponse.json({ ok: true });
}
