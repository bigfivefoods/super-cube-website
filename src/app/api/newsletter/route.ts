import { NextResponse } from "next/server";
import { isNonProductionDeploy } from "@/lib/deploy-env";

type Body = {
  email?: string;
  name?: string;
  consent?: boolean;
  source?: string;
  /** Honeypot: real users never fill this. */
  website?: string;
};

/**
 * Newsletter signup (POPIA: explicit opt-in checkbox required).
 *
 * Provider is chosen by NEWSLETTER_PROVIDER:
 *   - "brevo"   → adds the contact to BREVO_LIST_ID via BREVO_API_KEY
 *   - "webhook" → POSTs the signup to NEWSLETTER_WEBHOOK_URL (Zapier/Make/CRM)
 *   - "log" (default, or anything else) → structured server log only
 *
 * Preview / development deployments always log only, so nothing submitted on
 * a preview reaches a real mailing list. No Supabase dependency.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const name = String(body.name ?? "").trim().slice(0, 120);
  const source = String(body.source ?? "unknown").trim().slice(0, 40);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Please tick the consent box so we may email you." },
      { status: 400 }
    );
  }

  const signup = {
    email,
    name,
    source: `super-cube.me/${source}`,
    consent: true,
    consentText:
      "I agree that Super-Cube® may email me leadership tips and programme updates. I can unsubscribe at any time.",
    consentAt: new Date().toISOString(),
  };

  const preview = isNonProductionDeploy();
  const provider = preview
    ? "log"
    : (process.env.NEWSLETTER_PROVIDER || "log").trim().toLowerCase();

  try {
    if (provider === "brevo") {
      const key = process.env.BREVO_API_KEY?.trim();
      const listId = Number(process.env.BREVO_LIST_ID);
      if (!key || !listId) throw new Error("Brevo not configured");
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          attributes: {
            FIRSTNAME: name || undefined,
            SOURCE: signup.source,
            CONSENT_AT: signup.consentAt,
          },
          listIds: [listId],
          updateEnabled: true,
        }),
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Brevo ${res.status}`);
      }
    } else if (provider === "webhook") {
      const url = process.env.NEWSLETTER_WEBHOOK_URL?.trim();
      if (!url) throw new Error("NEWSLETTER_WEBHOOK_URL not set");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
    } else {
      console.info(
        preview ? "[newsletter][preview: not forwarded]" : "[newsletter]",
        JSON.stringify(signup)
      );
    }
  } catch (e) {
    // Never lose a consented signup: fall back to the log.
    console.error(
      "[newsletter][provider failed, logged instead]",
      e instanceof Error ? e.message : e,
      JSON.stringify(signup)
    );
  }

  return NextResponse.json({ ok: true });
}
