import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

/**
 * Weekly review email hook.
 * Body: { email, name?, weekLabel?, summary?, weakest?, planUrl? }
 * Uses RESEND_API_KEY or CONTACT_WEBHOOK via sendEmail helper.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const name = String(body.name || "Leader").trim();
    const weekLabel = String(body.weekLabel || "This week").trim();
    const summary = String(body.summary || "Your Super-Cube® weekly plan is ready.").trim();
    const weakest = String(body.weakest || "your stretch faces").trim();
    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://www.super-cube.me";
    const planUrl = String(body.planUrl || `${site}/learn`).trim();

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
        <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8a8a">Super-Cube® Learn</p>
        <h1 style="font-size:22px;line-height:1.25">Hi ${escapeHtml(name)}, ${escapeHtml(weekLabel)}</h1>
        <p style="color:#5c5c5c;line-height:1.55">${escapeHtml(summary)}</p>
        <p style="color:#5c5c5c;line-height:1.55">Focus faces: <strong>${escapeHtml(weakest)}</strong>. Journals stay private; this email never includes your reflection text.</p>
        <p style="margin:24px 0">
          <a href="${escapeAttr(planUrl)}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px">Open weekly plan</a>
        </p>
        <p style="font-size:12px;color:#8a8a8a">Micro-practice: ${escapeAttr(site)}/learn/practice</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: `Super-Cube® · ${weekLabel}`,
      html,
      tags: ["weekly-review"],
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Weekly email failed" },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
