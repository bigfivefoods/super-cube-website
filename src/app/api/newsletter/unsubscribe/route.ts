import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter/unsubscribe";

export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe (RFC 8058 List-Unsubscribe-Post compatible).
 * POST /api/newsletter/unsubscribe?t=<token>  (or JSON { token })
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get("t") || "";
  if (!token) {
    try {
      const body = (await req.json()) as { token?: string };
      token = String(body.token ?? "");
    } catch {}
  }
  const result = await unsubscribeByToken(token.trim());
  const status = result === "done" ? 200 : result === "invalid" ? 400 : 503;
  return NextResponse.json({ ok: result === "done", result }, { status });
}
