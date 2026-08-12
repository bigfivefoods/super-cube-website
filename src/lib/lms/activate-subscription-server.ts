/**
 * Server-side: activate subscription in Supabase after Paystack success.
 * Idempotent on paystack_reference when column exists; otherwise user+plan.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { programmes } from "@/lib/programmes";

export async function activateSubscriptionInSupabase(opts: {
  email?: string | null;
  programmeId: string;
  planId: string;
  paystackReference: string;
  paystackCustomerCode?: string | null;
  amountCents?: number;
  currency?: string;
}): Promise<{ saved: boolean; userId: string | null; reason?: string }> {
  const programme = programmes.find((p) => p.id === opts.programmeId);
  if (!programme) {
    return { saved: false, userId: null, reason: "invalid_programme" };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { saved: false, userId: null, reason: "no_admin" };
  }

  const email = opts.email?.trim().toLowerCase();
  if (!email || email.includes("@demo.local")) {
    return { saved: false, userId: null, reason: "no_email" };
  }

  // Find auth user by email (paginated scan is fine at pilot scale)
  let userId: string | null = null;
  try {
    const { data: listed } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const found = listed?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );
    userId = found?.id ?? null;
  } catch {
    return { saved: false, userId: null, reason: "auth_list_failed" };
  }

  if (!userId) {
    return { saved: false, userId: null, reason: "user_not_found" };
  }

  await admin.from("profiles").upsert({
    id: userId,
    email,
    programme_id: opts.programmeId,
    updated_at: new Date().toISOString(),
  });

  const priceZar =
    opts.currency === "USD"
      ? programme.priceUsd * 100
      : (opts.amountCents ?? programme.priceZar * 100);

  await admin.from("subscription_plans").upsert(
    {
      id: opts.planId,
      programme_id: opts.programmeId,
      name: `${programme.name} · one-time`,
      price_zar: priceZar,
      interval: "once",
      active: true,
      features: ["full_pathway", "report", "certificate"],
    },
    { onConflict: "id" }
  );

  // Idempotency: skip if this reference already stored
  if (opts.paystackReference) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("paystack_subscription_code", opts.paystackReference)
      .maybeSingle();
    if (existing?.id) {
      return { saved: true, userId, reason: "already_active" };
    }
  }

  // Also skip duplicate active sub for same user+plan
  const { data: active } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_id", opts.planId)
    .eq("status", "active")
    .maybeSingle();

  if (active?.id) {
    // Update reference if column maps to subscription_code
    await admin
      .from("subscriptions")
      .update({
        paystack_subscription_code: opts.paystackReference,
        paystack_customer_code: opts.paystackCustomerCode ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", active.id);
    return { saved: true, userId, reason: "updated_existing" };
  }

  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    plan_id: opts.planId,
    programme_id: opts.programmeId,
    status: "active",
    paystack_customer_code: opts.paystackCustomerCode ?? null,
    paystack_subscription_code: opts.paystackReference,
    current_period_end: null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("[activateSubscription]", error.message);
    return { saved: false, userId, reason: error.message };
  }

  return { saved: true, userId };
}
