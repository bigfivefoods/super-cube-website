import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isNonProductionDeploy } from "@/lib/deploy-env";
import { CONSENT_TEXT, NEWSLETTER_TABLE, newsletterDb } from "@/lib/newsletter/db";

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
 * Primary store: Supabase table public.newsletter_subscribers (service role,
 * server-only; RLS on with no public policies). Used on preview and
 * production whenever the Supabase URL + service key are configured.
 *
 * Optional extra forwarding (production only), chosen by NEWSLETTER_PROVIDER:
 *   - "brevo"   → adds the contact to BREVO_LIST_ID via BREVO_API_KEY
 *   - "webhook" → POSTs the signup to NEWSLETTER_WEBHOOK_URL (Zapier/Make/CRM)
 *   - "log" (default, or anything else) → structured server log only
 *
 * Preview / development deployments never forward to Brevo/webhook.
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
    consentText: CONSENT_TEXT,
    consentAt: new Date().toISOString(),
  };

  // 1. Durable store (Supabase)
  let stored = false;
  const db = newsletterDb();
  if (db) {
    const salt = process.env.NEWSLETTER_IP_SALT?.trim();
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const ipHash =
      salt && ip ? createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24) : null;
    const ins = await db.from(NEWSLETTER_TABLE).insert({
      email,
      source: signup.source,
      consent_text: CONSENT_TEXT,
      consent_at: signup.consentAt,
      ip_hash: ipHash,
    });
    if (!ins.error) {
      stored = true;
    } else if (ins.error.code === "23505") {
      // Already on the list: refresh consent and re-subscribe if they had left.
      const upd = await db
        .from(NEWSLETTER_TABLE)
        .update({
          consent_text: CONSENT_TEXT,
          consent_at: signup.consentAt,
          unsubscribed_at: null,
          updated_at: signup.consentAt,
        })
        .eq("email", email);
      stored = !upd.error;
      if (upd.error) console.error("[newsletter] update failed", upd.error.message);
    } else {
      console.error("[newsletter] insert failed", ins.error.code, ins.error.message);
    }
  }

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
    } else if (!stored) {
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

  return NextResponse.json({ ok: true, stored });
}
