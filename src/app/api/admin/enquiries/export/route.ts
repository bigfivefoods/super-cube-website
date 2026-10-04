import { NextResponse } from "next/server";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { newsletterDb } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";

const sast = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", hour12: false })
    : "";

/** CSV export of website enquiries (admin only). ?status=open|all */
export async function GET(req: Request) {
  const admin = await getNewsletterAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = newsletterDb();
  if (!db) return NextResponse.json({ error: "Store not configured" }, { status: 503 });

  const status = new URL(req.url).searchParams.get("status") || "all";
  let q = db
    .from("enquiries")
    .select("created_at,intent,name,email,organisation,message,source,delivered,handled_at,handled_by")
    .order("created_at", { ascending: false })
    .limit(50000);
  if (status === "open") q = q.is("handled_at", null);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = {
    created_at: string; intent: string; name: string; email: string; organisation: string | null;
    message: string; source: string | null; delivered: boolean; handled_at: string | null; handled_by: string | null;
  };
  const rows: string[][] = [
    ["received_sast", "intent", "name", "email", "organisation", "message", "source", "forwarded", "status", "handled_sast", "handled_by"],
    ...((data ?? []) as Row[]).map((r) => [
      sast(r.created_at), r.intent, r.name, r.email, r.organisation ?? "", r.message, r.source ?? "",
      r.delivered ? "yes" : "no", r.handled_at ? "handled" : "open", sast(r.handled_at), r.handled_by ?? "",
    ]),
  ];
  const cell = (c: string) => {
    const v = /^[=+\-@]/.test(c) ? `'${c}` : c;
    return `"${v.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="super-cube-enquiries-${status}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
