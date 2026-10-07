import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { confirmUrl } from "@/lib/newsletter/confirm";
import { CONSENT_TEXT, NEWSLETTER_TABLE, newsletterDb, siteOrigin } from "@/lib/newsletter/db";
import { confirmationEmail } from "@/lib/newsletter/emails";
import { hit, limitRequest } from "@/lib/server/rate-limit";

type Body = {
  email?: string;
  consent?: boolean;
  source?: string;
  /** Honeypot: real users never fill this. */
  website?: string;
};

/** Don't resend a confirmation to the same address more often than this. */
const RESEND_AFTER_MS = 10 * 60_000;

/**
 * Newsletter signup with double opt-in (POPIA: explicit consent checkbox, then a
 * confirmation link by email). Rows live in public.newsletter_subscribers
 * (service role only; RLS on, no public policies). A subscriber receives
 * campaigns only once confirmed_at is set (see /newsletter/confirm).
 *
 * The response is the same whether the address is new, pending or already
 * confirmed, so the form can't be used to find out who is subscribed.
 * Optional forwarding to Brevo / a webhook happens on confirmation, not here.
 */
export async function POST(req: Request) {
  const limited = await limitRequest(req, "newsletter");
  if (limited) return limited;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const source = String(body.source ?? "unknown").trim().slice(0, 40);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please tick the consent box so we may email you." }, { status: 400 });
  }

  const db = newsletterDb();
  if (!db) {
    console.error("[newsletter] store not configured; signup not saved");
    return NextResponse.json({ error: "Signups are paused right now. Please try again later." }, { status: 503 });
  }

  // At most a few confirmation emails per address per hour, whoever asks.
  const perEmail = await hit("newsletter-email", [`email:${email}`]);
  if (!perEmail.allowed) return NextResponse.json({ ok: true, pending: true });

  const now = new Date();
  const nowIso = now.toISOString();
  const salt = process.env.NEWSLETTER_IP_SALT?.trim();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ipHash = salt && ip ? createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24) : null;

  const { data: existing, error: readErr } = await db
    .from(NEWSLETTER_TABLE)
    .select("id,confirmed_at,unsubscribed_at,confirm_sent_at,confirm_token")
    .eq("email", email)
    .maybeSingle();
  if (readErr) {
    console.error("[newsletter] read failed", readErr.message);
    return NextResponse.json({ error: "Could not sign you up. Please try again." }, { status: 500 });
  }

  let token: string | null = null;
  const row = existing as
    | { id: string; confirmed_at: string | null; unsubscribed_at: string | null; confirm_sent_at: string | null; confirm_token: string | null }
    | null;

  if (!row) {
    const ins = await db
      .from(NEWSLETTER_TABLE)
      .insert({
        email,
        source: `super-cube.me/${source}`,
        consent_text: CONSENT_TEXT,
        consent_at: nowIso,
        ip_hash: ipHash,
        confirm_sent_at: nowIso,
      })
      .select("confirm_token")
      .single();
    if (ins.error) {
      console.error("[newsletter] insert failed", ins.error.code, ins.error.message);
      return NextResponse.json({ error: "Could not sign you up. Please try again." }, { status: 500 });
    }
    token = (ins.data as { confirm_token: string }).confirm_token;
  } else if (row.confirmed_at && !row.unsubscribed_at) {
    // Already subscribed: nothing to send.
    return NextResponse.json({ ok: true, pending: true });
  } else {
    const recentlySent =
      !row.unsubscribed_at && row.confirm_sent_at && now.getTime() - Date.parse(row.confirm_sent_at) < RESEND_AFTER_MS;
    if (recentlySent) return NextResponse.json({ ok: true, pending: true });
    // Pending, or coming back after unsubscribing: fresh consent, fresh single-use link.
    const upd = await db
      .from(NEWSLETTER_TABLE)
      .update({
        consent_text: CONSENT_TEXT,
        consent_at: nowIso,
        source: `super-cube.me/${source}`,
        ip_hash: ipHash,
        unsubscribed_at: null,
        confirmed_at: null,
        confirm_token: crypto.randomUUID(),
        confirm_sent_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", row.id)
      .select("confirm_token")
      .single();
    if (upd.error) {
      console.error("[newsletter] update failed", upd.error.message);
      return NextResponse.json({ error: "Could not sign you up. Please try again." }, { status: 500 });
    }
    token = (upd.data as { confirm_token: string }).confirm_token;
  }

  const origin = siteOrigin(req);
  const mail = confirmationEmail({ confirmUrl: confirmUrl(token!, origin), site: origin });
  const sent = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text, tags: ["newsletter_confirm"] });
  if (!sent.ok) console.error("[newsletter] confirmation email failed", sent.provider, sent.error?.slice(0, 200));

  return NextResponse.json({ ok: true, pending: true });
}
