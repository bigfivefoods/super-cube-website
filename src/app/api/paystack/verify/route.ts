import { after, NextResponse } from "next/server";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { fulfilPaystackCharge } from "@/lib/lms/server/paystack-fulfil";
import { programmes } from "@/lib/programmes";
import { sendEmail } from "@/lib/email";
import { emailSiteUrl } from "@/lib/email/layout";
import { receiptEmail, seatPackEmail } from "@/lib/email/templates";
import { hit } from "@/lib/server/rate-limit";

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
    const siteUrl = emailSiteUrl();

    if (f.productType === "seat_pack") {
      const code = f.org?.code;
      if (email) {
        const mail = seatPackEmail({
          site: siteUrl,
          programmeId: f.programmeId,
          code: code ?? null,
          seats: Number(f.seats) || 0,
          amountMinor: Number(data.amount) || 0,
          currency: data.currency,
          reference,
          paidAt: data.paid_at,
        });
        sendReceiptOnce(reference, {
          to: email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
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
      const mail = receiptEmail({
        site: siteUrl,
        programmeId: programme.id,
        amountMinor: Number(data.amount) || 0,
        currency: data.currency,
        reference,
        paidAt: data.paid_at,
        email,
      });
      sendReceiptOnce(reference, {
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
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

/**
 * Send the receipt after the response, at most once a day per reference:
 * this route is public (anyone holding a reference can call it), so repeat
 * calls must not turn into repeat emails to the payer.
 */
function sendReceiptOnce(reference: string, payload: Parameters<typeof sendEmail>[0]) {
  after(async () => {
    const first = await hit("email-receipt", [`ref:${reference}`]);
    if (!first.allowed) return;
    const r = await sendEmail(payload);
    if (!r.ok) console.error("[paystack verify] receipt send failed", r.provider);
  });
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
