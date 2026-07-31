import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { programmes } from "@/lib/programmes";

/**
 * Paystack webhook — charge.success activates subscription when possible.
 * Configure URL in Paystack dashboard:
 *   https://www.super-cube.me/api/paystack/webhook
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
        customer?: { email?: string; customer_code?: string };
        metadata?: Record<string, unknown>;
      };
    };

    console.info("[paystack webhook]", event.event, event.data?.reference);

    if (
      event.event === "charge.success" ||
      event.event === "subscription.create"
    ) {
      const data = event.data;
      const meta = data.metadata || {};
      const programmeId = String(meta.programme_id || "");
      const planId = String(meta.plan_id || `${programmeId}_once`);
      const programme = programmes.find((p) => p.id === programmeId);
      const email = data.customer?.email;
      const admin = createAdminClient();

      if (admin && programme && email) {
        const { data: listed } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const user = listed?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (user) {
          await admin.from("profiles").upsert({
            id: user.id,
            email,
            programme_id: programmeId,
            updated_at: new Date().toISOString(),
          });

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

          await admin.from("subscriptions").insert({
            user_id: user.id,
            plan_id: planId,
            programme_id: programmeId,
            status: "active",
            paystack_customer_code: data.customer?.customer_code ?? null,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[paystack webhook]", e);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
