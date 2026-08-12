import { NextResponse } from "next/server";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { activateSubscriptionInSupabase } from "@/lib/lms/activate-subscription-server";
import { createOrgFromSeatPayment } from "@/lib/org/create-from-payment";
import { programmes } from "@/lib/programmes";
import { sendEmail } from "@/lib/email";

/**
 * Verify Paystack transaction after redirect.
 * Handles single-learner unlock and seat-pack → auto cohort code.
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
    const productType =
      String(meta.product_type || body.productType || "single") === "seat_pack"
        ? "seat_pack"
        : "single";
    const programmeId = String(
      meta.programme_id || body.programmeId || "adults"
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

    // ── Seat pack → create org + cohort code ─────────────────────
    if (productType === "seat_pack") {
      const seats = Number(meta.seats || body.seats || 0);
      const packId = String(meta.pack_id || body.packId || "");
      const orgName = String(meta.org_name || body.orgName || "Cohort");

      const orgResult = await createOrgFromSeatPayment({
        email,
        orgName,
        seats: seats || 10,
        packId: packId || "seats_10",
        paystackReference: reference,
        programmeId,
        kind: "school",
      });

      // Buyer also gets personal unlock for coaching
      const cloud = await activateSubscriptionInSupabase({
        email,
        programmeId,
        planId: planId || `pack_${packId}_${programmeId}`,
        paystackReference: reference,
        paystackCustomerCode: data.customer?.customer_code,
        amountCents: data.amount,
        currency: data.currency,
      });

      if (email) {
        const amountMajor = (data.amount / 100).toFixed(2);
        const code = orgResult.org?.code;
        void sendEmail({
          to: email,
          subject: code
            ? `Cohort ready · Super-Cube® code ${code}`
            : `Payment confirmed · Super-Cube® seat pack`,
          html: `
            <p>Thank you for your seat pack purchase.</p>
            ${
              code
                ? `<p><strong>Cohort code: ${code}</strong><br/>Share this code with learners (Learn → Org).</p>`
                : `<p>We could not auto-create a cohort because no signed-in Super-Cube account matches <strong>${email}</strong>. Sign up / sign in with this email, then contact hello@super-cube.me with reference ${reference}.</p>`
            }
            <p>Seats: ${seats || "—"} · Amount: ${data.currency} ${amountMajor}<br/>Reference: ${reference}</p>
            <p><a href="${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me").replace(/\/$/, "")}/learn/coach">Open coach tools →</a></p>
          `,
          text: code
            ? `Cohort code ${code}. Share with learners. Reference ${reference}.`
            : `Seat pack paid. Sign in with ${email} to claim cohort. Reference ${reference}.`,
          tags: ["paystack-seat-pack"],
        });
      }

      return NextResponse.json({
        paid: true,
        productType: "seat_pack",
        reference,
        programmeId,
        planId,
        amount: data.amount,
        currency: data.currency,
        email,
        seats,
        packId,
        org: orgResult.org || null,
        orgOk: orgResult.ok,
        orgReason: orgResult.reason,
        subscriptionSaved: cloud.saved,
        activateLocal: {
          programmeId,
          planId: planId || `pack_${packId}_${programmeId}`,
          status: "active" as const,
          paystackReference: reference,
          orgCode: orgResult.org?.code,
          seats,
        },
      });
    }

    // ── Single learner ───────────────────────────────────────────
    const cloud = await activateSubscriptionInSupabase({
      email,
      programmeId,
      planId,
      paystackReference: reference,
      paystackCustomerCode: data.customer?.customer_code,
      amountCents: data.amount,
      currency: data.currency,
    });

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
        text: `Payment confirmed for ${programme.name}. Reference ${reference}.`,
        tags: ["paystack-receipt"],
      });
    }

    return NextResponse.json({
      paid: true,
      productType: "single",
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
        productType: url.searchParams.get("pack") === "1" ? "seat_pack" : undefined,
      }),
    })
  );
}
