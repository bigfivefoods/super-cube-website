import { NextResponse } from "next/server";
import { paystackConfigured, paystackRequest } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { programmes } from "@/lib/programmes";

/**
 * Verify a Paystack transaction after redirect (?reference=...).
 * Activates subscription in Supabase when service role is configured.
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
        message: "Paystack not configured",
      });
    }

    const result = await paystackRequest<{
      status: boolean;
      data: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        customer: { email?: string; customer_code?: string };
        metadata?: Record<string, unknown>;
      };
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    const data = result.data;
    const paid = data.status === "success";
    const meta = data.metadata || {};
    const programmeId = String(meta.programme_id || body.programmeId || "");
    const planId = String(meta.plan_id || `${programmeId}_once`);
    const programme = programmes.find((p) => p.id === programmeId);

    if (!paid) {
      return NextResponse.json({
        paid: false,
        status: data.status,
        reference,
      });
    }

    const admin = createAdminClient();
    let subscriptionSaved = false;

    if (admin && programme) {
      // Prefer linking by email when user already exists in Auth
      const email = data.customer?.email || String(body.email || "");
      let userId: string | null = null;

      if (email) {
        const { data: listed } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const found = listed?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        userId = found?.id ?? null;
      }

      if (userId) {
        await admin.from("profiles").upsert({
          id: userId,
          email: email || null,
          programme_id: programmeId,
          updated_at: new Date().toISOString(),
        });

        // Ensure plan row exists (once plans)
        await admin.from("subscription_plans").upsert(
          {
            id: planId,
            programme_id: programmeId,
            name: `${programme.name} · one-time`,
            price_zar: programme.priceUsd * 100,
            interval: "once",
            active: true,
            features: ["full_pathway", "report", "certificate"],
          },
          { onConflict: "id" }
        );

        const { error } = await admin.from("subscriptions").insert({
          user_id: userId,
          plan_id: planId,
          programme_id: programmeId,
          status: "active",
          paystack_customer_code: data.customer?.customer_code ?? null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        });

        subscriptionSaved = !error;
        if (error) {
          console.warn("[paystack verify] subscription insert", error.message);
        }
      }
    }

    return NextResponse.json({
      paid: true,
      reference,
      programmeId,
      planId,
      amount: data.amount,
      currency: data.currency,
      email: data.customer?.email,
      subscriptionSaved,
      activateLocal: {
        programmeId,
        planId,
        status: "active" as const,
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
  // Reuse POST logic
  const res = await POST(
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
  return res;
}
