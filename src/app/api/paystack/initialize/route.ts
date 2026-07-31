import { NextResponse } from "next/server";
import {
  initializeTransaction,
  paystackConfigured,
} from "@/lib/paystack";
import { COURSE_PRICE_USD, programmes } from "@/lib/programmes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const programmeId = body.programmeId as string;
    const planId = (body.planId as string) || `${programmeId}_once`;
    const email = (body.email as string) || "learner@demo.local";

    const programme = programmes.find((p) => p.id === programmeId);
    if (!programme) {
      return NextResponse.json({ error: "Invalid programme" }, { status: 400 });
    }

    // Paystack amount is in the smallest currency unit (cents for USD)
    const amountCents = (programme.priceUsd || COURSE_PRICE_USD) * 100;

    if (!paystackConfigured()) {
      return NextResponse.json({
        demo: true,
        message: "Paystack not configured — use demo access on pricing page",
      });
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me"
    ).replace(/\/$/, "");

    const result = await initializeTransaction({
      email,
      amount: amountCents,
      currency: "USD",
      callback_url: `${siteUrl}/learn/account?paid=1&programme=${programmeId}`,
      metadata: {
        programme_id: programmeId,
        plan_id: planId,
        product: "super_cube_lms",
        price_usd: programme.priceUsd,
      },
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
      access_code: result.data.access_code,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
