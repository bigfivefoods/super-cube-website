import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  organisation?: string;
  message?: string;
  intent?: string;
};

/**
 * Contact intake. Logs structured payload; optionally posts to a webhook
 * (NEXT_PUBLIC_CONTACT_WEBHOOK or CONTACT_WEBHOOK) for email/CRM.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const organisation = String(body.organisation ?? "").trim().slice(0, 160);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const intent = String(body.intent ?? "general").trim().slice(0, 80);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const payload = {
    name,
    email,
    organisation,
    message,
    intent,
    receivedAt: new Date().toISOString(),
    source: "super-cube.me/contact",
  };

  const webhook =
    process.env.CONTACT_WEBHOOK ||
    process.env.NEXT_PUBLIC_CONTACT_WEBHOOK ||
    "";

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // still accept — mail may be down
    }
  } else {
    console.info("[contact]", JSON.stringify(payload));
  }

  return NextResponse.json({ ok: true });
}
