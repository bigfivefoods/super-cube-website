import { NEWSLETTER_TABLE, newsletterDb, siteOrigin } from "@/lib/newsletter/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confirmation links work for 14 days after they were sent. */
export const CONFIRM_TTL_DAYS = 14;

export function confirmUrl(token: string, origin = siteOrigin()): string {
  return `${origin}/newsletter/confirm?t=${encodeURIComponent(token)}`;
}

export type ConfirmLookup =
  | { state: "pending"; email: string }
  | { state: "confirmed" }
  | { state: "expired" }
  | { state: "invalid" }
  | { state: "unavailable" };

type Row = {
  id: string;
  email: string;
  confirmed_at: string | null;
  confirm_sent_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
};

async function findByToken(token: string): Promise<{ row: Row | null; ok: boolean }> {
  if (!UUID.test(token)) return { row: null, ok: true };
  const db = newsletterDb();
  if (!db) return { row: null, ok: false };
  const { data, error } = await db
    .from(NEWSLETTER_TABLE)
    .select("id,email,confirmed_at,confirm_sent_at,unsubscribed_at,created_at")
    .eq("confirm_token", token)
    .maybeSingle();
  if (error) {
    console.error("[newsletter] confirm lookup failed", error.message);
    return { row: null, ok: false };
  }
  return { row: (data as Row | null) ?? null, ok: true };
}

function expired(row: Row, now = Date.now()) {
  const sent = Date.parse(row.confirm_sent_at || row.created_at);
  return now - sent > CONFIRM_TTL_DAYS * 86400_000;
}

/** Masks an address for display on the confirm page: c****@bigfivegroup.africa */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "your address";
  return `${user[0]}${"*".repeat(Math.max(2, Math.min(6, user.length - 1)))}@${domain}`;
}

export async function lookupConfirmToken(token: string): Promise<ConfirmLookup> {
  const { row, ok } = await findByToken(token.trim());
  if (!ok) return { state: "unavailable" };
  if (!row || row.unsubscribed_at) return { state: "invalid" };
  if (row.confirmed_at) return { state: "confirmed" };
  if (expired(row)) return { state: "expired" };
  return { state: "pending", email: row.email };
}

/**
 * Confirms a pending subscription. Idempotent: an already-confirmed token reports "confirmed".
 * Returns the email on a fresh confirmation (for optional forwarding to a provider).
 */
export async function confirmByToken(
  token: string,
  ipHash: string | null,
): Promise<{ result: "confirmed"; email?: string } | { result: "expired" | "invalid" | "unavailable" }> {
  const look = await lookupConfirmToken(token);
  if (look.state === "confirmed") return { result: "confirmed" };
  if (look.state !== "pending") return { result: look.state };
  const db = newsletterDb();
  if (!db) return { result: "unavailable" };
  const now = new Date().toISOString();
  const { data, error } = await db
    .from(NEWSLETTER_TABLE)
    .update({ confirmed_at: now, confirm_ip_hash: ipHash, updated_at: now })
    .eq("confirm_token", token.trim())
    .is("confirmed_at", null)
    .is("unsubscribed_at", null)
    .select("email");
  if (error) {
    console.error("[newsletter] confirm failed", error.message);
    return { result: "unavailable" };
  }
  const email = (data as { email: string }[] | null)?.[0]?.email;
  return { result: "confirmed", email };
}
