import { NextResponse } from "next/server";
import { requireLmsAdmin } from "@/lib/admin/auth";
import { SAMPLE_IDS, sampleEmail, type SampleId } from "@/lib/email/samples";

/** Admin-only preview of each email template with sample data (?id=receipt&format=text). */
export async function GET(request: Request) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id") as SampleId | null;
  const pid = url.searchParams.get("programme");
  if (!id || !SAMPLE_IDS.includes(id)) {
    return NextResponse.json({ templates: SAMPLE_IDS });
  }
  const e = sampleEmail(id, {
    programmeId: pid === "kids" || pid === "adolescents" || pid === "adults" ? pid : undefined,
    to: ctx.email,
  });
  const text = url.searchParams.get("format") === "text";
  return new NextResponse(text ? e.text : e.html, {
    headers: {
      "Content-Type": text ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
