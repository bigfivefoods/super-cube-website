import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { emailSiteUrl, isProgrammeId } from "@/lib/email/layout";
import { verifiedRecipient } from "@/lib/email/recipient";
import { welcomeEmail } from "@/lib/email/templates";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { limitRequest } from "@/lib/server/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Welcome email for the signed-in learner (free demo, or paid when the
 * server confirms paid access).
 *
 * Locked down: the recipient is always the session user's own confirmed
 * email; any "email" in the body is ignored. Signed-out callers get 401.
 * Every other outcome (sent, skipped, provider error) returns the same
 * { ok: true } so the route can't be used to probe accounts or providers.
 * Rate limited per IP and per account.
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

  const limited = await limitRequest(request, "email-welcome", [`user:${to.userId}`]);
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as { programmeId?: unknown; mode?: unknown };
  const programmeId = isProgrammeId(body.programmeId) ? body.programmeId : "adults";

  let mode: "demo" | "purchase" = "demo";
  if (body.mode === "purchase") {
    const admin = createAdminClient();
    if (admin && isEntitled(await getServerEntitlement(admin, to.userId).catch(() => ({ tier: "none" as const })))) {
      mode = "purchase";
    }
  }

  const site = emailSiteUrl();
  const email = welcomeEmail({ name: to.name, programmeId, mode, site });
  const result = await sendEmail({
    to: to.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: ["welcome", mode],
  });
  if (!result.ok) console.error("[email/welcome] send failed", result.provider);
  return NextResponse.json({ ok: true });
}
