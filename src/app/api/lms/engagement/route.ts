import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { getEngagement } from "@/lib/lms/server/engagement";

/** Streak, streak freezes, badges and push status for the signed-in learner. */
export async function GET() {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  return NextResponse.json(await getEngagement(ctx.admin, ctx.user.id), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
