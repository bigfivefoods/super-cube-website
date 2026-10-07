/**
 * Transactional email helper.
 * Providers (first match wins):
 *  1. RESEND_API_KEY → Resend API
 *  2. CONTACT_WEBHOOK / EMAIL_WEBHOOK → generic POST
 *  3. Console log (dev / missing keys)
 */

import { welcomeEmail } from "@/lib/email/templates";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
  /** Extra headers (e.g. List-Unsubscribe for newsletters). */
  headers?: Record<string, string>;
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
          ...(payload.headers ? { headers: payload.headers } : {}),
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

/**
 * Branded templates live in src/lib/email/ (layout.ts = shared shell and
 * components, templates.ts = every email the site sends). Kept for callers
 * that still import the old helper.
 */
export function welcomeEmailHtml(opts: {
  name: string;
  programmeName?: string;
  programmeId?: string;
  continueUrl: string;
  mode: "demo" | "purchase";
}) {
  return welcomeEmail({
    name: opts.name,
    programmeId: opts.programmeId ?? "adults",
    continueUrl: opts.continueUrl,
    mode: opts.mode,
  }).html;
}
