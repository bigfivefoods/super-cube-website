/**
 * Shared Paystack fulfilment used by BOTH /api/paystack/verify and the signed
 * webhook. Only data that came from Paystack (verify API or HMAC-signed webhook)
 * is trusted: product, programme, seats and the buyer's user id come from the
 * transaction metadata set at initialize; the amount and currency must match
 * the server's price list, so a cheaper or foreign charge cannot unlock access.
 */

import { activateSubscriptionInSupabase } from "@/lib/lms/activate-subscription-server";
import { createOrgFromSeatPayment, type CreateOrgFromPaymentResult } from "@/lib/org/create-from-payment";
import { courseAmountCents, getProgramme, type ProgrammeId } from "@/lib/programmes";
import { getSeatPack, isSeatPackId, seatPackAmountCents } from "@/lib/seat-packs";

export type PaystackCharge = {
  reference?: string;
  status?: string;
  amount?: number;
  currency?: string;
  customer?: { email?: string; customer_code?: string };
  metadata?: Record<string, unknown> | null;
};

export type FulfilResult = {
  ok: boolean;
  reason?: string;
  productType?: "single" | "seat_pack";
  programmeId?: ProgrammeId;
  planId?: string;
  seats?: number;
  packId?: string;
  userId?: string | null;
  subscriptionSaved?: boolean;
  org?: CreateOrgFromPaymentResult["org"] | null;
  orgOk?: boolean;
  orgReason?: string;
  expectedAmount?: number;
};

export async function fulfilPaystackCharge(data: PaystackCharge): Promise<FulfilResult> {
  if (data.status !== "success") return { ok: false, reason: "not_successful" };
  const reference = String(data.reference || "");
  if (!reference) return { ok: false, reason: "no_reference" };

  const meta = (data.metadata && typeof data.metadata === "object" ? data.metadata : {}) as Record<string, unknown>;
  const currency = String(data.currency || "").toUpperCase();
  if (currency !== "ZAR" && currency !== "USD") return { ok: false, reason: "unsupported_currency" };
  const paid = Number(data.amount || 0);
  const programme = getProgramme(String(meta.programme_id || ""));
  if (!programme) return { ok: false, reason: "missing_programme_metadata" };
  const programmeId = programme.id as ProgrammeId;
  const metaUserId = typeof meta.user_id === "string" && /^[0-9a-f-]{36}$/i.test(meta.user_id) ? meta.user_id : null;
  const email = data.customer?.email ?? null;

  if (String(meta.product_type || "single") === "seat_pack") {
    const packId = String(meta.pack_id || "");
    if (!isSeatPackId(packId)) return { ok: false, reason: "invalid_pack_metadata" };
    const pack = getSeatPack(packId)!;
    const expected = seatPackAmountCents(pack, currency);
    if (paid < expected) return { ok: false, reason: "amount_mismatch", expectedAmount: expected };
    const planId = `pack_${packId}_${programmeId}`;
    const orgResult = await createOrgFromSeatPayment({
      email,
      orgName: String(meta.org_name || "Cohort").slice(0, 120),
      seats: pack.seats,
      packId,
      paystackReference: reference,
      programmeId,
      kind: "school",
    });
    const sub = await activateSubscriptionInSupabase({
      userId: metaUserId,
      email,
      programmeId,
      planId,
      paystackReference: reference,
      paystackCustomerCode: data.customer?.customer_code,
      amountCents: paid,
      currency,
    });
    return {
      ok: true,
      productType: "seat_pack",
      programmeId,
      planId,
      seats: pack.seats,
      packId,
      userId: sub.userId,
      subscriptionSaved: sub.saved,
      org: orgResult.org ?? null,
      orgOk: orgResult.ok,
      orgReason: orgResult.reason,
    };
  }

  const expected = courseAmountCents(currency, programme);
  if (paid < expected) return { ok: false, reason: "amount_mismatch", expectedAmount: expected };
  const planId = `${programmeId}_once`;
  const sub = await activateSubscriptionInSupabase({
    userId: metaUserId,
    email,
    programmeId,
    planId,
    paystackReference: reference,
    paystackCustomerCode: data.customer?.customer_code,
    amountCents: paid,
    currency,
  });
  return {
    ok: true,
    productType: "single",
    programmeId,
    planId,
    userId: sub.userId,
    subscriptionSaved: sub.saved,
    reason: sub.reason,
  };
}
