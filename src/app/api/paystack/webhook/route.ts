import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { activateSubscriptionInSupabase } from "@/lib/lms/activate-subscription-server";
import { createOrgFromSeatPayment } from "@/lib/org/create-from-payment";

/**
 * Paystack webhook — charge.success for single + seat packs.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      data: {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        customer?: { email?: string; customer_code?: string };
        metadata?: Record<string, unknown>;
      };
    };

    console.info("[paystack webhook]", event.event, event.data?.reference);

    if (event.event === "charge.success") {
      const data = event.data;
      if (data.status && data.status !== "success") {
        return NextResponse.json({ received: true, skipped: true });
      }
      const meta = data.metadata || {};
      const productType = String(meta.product_type || "single");
      const programmeId = String(meta.programme_id || "adults");
      const planId = String(meta.plan_id || `${programmeId}_once`);
      const reference = String(data.reference || "");
      const email = data.customer?.email;

      if (!reference) {
        return NextResponse.json({ received: true, skipped: "no_ref" });
      }

      if (productType === "seat_pack") {
        const seats = Number(meta.seats || 10);
        const packId = String(meta.pack_id || "seats_10");
        const orgName = String(meta.org_name || "Cohort");
        const orgResult = await createOrgFromSeatPayment({
          email,
          orgName,
          seats,
          packId,
          paystackReference: reference,
          programmeId,
          kind: "school",
        });
        const sub = await activateSubscriptionInSupabase({
          email,
          programmeId,
          planId,
          paystackReference: reference,
          paystackCustomerCode: data.customer?.customer_code,
          amountCents: data.amount,
          currency: data.currency,
        });
        console.info("[paystack webhook] seat_pack", {
          org: orgResult,
          sub,
        });
      } else if (programmeId) {
        const result = await activateSubscriptionInSupabase({
          email,
          programmeId,
          planId,
          paystackReference: reference,
          paystackCustomerCode: data.customer?.customer_code,
          amountCents: data.amount,
          currency: data.currency,
        });
        console.info("[paystack webhook] single", result);
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[paystack webhook]", e);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
