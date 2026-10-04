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
};

let warned = false;

/**
 * Service-role client for the newsletter table (server only).
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY. The production Vercel project currently
 * has this variable saved as "UPABASE_SERVICE_ROLE_KEY" (missing the S); the
 * fallback below keeps signups working until it is renamed. Remove the
 * fallback once the env var is fixed.
 */
export function newsletterDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key && process.env.UPABASE_SERVICE_ROLE_KEY?.trim()) {
    key = process.env.UPABASE_SERVICE_ROLE_KEY.trim();
    if (!warned) {
      warned = true;
      console.warn(
        "[newsletter] using misspelled env UPABASE_SERVICE_ROLE_KEY; rename to SUPABASE_SERVICE_ROLE_KEY"
      );
    }
  }
  if (!url || !key) return null;
  return createClient(url, key, {
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
