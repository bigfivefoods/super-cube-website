import { NextResponse } from "next/server";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { fulfilPaystackCharge } from "@/lib/lms/server/paystack-fulfil";
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
    if (data.status !== "success") {
      return NextResponse.json({ paid: false, status: data.status, reference });
    }

    // Everything below comes from Paystack's own record of the transaction.
    // Body fields (programme, seats, email) are ignored on purpose.
    const f = await fulfilPaystackCharge(data);
    if (!f.ok) {
      return NextResponse.json(
        { paid: false, reference, error: f.reason, expectedAmount: f.expectedAmount },
        { status: 402 }
      );
    }
    const email = data.customer?.email || "";
    const programme = programmes.find((p) => p.id === f.programmeId);
    const amountMajor = (Number(data.amount) / 100).toFixed(2);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me").replace(/\/$/, "");

    if (f.productType === "seat_pack") {
      const code = f.org?.code;
      if (email) {
        void sendEmail({
          to: email,
          subject: code
            ? `Cohort ready · Super-Cube® code ${code}`
            : `Payment confirmed · Super-Cube® seat pack`,
          html: `
            <p>Thank you for your seat pack purchase.</p>
            ${
              code
                ? `<p><strong>Learner code: ${code}</strong><br/>Share this code with learners (Learn → Org). Create coach invites from Learn → Coach.</p>`
                : `<p>We could not auto-create a cohort because no Super-Cube account matches this payment. Sign in, then contact hello@super-cube.me with reference ${reference}.</p>`
            }
            <p>Seats: ${f.seats} · Amount: ${data.currency} ${amountMajor}<br/>Reference: ${reference}</p>
            <p><a href="${siteUrl}/learn/coach">Open coach tools →</a></p>
          `,
          text: code
            ? `Learner code ${code}. Reference ${reference}.`
            : `Seat pack paid. Sign in to claim your cohort. Reference ${reference}.`,
          tags: ["paystack-seat-pack"],
        });
      }
      return NextResponse.json({
        paid: true,
        productType: "seat_pack",
        reference,
        programmeId: f.programmeId,
        planId: f.planId,
        amount: data.amount,
        currency: data.currency,
        email,
        seats: f.seats,
        packId: f.packId,
        org: f.org || null,
        orgOk: f.orgOk,
        orgReason: f.orgReason,
        subscriptionSaved: f.subscriptionSaved,
        activateLocal: {
          programmeId: f.programmeId,
          planId: f.planId,
          status: "active" as const,
          paystackReference: reference,
          orgCode: f.org?.code,
          seats: f.seats,
        },
      });
    }

    if (email && programme) {
      void sendEmail({
        to: email,
        subject: `Payment confirmed · Super-Cube® ${programme.name}`,
        html: `
          <p>Thank you for your payment.</p>
          <p><strong>${programme.name}</strong> is unlocked on Super-Cube® Learn.</p>
          <p>Amount: ${data.currency} ${amountMajor}<br/>Reference: ${reference}</p>
          <p><a href="${siteUrl}/learn">Open Learn →</a></p>
        `,
        text: `Payment confirmed for ${programme.name}. Reference ${reference}.`,
        tags: ["paystack-receipt"],
      });
    }

    return NextResponse.json({
      paid: true,
      productType: "single",
      reference,
      programmeId: f.programmeId,
      planId: f.planId,
      amount: data.amount,
      currency: data.currency,
      email,
      subscriptionSaved: f.subscriptionSaved,
      cloudReason: f.reason,
      activateLocal: {
        programmeId: f.programmeId,
        planId: f.planId,
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
      body: JSON.stringify({ reference }),
    })
  );
}
