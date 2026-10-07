import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { minorMayGetPush, pushConfigured } from "@/lib/lms/server/engagement";
import { isMinorLearner } from "@/lib/lms/server/share-links";

/**
 * Web Push opt-in. Off until NEXT_PUBLIC_LMS_PUSH=1 and a VAPID public key are set through
 * the Vercel env flow (sending also needs the private key server-side). Until then this
 * answers 501 and the UI keeps to on-device reminders.
 */
const MAX_DEVICES = 10;

type Sub = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function POST(request: Request) {
  if (!pushConfigured()) return NextResponse.json({ error: "push_not_configured" }, { status: 501 });
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const body = (await request.json().catch(() => ({}))) as { subscription?: Sub };
  const sub = body.subscription ?? {};
  const endpoint = String(sub.endpoint || "");
  const p256dh = String(sub.keys?.p256dh || "");
  const auth = String(sub.keys?.auth || "");
  if (!/^https:\/\/[^\s]{10,990}$/.test(endpoint) || !p256dh || p256dh.length > 200 || !auth || auth.length > 100) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }
  if (!(await minorMayGetPush(ctx.admin, ctx.user.id))) {
    return NextResponse.json({ error: "consent_required" }, { status: 403 });
  }
  const { count } = await ctx.admin
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.user.id)
    .is("revoked_at", null);
  if ((count ?? 0) >= MAX_DEVICES) return NextResponse.json({ error: "too_many_devices" }, { status: 409 });

  const ua = (request.headers.get("user-agent") || "").slice(0, 300);
  const { error } = await ctx.admin
    .from("push_subscriptions")
    .upsert({ user_id: ctx.user.id, endpoint, p256dh, auth, user_agent: ua, revoked_at: null }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: "Could not save" }, { status: 500 });
  const minor = await isMinorLearner(ctx.admin, ctx.user.id);
  await ctx.admin
    .from("notification_prefs")
    .upsert({ user_id: ctx.user.id, channel: "push", guardian_approved: minor, updated_at: new Date().toISOString() });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  let q = ctx.admin
    .from("push_subscriptions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", ctx.user.id)
    .is("revoked_at", null);
  if (body.endpoint) q = q.eq("endpoint", String(body.endpoint));
  const { error } = await q;
  if (error) return NextResponse.json({ error: "Could not turn off" }, { status: 500 });
  await ctx.admin
    .from("notification_prefs")
    .upsert({ user_id: ctx.user.id, channel: "none", updated_at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
