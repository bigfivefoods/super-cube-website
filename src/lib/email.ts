/**
 * Transactional email helper.
 * Providers (first match wins):
 *  1. RESEND_API_KEY → Resend API
 *  2. CONTACT_WEBHOOK / EMAIL_WEBHOOK → generic POST
 *  3. Console log (dev / missing keys)
 */

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
};

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; provider: string; error?: string }> {
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    "Super-Cube® Learn <onboarding@super-cube.me>";

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          tags: payload.tags?.map((name) => ({ name, value: "true" })),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, provider: "resend", error: err.slice(0, 300) };
      }
      return { ok: true, provider: "resend" };
    } catch (e) {
      return {
        ok: false,
        provider: "resend",
        error: e instanceof Error ? e.message : "resend failed",
      };
    }
  }

  const webhook =
    process.env.EMAIL_WEBHOOK ||
    process.env.CONTACT_WEBHOOK ||
    process.env.NEXT_PUBLIC_CONTACT_WEBHOOK ||
    "";

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          from,
          ...payload,
          sentAt: new Date().toISOString(),
        }),
      });
      return { ok: true, provider: "webhook" };
    } catch (e) {
      return {
        ok: false,
        provider: "webhook",
        error: e instanceof Error ? e.message : "webhook failed",
      };
    }
  }

  console.info("[email:dev]", payload.subject, "→", payload.to);
  return { ok: true, provider: "console" };
}

export function welcomeEmailHtml(opts: {
  name: string;
  programmeName: string;
  continueUrl: string;
  mode: "demo" | "purchase";
}) {
  const headline =
    opts.mode === "purchase"
      ? "You're in — your Super-Cube® pathway is unlocked."
      : "Welcome — your free Super-Cube® demo is ready.";
  return `<!DOCTYPE html><html><body style="font-family:Inter,system-ui,sans-serif;color:#0a0a0a;line-height:1.5">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a">Super-Cube® Learn</p>
    <h1 style="font-size:22px;font-weight:600;letter-spacing:-.03em">${headline}</h1>
    <p>Hi ${opts.name || "there"},</p>
    <p>You're on the <strong>${opts.programmeName}</strong> pathway. Leadership capacity grows through deliberate practice—not binge content.</p>
    <p style="margin:28px 0"><a href="${opts.continueUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px">Continue learning →</a></p>
    <ol style="color:#5c5c5c;font-size:14px;padding-left:18px">
      <li>Orient (pre-pre)</li>
      <li>Baseline assessment</li>
      <li>Six faces · Read · Engage · Apply</li>
      <li>Re-measure &amp; download your growth report</li>
    </ol>
    <p style="font-size:13px;color:#8a8a8a">Questions? Reply to this email or write hello@super-cube.me</p>
  </div></body></html>`;
}
