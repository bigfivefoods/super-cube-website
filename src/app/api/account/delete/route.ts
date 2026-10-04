import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";

/**
 * POPIA "delete my data": removes the signed-in learner's account and all learning
 * data held in the cloud. Requires the body { confirm: "DELETE" }.
 * Rows referencing auth.users cascade (profile, learner_state, attempts, completions,
 * memberships, snapshots, consents). Certificates and shares carry the learner's
 * name, so they are deleted explicitly rather than orphaned.
 * Only a salted hash of the user id is kept as proof the request was honoured.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 });
  }

  const uid = ctx.user.id;
  const salt = process.env.DELETION_LOG_SALT || "super-cube-deletion-log";
  const subjectHash = createHash("sha256").update(`${salt}:${uid}`).digest("hex");
  const { data: logRow } = await ctx.admin
    .from("data_deletion_log")
    .insert({ subject_hash: subjectHash })
    .select("id")
    .single();

  const steps: Record<string, string | null> = {};
  for (const table of ["certificates", "growth_shares"]) {
    const { error } = await ctx.admin.from(table).delete().eq("user_id", uid);
    steps[table] = error?.message ?? null;
  }
  // Organisations the learner owns keep running for other members; drop ownership.
  await ctx.admin.from("organisations").update({ owner_user_id: null }).eq("owner_user_id", uid);

  const { error } = await ctx.admin.auth.admin.deleteUser(uid);
  if (error) {
    return NextResponse.json({ error: error.message, steps }, { status: 500 });
  }
  if (logRow?.id) {
    await ctx.admin
      .from("data_deletion_log")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", logRow.id);
  }
  await ctx.supabase.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true, deleted: true });
}
