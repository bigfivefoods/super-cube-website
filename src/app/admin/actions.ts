"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { audit, requireLmsAdmin } from "@/lib/admin/auth";

export type ActionState = { ok?: boolean; error?: string; message?: string; link?: string } | undefined;

const UUID = /^[0-9a-f-]{36}$/i;
const SEAT_KINDS = ["comped", "invoiced", "eft", "other"] as const;
const ORG_KINDS = ["cohort", "school", "company", "network"] as const;

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

function done(message: string, extra: Partial<NonNullable<ActionState>> = {}): ActionState {
  revalidatePath("/admin");
  return { ok: true, message, ...extra };
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "www.super-cube.me";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

function makeCode(name: string) {
  const stem = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "COHORT";
  return `${stem}${randomBytes(2).toString("hex").toUpperCase()}`;
}

/** Create a cohort (organisation), optionally with an opening seat grant. */
export async function createCohortAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return { error: "Your admin session has ended. Sign in again." };
  const name = str(form, "name", 120);
  if (name.length < 2) return { error: "Give the cohort a name." };
  const kindRaw = str(form, "kind", 20);
  const kind = (ORG_KINDS as readonly string[]).includes(kindRaw) ? kindRaw : "cohort";
  const code = (str(form, "code", 24).toUpperCase().replace(/[^A-Z0-9]/g, "") || makeCode(name)).slice(0, 24);
  if (code.length < 4) return { error: "Cohort codes need at least 4 letters or numbers." };
  const contact = str(form, "contact_email", 200).toLowerCase() || null;
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return { error: "That contact email doesn’t look right." };
  const notes = str(form, "notes", 500) || null;
  const seats = Math.floor(Number(form.get("seats") || 0));
  const seatKindRaw = str(form, "seat_kind", 20);
  const seatKind = (SEAT_KINDS as readonly string[]).includes(seatKindRaw) ? seatKindRaw : "comped";
  const reference = str(form, "reference", 80);
  if (seats < 0 || seats > 10000) return { error: "Seats must be between 0 and 10 000." };
  if (seats > 0 && (seatKind === "invoiced" || seatKind === "eft") && !reference) {
    return { error: "Add the invoice or EFT reference for paid seats." };
  }

  const { data: org, error } = await ctx.db
    .from("organisations")
    .insert({ code, name, kind, contact_email: contact, notes, active: true, seat_limit: 0 })
    .select("id, code")
    .single();
  if (error) {
    return { error: error.code === "23505" ? `The code ${code} is taken. Choose another.` : error.message };
  }
  await audit(ctx.db, ctx.email, "cohort.create", "organisation", org.id, { code, name, kind });
  if (seats > 0) {
    const { error: gErr } = await ctx.db.rpc("admin_grant_seats", {
      p_org: org.id, p_seats: seats, p_kind: seatKind, p_reference: reference, p_note: "Opening grant", p_actor: ctx.email,
    });
    if (gErr) return { error: `Cohort created, but the seats weren’t added: ${gErr.message}` };
  }
  return done(`Cohort ${name} created with code ${code}${seats ? ` and ${seats} seats` : ""}.`, {
    link: `${await origin()}/learn/org?code=${code}`,
  });
}

/** Pause or reopen a cohort. Paused cohorts give no access and can't be joined. */
export async function setCohortActiveAction(form: FormData) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return;
  const id = str(form, "id", 40);
  const active = str(form, "active", 1) === "1";
  if (!UUID.test(id)) return;
  const { error } = await ctx.db.from("organisations").update({ active, updated_at: new Date().toISOString() }).eq("id", id);
  if (!error) await audit(ctx.db, ctx.email, active ? "cohort.reopen" : "cohort.pause", "organisation", id);
  revalidatePath("/admin");
}

/** Manual, invoiced or EFT seat grant (no Paystack needed). */
export async function grantSeatsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return { error: "Your admin session has ended. Sign in again." };
  const orgId = str(form, "org_id", 40);
  const seats = Math.floor(Number(form.get("seats") || 0));
  const kindRaw = str(form, "kind", 20);
  const kind = (SEAT_KINDS as readonly string[]).includes(kindRaw) ? kindRaw : "";
  const reference = str(form, "reference", 80);
  const note = str(form, "note", 300);
  if (!UUID.test(orgId)) return { error: "Choose a cohort." };
  if (!(seats >= 1 && seats <= 10000)) return { error: "Seats must be between 1 and 10 000." };
  if (!kind) return { error: "Choose how the seats are paid for." };
  if ((kind === "invoiced" || kind === "eft") && !reference) return { error: "Add the invoice or EFT reference." };
  const { error } = await ctx.db.rpc("admin_grant_seats", {
    p_org: orgId, p_seats: seats, p_kind: kind, p_reference: reference, p_note: note, p_actor: ctx.email,
  });
  if (error) return { error: error.message };
  return done(`${seats} seat${seats === 1 ? "" : "s"} added.`);
}

/** Take a grant's seats back off (keeps the row for the record). */
export async function revokeSeatGrantAction(form: FormData) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return;
  const id = str(form, "grant_id", 40);
  if (!UUID.test(id)) return;
  await ctx.db.rpc("admin_revoke_seat_grant", { p_grant: id, p_actor: ctx.email, p_reason: str(form, "reason", 200) || "Revoked in admin" });
  revalidatePath("/admin");
}

/** Coach / admin invite for a cohort. The link is shown once; only its hash is stored. */
export async function createInviteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return { error: "Your admin session has ended. Sign in again." };
  const orgId = str(form, "org_id", 40);
  const role = str(form, "role", 10) === "admin" ? "admin" : "coach";
  const email = str(form, "email", 200).toLowerCase() || null;
  const days = Math.min(30, Math.max(1, Math.floor(Number(form.get("days")) || 7)));
  const maxUses = Math.min(50, Math.max(1, Math.floor(Number(form.get("max_uses")) || 1)));
  if (!UUID.test(orgId)) return { error: "Choose a cohort." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email doesn’t look right." };
  const token = randomBytes(24).toString("base64url");
  const { data, error } = await ctx.db
    .from("org_invites")
    .insert({
      org_id: orgId,
      role,
      token_hash: createHash("sha256").update(token).digest("hex"),
      email,
      created_by: null,
      expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
      max_uses: maxUses,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  await audit(ctx.db, ctx.email, "invite.create", "invite", data.id, { org_id: orgId, role, locked_to_email: Boolean(email), days, max_uses: maxUses });
  return done(`${role === "admin" ? "Admin" : "Coach"} invite ready. Copy the link now: it won’t be shown again.`, {
    link: `${await origin()}/learn/org?invite=${encodeURIComponent(token)}`,
  });
}

export async function revokeInviteAction(form: FormData) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return;
  const id = str(form, "id", 40);
  if (!UUID.test(id)) return;
  const { error } = await ctx.db.from("org_invites").update({ revoked: true }).eq("id", id);
  if (!error) await audit(ctx.db, ctx.email, "invite.revoke", "invite", id);
  revalidatePath("/admin");
}

/** Revoke a certificate: /verify/[id] then reports it as revoked. A reason is required. */
export async function revokeCertificateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return { error: "Your admin session has ended. Sign in again." };
  const id = str(form, "id", 80);
  const reason = str(form, "reason", 300);
  if (!id) return { error: "Missing certificate." };
  if (reason.length < 4) return { error: "Give a short reason (it goes in the audit log)." };
  const { error } = await ctx.db
    .from("certificates")
    .update({ revoked: true, revoked_at: new Date().toISOString(), revoked_reason: reason })
    .eq("id", id)
    .eq("revoked", false);
  if (error) return { error: error.message };
  await audit(ctx.db, ctx.email, "certificate.revoke", "certificate", id, { reason });
  return done(`Certificate ${id} revoked.`);
}

export async function reinstateCertificateAction(form: FormData) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return;
  const id = str(form, "id", 80);
  if (!id) return;
  const { error } = await ctx.db
    .from("certificates")
    .update({ revoked: false, revoked_at: null, revoked_reason: null })
    .eq("id", id);
  if (!error) await audit(ctx.db, ctx.email, "certificate.reinstate", "certificate", id);
  revalidatePath("/admin");
}
