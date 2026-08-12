import { createHmac, timingSafeEqual } from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export type PaystackCurrency = "ZAR" | "USD";

/** Default checkout currency — ZAR for South Africa; override with PAYSTACK_CURRENCY */
export function paystackCurrency(): PaystackCurrency {
  const c = (process.env.PAYSTACK_CURRENCY || "ZAR").toUpperCase();
  return c === "USD" ? "USD" : "ZAR";
}

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function paystackPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || null;
}

export async function paystackRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data.message || `Paystack error ${res.status}`);
  }
  return data as T;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // smallest currency unit (cents)
  currency?: PaystackCurrency;
  plan?: string;
  callback_url: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      currency: params.currency || paystackCurrency(),
      email: params.email,
      amount: params.amount,
      plan: params.plan,
      callback_url: params.callback_url,
      reference: params.reference,
      metadata: params.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackRequest<{
    status: boolean;
    data: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      paid_at?: string;
      customer: { email?: string; customer_code?: string };
      metadata?: Record<string, unknown>;
    };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** HMAC SHA512 — required for production webhooks */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.PAYSTACK_SKIP_VERIFY === "true"
  ) {
    return true;
  }
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return false;
  try {
    const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Unique payment reference for idempotency */
export function makePaymentReference(programmeId: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const t = Date.now().toString(36);
  return `sc_${programmeId}_${t}_${rand}`.slice(0, 100);
}
