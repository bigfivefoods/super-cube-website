import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import { limitRequest } from "@/lib/server/rate-limit";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

/**
 * Join an organisation.
 *  - Learners: cohort code (seat limit enforced when the org has purchased seats).
 *  - Coaches/admins: ONLY with an invite token issued by an org admin
 *    (POST /api/org/invites). Asking for role=coach with a plain code is refused.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "org-join", [`user:${ctx.user.id}`]);
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    invite?: string;
    role?: string;
    displayName?: string;
  };
  const displayName = String(body.displayName || "").trim().slice(0, 80) || ctx.user.email || null;
  const invite = String(body.invite || "").trim();

  // ── Staff invite path ────────────────────────────────────────
  if (invite) {
    const { data: inv } = await ctx.admin
      .from("org_invites")
      .select("id, org_id, role, email, expires_at, max_uses, used_count, revoked, organisations(id, code, name, kind, active)")
      .eq("token_hash", sha256(invite))
      .maybeSingle();
    const org = inv
      ? (Array.isArray(inv.organisations) ? inv.organisations[0] : inv.organisations)
      : null;
    const invalid =
      !inv ||
      !org?.active ||
      inv.revoked ||
      new Date(inv.expires_at).getTime() < Date.now() ||
      inv.used_count >= inv.max_uses ||
      (inv.email && inv.email.toLowerCase() !== (ctx.user.email || "").toLowerCase());
    if (invalid) {
      return NextResponse.json({ error: "Invite is invalid, expired or already used" }, { status: 403 });
    }
    const { error } = await ctx.admin.from("org_members").upsert(
      { org_id: inv.org_id, user_id: ctx.user.id, role: inv.role, display_name: displayName },
      { onConflict: "org_id,user_id" },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await ctx.admin
      .from("org_invites")
      .update({ used_count: inv.used_count + 1 })
      .eq("id", inv.id)
      .eq("used_count", inv.used_count);
    return NextResponse.json({
      ok: true,
      role: inv.role,
      org: { id: org.id, code: org.code, name: org.name, kind: org.kind },
    });
  }

  // ── Learner code path ────────────────────────────────────────
  if (body.role === "coach" || body.role === "admin") {
    return NextResponse.json(
      { error: "Coaches join with an invite from the organisation's admin, not the learner code." },
      { status: 403 },
    );
  }
  const code = String(body.code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const { data: org } = await ctx.admin
    .from("organisations")
    .select("id, code, name, kind, seat_limit")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();
  if (!org) return NextResponse.json({ error: "Unknown or inactive cohort code" }, { status: 404 });

  const { data: existing } = await ctx.admin
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      ok: true,
      role: existing.role,
      org: { id: org.id, code: org.code, name: org.name, kind: org.kind },
    });
  }

  if (org.seat_limit != null) {
    const { count } = await ctx.admin
      .from("org_members")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("role", "learner");
    if ((count ?? 0) >= org.seat_limit) {
      return NextResponse.json({ error: "All seats in this cohort are taken" }, { status: 409 });
    }
  }

  const { error } = await ctx.admin.from("org_members").insert({
    org_id: org.id,
    user_id: ctx.user.id,
    role: "learner",
    display_name: displayName,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    ok: true,
    role: "learner",
    org: { id: org.id, code: org.code, name: org.name, kind: org.kind },
  });
}
