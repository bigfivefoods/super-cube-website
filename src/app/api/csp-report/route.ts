import { NextResponse } from "next/server";
import { limitRequest } from "@/lib/server/rate-limit";

/**
 * Receives Content-Security-Policy violation reports (both the legacy
 * `application/csp-report` body and Reporting API batches) and logs a trimmed
 * line per violation for Vercel runtime logs. Query strings are dropped so no
 * tokens end up in logs. Nothing is stored.
 */

type Legacy = { "csp-report"?: Record<string, unknown> };
type Batch = { type?: string; body?: Record<string, unknown> }[];

function pathOnly(u: unknown): string {
  if (typeof u !== "string" || !u) return "";
  try {
    const x = new URL(u);
    return x.origin + x.pathname;
  } catch {
    return u.slice(0, 80);
  }
}

export async function POST(request: Request) {
  const limited = await limitRequest(request, "csp-report");
  if (limited) return new NextResponse(null, { status: 204 });
  const text = (await request.text().catch(() => "")).slice(0, 16_000);
  let reports: Record<string, unknown>[] = [];
  try {
    const parsed = JSON.parse(text) as Legacy | Batch;
    if (Array.isArray(parsed)) {
      reports = parsed.filter((r) => r?.type === "csp-violation" && r.body).map((r) => r.body!);
    } else if (parsed && parsed["csp-report"]) {
      reports = [parsed["csp-report"]];
    }
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  for (const r of reports.slice(0, 10)) {
    console.warn(
      "[csp]",
      JSON.stringify({
        directive: r["effective-directive"] ?? r.effectiveDirective ?? r["violated-directive"],
        blocked: pathOnly(r["blocked-uri"] ?? r.blockedURL),
        page: pathOnly(r["document-uri"] ?? r.documentURL),
        source: pathOnly(r["source-file"] ?? r.sourceFile),
        line: r["line-number"] ?? r.lineNumber,
        disposition: r.disposition,
      }),
    );
  }
  return new NextResponse(null, { status: 204 });
}
