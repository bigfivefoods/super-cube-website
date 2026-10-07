"use server";

import { audit, requireLmsAdmin } from "@/lib/admin/auth";
import { sendEmail } from "@/lib/email";
import { MAIN_SAMPLES, sampleEmail } from "@/lib/email/samples";
import { hit } from "@/lib/server/rate-limit";

export type EmailTestState = { ok?: boolean; error?: string; message?: string } | undefined;

/**
 * Send the main email templates (sample data) to the signed-in admin's own
 * address. Never takes a recipient from the form.
 */
export async function sendTestEmailsAction(): Promise<EmailTestState> {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return { error: "Your admin session has ended. Sign in again." };
  const rl = await hit("email-admin-test", [`admin:${ctx.email}`]);
  if (!rl.allowed) return { error: "Test emails were sent recently. Try again in an hour." };
  let sent = 0;
  for (const id of MAIN_SAMPLES) {
    const e = sampleEmail(id, { to: ctx.email });
    const r = await sendEmail({
      to: ctx.email,
      subject: `[Test] ${e.subject}`,
      html: e.html,
      text: e.text,
      tags: ["template-test"],
    });
    if (r.ok) sent++;
    else console.error("[admin] test email failed", id, r.provider);
  }
  await audit(ctx.db, ctx.email, "email.test_set", "email", null, { templates: MAIN_SAMPLES, sent });
  return sent === MAIN_SAMPLES.length
    ? { ok: true, message: `Sent ${sent} test emails to ${ctx.email}.` }
    : { error: `Sent ${sent} of ${MAIN_SAMPLES.length} test emails. Check the email provider logs.` };
}
