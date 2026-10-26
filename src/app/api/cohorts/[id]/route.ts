import { cohortDetail, gate, isUuid, json } from "@/lib/lms/server/cohort-api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await gate();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  if (!isUuid(id)) return json({ error: "invalid" }, 400);
  return cohortDetail(ctx.supabase, ctx.user.id, id);
}
