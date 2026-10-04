import type { SupabaseClient } from "@supabase/supabase-js";

export type ServerEntitlement = {
  tier: "paid" | "cohort" | "open" | "none";
  programmeId?: string;
  source?: string;
};

/**
 * Server truth for "may this learner use the full pathway?"
 *  - paid:   an active subscription written by the Paystack-verified server path
 *  - cohort: learner seat in an organisation with a purchased seat_limit
 *  - open:   NEXT_PUBLIC_DEMO_LMS_OPEN=true (dev/pilot only)
 * A free demo never grants full access.
 */
export async function getServerEntitlement(
  admin: SupabaseClient,
  userId: string,
): Promise<ServerEntitlement> {
  if (process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true") {
    return { tier: "open", source: "demo_open_env" };
  }

  const { data: subs } = await admin
    .from("subscriptions")
    .select("programme_id, plan_id, status, paystack_subscription_code")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(5);
  const paid = (subs ?? []).find(
    (s) => s.paystack_subscription_code && !String(s.plan_id).endsWith("_demo"),
  );
  if (paid) {
    return { tier: "paid", programmeId: paid.programme_id, source: "paystack" };
  }

  const { data: seats } = await admin
    .from("org_members")
    .select("role, organisations!inner(id, active, seat_limit)")
    .eq("user_id", userId);
  type SeatRow = {
    role: string;
    organisations: { active: boolean; seat_limit: number | null } | { active: boolean; seat_limit: number | null }[];
  };
  const seat = ((seats ?? []) as SeatRow[]).find((m) => {
    const o = Array.isArray(m.organisations) ? m.organisations[0] : m.organisations;
    return o?.active && (o.seat_limit ?? 0) > 0;
  });
  if (seat) return { tier: "cohort", source: "seat_pack" };

  return { tier: "none" };
}

export function isEntitled(e: ServerEntitlement): boolean {
  return e.tier !== "none";
}
