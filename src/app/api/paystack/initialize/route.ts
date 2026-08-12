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
import {
  getSeatPack,
  isSeatPackId,
  seatPackAmountCents,
  seatPackListPrice,
} from "@/lib/seat-packs";

function isValidEmail(email: string) {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes("@demo.local")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productType =
      body.productType === "seat_pack" ? "seat_pack" : "single";
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const fullName = String(body.fullName || "").trim();
    const orgName = String(body.orgName || "").trim().slice(0, 120);

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
          "Paystack is not configured. Set PAYSTACK_SECRET_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.",
      });
    }

    const currency = paystackCurrency();
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me"
    ).replace(/\/$/, "");

    // ── Seat pack (school / company) ─────────────────────────────
    if (productType === "seat_pack") {
      const packId = String(body.packId || "");
      if (!isSeatPackId(packId)) {
        return NextResponse.json({ error: "Invalid seat pack" }, { status: 400 });
      }
      const pack = getSeatPack(packId)!;
      if (!orgName) {
        return NextResponse.json(
          { error: "Organisation or school name is required for seat packs." },
          { status: 400 }
        );
      }

      const programmeId = (String(body.programmeId || "adults") ||
        "adults") as ProgrammeId;
      const programme = programmes.find((p) => p.id === programmeId);
      const planId = `pack_${packId}_${programmeId}`;
      const amount = seatPackAmountCents(pack, currency);
      const reference = makePaymentReference(`pack_${pack.seats}`);
      const callback_url = `${siteUrl}/learn/account?paid=1&pack=1&programme=${programmeId}`;

      const result = await initializeTransaction({
        email,
        amount,
        currency,
        reference,
        callback_url,
        metadata: {
          product: "super_cube_seat_pack",
          product_type: "seat_pack",
          pack_id: pack.id,
          seats: pack.seats,
          programme_id: programmeId,
          plan_id: planId,
          org_name: orgName,
          currency,
          price_display: seatPackListPrice(pack, currency),
          full_name: fullName || undefined,
          custom_fields: [
            {
              display_name: "Seat pack",
              variable_name: "seat_pack",
              value: `${pack.seats} seats · ${orgName}`,
            },
            {
              display_name: "Programme",
              variable_name: "programme",
              value: programme?.name || programmeId,
            },
          ],
        },
      });

      return NextResponse.json({
        configured: true,
        productType: "seat_pack",
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
        access_code: result.data.access_code,
        publicKey: paystackPublicKey(),
        amount,
        currency,
        seats: pack.seats,
        packId: pack.id,
        planId,
        programmeId,
      });
    }

    // ── Single learner ───────────────────────────────────────────
    const programmeId = String(body.programmeId || "") as ProgrammeId;
    const planId = String(body.planId || `${programmeId}_once`);
    const programme = programmes.find((p) => p.id === programmeId);
    if (!programme) {
      return NextResponse.json({ error: "Invalid programme" }, { status: 400 });
    }

    const amount = courseAmountCents(currency, programme);
    const reference = makePaymentReference(programmeId);
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
        product_type: "single",
        price_display:
          currency === "USD" ? programme.priceUsd : programme.priceZar,
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
      productType: "single",
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

export async function GET() {
  const currency = paystackCurrency();
  return NextResponse.json({
    configured: paystackConfigured(),
    publicKey: paystackPublicKey() ? true : false,
    currency,
  });
}
