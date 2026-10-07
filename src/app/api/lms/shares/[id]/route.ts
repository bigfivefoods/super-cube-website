import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { SHARE_LINK_COLUMNS, toSummary, type ShareLinkRow } from "@/lib/lms/server/share-links";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Turn a link off. Only the learner who made it can; it can't be turned back on. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { data, error } = await ctx.admin
    .from("report_share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .is("revoked_at", null)
    .select(SHARE_LINK_COLUMNS)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not turn the link off" }, { status: 500 });
  if (!data) {
    // Already off, or not yours: answer the same way so ids can't be probed
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, link: toSummary(data as ShareLinkRow) });
}
