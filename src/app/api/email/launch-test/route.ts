import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { MAIN_SAMPLES, sampleEmail } from "@/lib/email/samples";
import { adminEmails } from "@/lib/newsletter/admin-auth";
import { hit } from "@/lib/server/rate-limit";

/**
 * TEMPORARY one-shot: sends the four main templates (sample data) once, to
 * the site owner only, so the redesign can be checked in real inboxes.
 *  - the recipient is fixed (and must be on the admin list); nothing in the
 *    request can change it;
 *  - at most one send per day site-wide (shared rate-limit counter);
 *  - switches itself off at EXPIRES (404) and is removed in a follow-up PR.
 * The permanent way to do this is "Send me the test set" on /admin.
 */
const RECIPIENT = "craig@bigfivegroup.africa";
const EXPIRES = Date.parse("2026-10-08T22:00:00Z");

export async function POST() {
  if (Date.now() > EXPIRES || !adminEmails().includes(RECIPIENT)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const first = await hit("email-launch-test", ["global"]);
  if (!first.allowed) return NextResponse.json({ ok: true, sent: 0 });
  let sent = 0;
  for (const id of MAIN_SAMPLES) {
    const e = sampleEmail(id, { to: RECIPIENT });
    const r = await sendEmail({
      to: RECIPIENT,
      subject: `[Test] ${e.subject}`,
      html: e.html,
      text: e.text,
      tags: ["template-test"],
    });
    if (r.ok) sent++;
    else console.error("[email/launch-test] send failed", id, r.provider);
  }
  return NextResponse.json({ ok: true, sent });
}
