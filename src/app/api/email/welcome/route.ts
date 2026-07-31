import { NextResponse } from "next/server";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const name = String(body.name || "Learner").trim();
    const programmeId = String(body.programmeId || "adults") as ProgrammeId;
    const mode = body.mode === "purchase" ? "purchase" : "demo";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Skip placeholder demo emails unless forced
    if (
      email.endsWith("@demo.local") ||
      email === "demo@super-cube.me" ||
      email === "learner@demo.local"
    ) {
      if (!body.force) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          reason: "placeholder_email",
        });
      }
    }

    const programme = getProgramme(programmeId);
    const site = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me"
    ).replace(/\/$/, "");
    const continueUrl = `${site}/learn/onboarding?mode=${mode}&programme=${programmeId}`;

    const result = await sendEmail({
      to: email,
      subject:
        mode === "purchase"
          ? "You're in — Super-Cube® Learn is unlocked"
          : "Welcome to Super-Cube® Learn (free demo)",
      html: welcomeEmailHtml({
        name,
        programmeName: programme?.name ?? "Super-Cube®",
        continueUrl,
        mode,
      }),
      text: `Continue learning: ${continueUrl}`,
      tags: ["welcome", mode],
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Email failed" },
      { status: 500 }
    );
  }
}
