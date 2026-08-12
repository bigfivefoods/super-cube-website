import { NextResponse } from "next/server";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { activateSubscriptionInSupabase } from "@/lib/lms/activate-subscription-server";
import { programmes } from "@/lib/programmes";
import { sendEmail } from "@/lib/email";

/**
 * Verify Paystack transaction after redirect (?reference=...).
 * Always returns activateLocal for device unlock; cloud when user exists.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = String(body.reference || "").trim();
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    if (!paystackConfigured()) {
      return NextResponse.json({
        demo: true,
        paid: false,
        message: "Paystack not configured",
      });
    }

    const result = await verifyTransaction(reference);
    const data = result.data;
    const paid = data.status === "success";
    const meta = data.metadata || {};
    const programmeId = String(
      meta.programme_id || body.programmeId || ""
    );
    const planId = String(meta.plan_id || `${programmeId}_once`);
    const programme = programmes.find((p) => p.id === programmeId);
    const email =
      data.customer?.email ||
      (typeof body.email === "string" ? body.email : "") ||
      "";

    if (!paid) {
      return NextResponse.json({
        paid: false,
        status: data.status,
        reference,
      });
    }

    const cloud = await activateSubscriptionInSupabase({
      email,
      programmeId,
      planId,
      paystackReference: reference,
      paystackCustomerCode: data.customer?.customer_code,
      amountCents: data.amount,
      currency: data.currency,
    });

    // Receipt email (best-effort)
    if (email && programme) {
      const amountMajor = (data.amount / 100).toFixed(2);
      void sendEmail({
        to: email,
        subject: `Payment confirmed · Super-Cube® ${programme.name}`,
        html: `
          <p>Thank you for your payment.</p>
          <p><strong>${programme.name}</strong> is unlocked on Super-Cube® Learn.</p>
          <p>Amount: ${data.currency} ${amountMajor}<br/>Reference: ${reference}</p>
          <p><a href="${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me").replace(/\/$/, "")}/learn">Open Learn →</a></p>
        `,
        text: `Payment confirmed for ${programme.name}. Reference ${reference}. Open Learn to continue.`,
        tags: ["paystack-receipt"],
      });
    }

    return NextResponse.json({
      paid: true,
      reference,
      programmeId,
      planId,
      amount: data.amount,
      currency: data.currency,
      email: email || data.customer?.email,
      subscriptionSaved: cloud.saved,
      cloudReason: cloud.reason,
      activateLocal: {
        programmeId: programmeId || "adults",
        planId,
        status: "active" as const,
        paystackReference: reference,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verify failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }
  return POST(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        programmeId: url.searchParams.get("programme") || undefined,
        email: url.searchParams.get("email") || undefined,
      }),
    })
  );
}
