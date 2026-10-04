import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

/** Emails allowed into the newsletter admin (comma-separated env override). */
export function adminEmails(): string[] {
  const raw = process.env.NEWSLETTER_ADMIN_EMAILS?.trim() || "craig@bigfivegroup.africa";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function secretMatches(given: string): boolean {
  const expected = process.env.NEWSLETTER_ADMIN_SECRET?.trim();
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Admin check. Either:
 *  - a signed-in Super-Cube account (Supabase session) whose email is in
 *    NEWSLETTER_ADMIN_EMAILS (default craig@bigfivegroup.africa), or
 *  - "Authorization: Bearer <NEWSLETTER_ADMIN_SECRET>" (same pattern as
 *    bigfivegroup.africa, for scripted CSV export) when that env var is set.
 */
export async function getNewsletterAdmin(
  req?: Request
): Promise<{ ok: true; email: string } | { ok: false; signedInAs?: string }> {
  if (req) {
    const auth = req.headers.get("authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (secretMatches(bearer)) return { ok: true, email: "secret" };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (email && adminEmails().includes(email)) return { ok: true, email };
  return { ok: false, signedInAs: email };
}
