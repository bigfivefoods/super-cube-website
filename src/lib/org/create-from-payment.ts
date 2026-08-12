/**
 * Create organisation + admin membership after seat-pack Paystack success.
 * Idempotent on paystack reference stored in notes when possible.
 */

import { createAdminClient } from "@/lib/supabase/admin";

function slugCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${base || "COHORT"}${n}`.slice(0, 16);
}

export type CreateOrgFromPaymentResult = {
  ok: boolean;
  org?: { id: string; code: string; name: string; kind: string; seatLimit?: number };
  userId?: string | null;
  reason?: string;
  alreadyExisted?: boolean;
};

export async function createOrgFromSeatPayment(opts: {
  email?: string | null;
  orgName: string;
  seats: number;
  packId: string;
  paystackReference: string;
  programmeId?: string;
  kind?: "school" | "company" | "cohort" | "network";
}): Promise<CreateOrgFromPaymentResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, reason: "no_admin" };
  }

  const email = opts.email?.trim().toLowerCase();
  if (!email || email.includes("@demo.local")) {
    return { ok: false, reason: "no_email" };
  }

  // Idempotency: find org by reference in notes
  const refTag = `paystack:${opts.paystackReference}`;
  {
    const { data: existing } = await admin
      .from("organisations")
      .select("id, code, name, kind, notes")
      .ilike("notes", `%${refTag}%`)
      .maybeSingle();
    if (existing) {
      return {
        ok: true,
        alreadyExisted: true,
        org: {
          id: existing.id,
          code: existing.code,
          name: existing.name,
          kind: existing.kind,
          seatLimit: opts.seats,
        },
        reason: "already_created",
      };
    }
  }

  let userId: string | null = null;
  try {
    const { data: listed } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    userId =
      listed?.users?.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
  } catch {
    return { ok: false, reason: "auth_list_failed" };
  }

  if (!userId) {
    // Still create org without owner link — coach can claim later by email
    // Prefer requiring user for admin membership
    return { ok: false, reason: "user_not_found_sign_up_first" };
  }

  const name = opts.orgName.trim().slice(0, 120) || "Super-Cube cohort";
  const code = slugCode(name);
  const kind = opts.kind || "school";
  const notes = [
    refTag,
    `seats:${opts.seats}`,
    `pack:${opts.packId}`,
    opts.programmeId ? `programme:${opts.programmeId}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  // Try insert with seat_limit if column exists; fall back without
  let org: { id: string; code: string; name: string; kind: string } | null =
    null;

  const withSeats = await admin
    .from("organisations")
    .insert({
      code,
      name,
      kind,
      owner_user_id: userId,
      contact_email: email,
      notes,
      active: true,
      seat_limit: opts.seats,
    })
    .select("id, code, name, kind")
    .single();

  if (!withSeats.error && withSeats.data) {
    org = withSeats.data;
  } else {
    const without = await admin
      .from("organisations")
      .insert({
        code,
        name,
        kind,
        owner_user_id: userId,
        contact_email: email,
        notes,
        active: true,
      })
      .select("id, code, name, kind")
      .single();

    if (without.error || !without.data) {
      return {
        ok: false,
        userId,
        reason:
          without.error?.message ||
          withSeats.error?.message ||
          "org_insert_failed",
      };
    }
    org = without.data;
  }

  await admin.from("org_members").upsert(
    {
      org_id: org.id,
      user_id: userId,
      role: "admin",
      display_name: email,
    },
    { onConflict: "org_id,user_id" }
  );

  // Also grant coach role row if supported (admin is enough)
  return {
    ok: true,
    userId,
    org: { ...org, seatLimit: opts.seats },
  };
}
