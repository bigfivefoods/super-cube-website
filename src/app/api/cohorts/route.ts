import { createCohort, gate, listCohorts } from "@/lib/lms/server/cohort-api";

export async function GET() {
  const ctx = await gate();
  if (!ctx.ok) return ctx.response;
  return listCohorts(ctx.supabase, ctx.user.id);
}

export async function POST(request: Request) {
  const ctx = await gate();
  if (!ctx.ok) return ctx.response;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return createCohort(ctx.supabase, ctx.user, body);
}
