import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const NEWSLETTER_TABLE = "newsletter_subscribers";

export const CONSENT_TEXT =
  "I agree that Super-Cube® may email me leadership tips and programme updates. I can unsubscribe at any time.";

export type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  consent_text: string;
  consent_at: string;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
  created_at: string;
  /** Double opt-in: set when the confirmation link was used. */
  confirmed_at?: string | null;
  confirm_sent_at?: string | null;
};

export type SubscriberStatus = "active" | "pending" | "unsubscribed";

/** Active = confirmed and not unsubscribed (the only people campaigns go to). */
export function subscriberStatus(s: Pick<Subscriber, "unsubscribed_at" | "confirmed_at">): SubscriberStatus {
  if (s.unsubscribed_at) return "unsubscribed";
  return s.confirmed_at ? "active" : "pending";
}

let warnedUrl = false;

/** Public project URL (not a secret). Used if the env value is missing/invalid. */
const DEFAULT_SUPABASE_URL = "https://scsgmmyjrulwoymegsid.supabase.co";

export function supabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || "";
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(raw)) return raw.replace(/\/$/, "");
  // Local development / CI stack only (never on Vercel)
  if (!process.env.VERCEL && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/i.test(raw)) return raw.replace(/\/$/, "");
  if (!warnedUrl) {
    warnedUrl = true;
    console.warn(
      `[newsletter] NEXT_PUBLIC_SUPABASE_URL is ${raw ? "not a valid https://<ref>.supabase.co URL" : "missing"}; using the project default`
    );
  }
  return DEFAULT_SUPABASE_URL;
}

export function serviceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

/**
 * Service-role client for the newsletter table (server only).
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY. Without it, signups fall back to the
 * server log and the admin page reports that the store isn't configured.
 */
export function newsletterDb(): SupabaseClient | null {
  const key = serviceKey();
  if (!key) return null;
  return createClient(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function siteOrigin(req?: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (req) {
    try {
      const u = new URL(req.url);
      if (u.hostname.endsWith(".vercel.app") || u.hostname === "localhost") return u.origin;
    } catch {}
  }
  return env || "https://www.super-cube.me";
}

export function unsubscribeUrl(token: string, origin = siteOrigin()): string {
  return `${origin}/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
}
