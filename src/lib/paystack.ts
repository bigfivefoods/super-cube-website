const PAYSTACK_BASE = "https://api.paystack.co";

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export async function paystackRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
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
  amount: number; // smallest currency unit (e.g. USD cents)
  currency?: string; // e.g. 'USD' | 'ZAR'
  plan?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      currency: "USD",
      ...params,
    }),
  });
}

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  // Optional: HMAC SHA512 with PAYSTACK_SECRET_KEY
  // Production should implement crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (!signature) return false;
  if (process.env.NODE_ENV !== "production" && process.env.PAYSTACK_SKIP_VERIFY === "true") {
    return true;
  }
  try {
    // Dynamic import avoidance — simple compare path for scaffold
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto") as typeof import("crypto");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    return hash === signature;
  } catch {
    return false;
  }
}
