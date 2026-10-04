import { NextResponse } from "next/server";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { NEWSLETTER_TABLE, newsletterDb, siteOrigin, unsubscribeUrl, type Subscriber } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";

/** CSV export of the subscriber list (admin only). ?status=active|all */
export async function GET(req: Request) {
  const admin = await getNewsletterAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = newsletterDb();
  if (!db) return NextResponse.json({ error: "Store not configured" }, { status: 503 });

  const status = new URL(req.url).searchParams.get("status") || "all";
  let q = db
    .from(NEWSLETTER_TABLE)
    .select("id,email,source,consent_text,consent_at,unsubscribe_token,unsubscribed_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50000);
  if (status === "active") q = q.is("unsubscribed_at", null);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const origin = siteOrigin();
  const rows: string[][] = [
    ["email", "status", "source", "consent_at", "consent_text", "unsubscribed_at", "created_at", "unsubscribe_url"],
    ...((data ?? []) as Subscriber[]).map((s) => [
      s.email,
      s.unsubscribed_at ? "unsubscribed" : "active",
      s.source ?? "",
      s.consent_at,
      s.consent_text,
      s.unsubscribed_at ?? "",
      s.created_at,
      unsubscribeUrl(s.unsubscribe_token, origin),
    ]),
  ];
  // Prefix formula-like cells to prevent CSV injection in spreadsheets.
  const cell = (c: string) => {
    const v = /^[=+\-@]/.test(c) ? `'${c}` : c;
    return `"${v.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="super-cube-newsletter-${status}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
