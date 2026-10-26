import { createPost, gate, isUuid, json } from "@/lib/lms/server/cohort-api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; threadId: string }> }) {
  const ctx = await gate();
  if (!ctx.ok) return ctx.response;
  const { id, threadId } = await params;
  if (!isUuid(id)) return json({ error: "invalid" }, 400);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return createPost(ctx.supabase, ctx.user.id, id, threadId, body);
}
