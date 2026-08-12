import { NextResponse } from "next/server";
import {
  initializeTransaction,
  makePaymentReference,
  paystackConfigured,
  paystackCurrency,
  paystackPublicKey,
} from "@/lib/paystack";
import {
  courseAmountCents,
  programmes,
  type ProgrammeId,
} from "@/lib/programmes";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes("@demo.local");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const programmeId = String(body.programmeId || "") as ProgrammeId;
    const planId = String(body.planId || `${programmeId}_once`);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const fullName = String(body.fullName || "").trim();

    const programme = programmes.find((p) => p.id === programmeId);
    if (!programme) {
      return NextResponse.json({ error: "Invalid programme" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            "A real email is required for payment receipts and account recovery.",
        },
        { status: 400 }
      );
    }

    if (!paystackConfigured()) {
      return NextResponse.json({
        demo: true,
        configured: false,
        message:
          "Paystack is not configured. Set PAYSTACK_SECRET_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, or use free demo.",
      });
    }

    const currency = paystackCurrency();
    const amount = courseAmountCents(currency, programme);
    const reference = makePaymentReference(programmeId);
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me"
    ).replace(/\/$/, "");

    const callback_url = `${siteUrl}/learn/account?paid=1&programme=${programmeId}`;

    const result = await initializeTransaction({
      email,
      amount,
      currency,
      reference,
      callback_url,
      metadata: {
        programme_id: programmeId,
        plan_id: planId,
        product: "super_cube_lms",
        price_display:
          currency === "USD"
            ? programme.priceUsd
            : programme.priceZar,
        currency,
        full_name: fullName || undefined,
        custom_fields: [
          {
            display_name: "Programme",
            variable_name: "programme",
            value: programme.name,
          },
        ],
      },
    });

    return NextResponse.json({
      configured: true,
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
      access_code: result.data.access_code,
      publicKey: paystackPublicKey(),
      amount,
      currency,
      programmeId,
      planId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Health / config probe for pricing UI */
export async function GET() {
  const currency = paystackCurrency();
  return NextResponse.json({
    configured: paystackConfigured(),
    publicKey: paystackPublicKey() ? true : false,
    currency,
  });
}
