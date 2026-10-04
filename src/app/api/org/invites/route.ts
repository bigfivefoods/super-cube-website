import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";

/**
 * Org admin issues a coach/admin invite. The token is returned ONCE and only its
 * SHA-256 is stored. No email is sent here — the admin shares the link themselves.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = (await request.json().catch(() => ({}))) as {
    orgCode?: string;
    role?: string;
    email?: string;
    expiresInDays?: number;
    maxUses?: number;
  };
  const role = body.role === "admin" ? "admin" : "coach";
  const code = String(body.orgCode || "").trim().toUpperCase();

  const { data: org } = await ctx.admin
    .from("organisations")
    .select("id, code, name, owner_user_id")
    .eq("code", code)
    .maybeSingle();
  if (!org) return NextResponse.json({ error: "Unknown organisation" }, { status: 404 });

  const { data: me } = await ctx.admin
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  const isAdmin = me?.role === "admin" || org.owner_user_id === ctx.user.id;
  if (!isAdmin) {
    return NextResponse.json({ error: "Only the organisation admin can invite coaches" }, { status: 403 });
  }

  const token = randomBytes(24).toString("base64url");
  const days = Math.min(30, Math.max(1, Number(body.expiresInDays) || 7));
  const maxUses = Math.min(50, Math.max(1, Number(body.maxUses) || 1));
  const email = String(body.email || "").trim().toLowerCase() || null;

  const { error } = await ctx.admin.from("org_invites").insert({
    org_id: org.id,
    role,
    token_hash: createHash("sha256").update(token).digest("hex"),
    email,
    created_by: ctx.user.id,
    expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
    max_uses: maxUses,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  return NextResponse.json({
    ok: true,
    role,
    token,
    link: `${site}/learn/org?invite=${encodeURIComponent(token)}`,
    expiresInDays: days,
    maxUses,
    lockedToEmail: email,
  });
}
