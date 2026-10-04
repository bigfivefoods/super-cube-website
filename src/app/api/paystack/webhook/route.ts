import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { fulfilPaystackCharge } from "@/lib/lms/server/paystack-fulfil";

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
      // Same checks as /api/paystack/verify: metadata-only product data and
      // amount/currency must match the server price list.
      const result = await fulfilPaystackCharge(event.data);
      console.info("[paystack webhook] fulfil", {
        reference: event.data?.reference,
        ok: result.ok,
        reason: result.reason,
        productType: result.productType,
      });
      if (!result.ok) {
        return NextResponse.json({ received: true, fulfilled: false, reason: result.reason });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[paystack webhook]", e);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
