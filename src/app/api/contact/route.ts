import { NextResponse } from "next/server";
import { isNonProductionDeploy } from "@/lib/deploy-env";
import { newsletterDb } from "@/lib/newsletter/db";
import { limitRequest } from "@/lib/server/rate-limit";

type Body = {
  name?: string;
  email?: string;
  organisation?: string;
  message?: string;
  intent?: string;
  source?: string;
  /** Honeypot: real users never fill this. */
  website?: string;
};

/**
 * Contact / quote / keynote intake. Every enquiry is saved to the Supabase
 * table public.enquiries (service role, server-only) when configured, so
 * nothing is lost while there is no mailbox. Logs a structured payload; in production it
 * also posts to a webhook (CONTACT_WEBHOOK or NEXT_PUBLIC_CONTACT_WEBHOOK) for
 * email/CRM. On preview deployments nothing is forwarded (log only), so test
 * submissions never reach real people.
 */
export async function POST(req: Request) {
  const limited = await limitRequest(req, "contact");
  if (limited) return limited;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (String(body.website ?? "").trim()) {
    // Bot filled the honeypot: pretend success, do nothing.
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const organisation = String(body.organisation ?? "").trim().slice(0, 160);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const intent = String(body.intent ?? "general").trim().slice(0, 80);
  const clientSource = String(body.source ?? "").trim().slice(0, 40);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const source =
    clientSource === "footer"
      ? "super-cube.me/footer"
      : clientSource
        ? `super-cube.me/${clientSource}`
        : "super-cube.me/contact";

  const payload = {
    name,
    email,
    organisation,
    message,
    intent,
    receivedAt: new Date().toISOString(),
    source,
  };

  const webhook =
    process.env.CONTACT_WEBHOOK ||
    process.env.NEXT_PUBLIC_CONTACT_WEBHOOK ||
    "";

  const preview = isNonProductionDeploy();
  const willForward = Boolean(webhook && !preview);

  // Durable store first, so an enquiry is never lost.
  let stored = false;
  const db = newsletterDb();
  if (db) {
    const { error } = await db.from("enquiries").insert({
      intent,
      name,
      email,
      organisation: organisation || null,
      message,
      source,
      delivered: willForward,
    });
    if (error) console.error("[contact] store failed", error.code, error.message);
    else stored = true;
  }

  if (webhook && !preview) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // still accept — mail may be down
    }
  }
  if (!willForward && !stored) {
    console.info(
      preview ? "[contact][preview: not forwarded]" : "[contact]",
      JSON.stringify(payload)
    );
  }

  return NextResponse.json({ ok: true, delivered: willForward, stored });
}
