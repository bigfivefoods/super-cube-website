import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";

/**
 * Paystack webhook receiver.
 * On charge.success / subscription.create, upsert subscription row via service role.
 * Wire SUPABASE_SERVICE_ROLE_KEY when going live.
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
      data: Record<string, unknown>;
    };

    // TODO: update public.subscriptions with service role client
    // based on event.event and event.data.customer / subscription codes
    console.info("[paystack webhook]", event.event);

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
