import { isNonProductionDeploy } from "@/lib/deploy-env";
import { CONSENT_TEXT } from "@/lib/newsletter/db";

/**
 * Optional copy of a CONFIRMED subscriber to an outside list (production only),
 * chosen by NEWSLETTER_PROVIDER:
 *   - "brevo"   → adds the contact to BREVO_LIST_ID via BREVO_API_KEY
 *   - "webhook" → POSTs the signup to NEWSLETTER_WEBHOOK_URL (Zapier/Make/CRM)
 *   - "log" (default) → nothing extra; Supabase is the list.
 * Never throws: Supabase stays the source of truth.
 */
export async function forwardConfirmedSubscriber(email: string): Promise<void> {
  if (isNonProductionDeploy()) return;
  const provider = (process.env.NEWSLETTER_PROVIDER || "log").trim().toLowerCase();
  const signup = { email, source: "super-cube.me", consent: true, consentText: CONSENT_TEXT, confirmedAt: new Date().toISOString() };
  try {
    if (provider === "brevo") {
      const key = process.env.BREVO_API_KEY?.trim();
      const listId = Number(process.env.BREVO_LIST_ID);
      if (!key || !listId) throw new Error("Brevo not configured");
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ email, attributes: { SOURCE: signup.source, CONSENT_AT: signup.confirmedAt }, listIds: [listId], updateEnabled: true }),
      });
      if (!res.ok && res.status !== 204) throw new Error(`Brevo ${res.status}`);
    } else if (provider === "webhook") {
      const url = process.env.NEWSLETTER_WEBHOOK_URL?.trim();
      if (!url) throw new Error("NEWSLETTER_WEBHOOK_URL not set");
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
    }
  } catch (e) {
    console.error("[newsletter] provider forward failed", e instanceof Error ? e.message : e);
  }
}
