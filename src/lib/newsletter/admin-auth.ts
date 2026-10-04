import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { serviceKey, supabaseUrl } from "@/lib/newsletter/db";

export const ADMIN_COOKIE = "sc_nl_admin";
const SESSION_HOURS = 12;

/** Emails allowed into the newsletter admin (comma-separated env override). */
export function adminEmails(): string[] {
  const raw = process.env.NEWSLETTER_ADMIN_EMAILS?.trim() || "craig@bigfivegroup.africa";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** HMAC key derived from a server-only secret (never sent to the browser). */
function signingKey(): string | null {
  const base = process.env.NEWSLETTER_SESSION_SECRET?.trim() || serviceKey();
  if (!base) return null;
  return createHash("sha256").update(`super-cube-newsletter-admin:${base}`).digest("hex");
}

function sign(payload: string): string | null {
  const key = signingKey();
  if (!key) return null;
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function makeSessionValue(email: string): string | null {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `${Buffer.from(email).toString("base64url")}.${exp}`;
  const sig = sign(payload);
  return sig ? `${payload}.${sig}` : null;
}

export const sessionMaxAge = SESSION_HOURS * 3600;

function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [e, exp, sig] = parts;
  const expected = sign(`${e}.${exp}`);
  if (!expected || !safeEqual(sig, expected)) return null;
  if (!(Number(exp) > Date.now())) return null;
  const email = Buffer.from(e, "base64url").toString().toLowerCase();
  return adminEmails().includes(email) ? email : null;
}

/**
 * Verify an admin's Super-Cube account password with Supabase Auth
 * (server-side), and check the email is on the admin list.
 */
export async function verifyAdminPassword(
  emailRaw: string,
  password: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!adminEmails().includes(email)) return { ok: false, error: "Email or password is incorrect." };
  const key = serviceKey();
  if (!key) return { ok: false, error: "Sign-in is not configured on this deployment." };
  const sb = createClient(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) return { ok: false, error: "Email or password is incorrect." };
  return { ok: true, email: data.user.email.toLowerCase() };
}

/**
 * Admin check. Either:
 *  - the signed admin cookie set after signing in at /newsletter/admin with a
 *    Super-Cube account on NEWSLETTER_ADMIN_EMAILS (default
 *    craig@bigfivegroup.africa), or
 *  - "Authorization: Bearer <NEWSLETTER_ADMIN_SECRET>" (bigfivegroup.africa
 *    pattern, for scripted CSV export) when that env var is set.
 */
export async function getNewsletterAdmin(
  req?: Request
): Promise<{ ok: true; email: string } | { ok: false }> {
  if (req) {
    const auth = req.headers.get("authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const expected = process.env.NEWSLETTER_ADMIN_SECRET?.trim();
    if (expected && bearer && safeEqual(bearer, expected)) return { ok: true, email: "api-secret" };
  }
  const jar = await cookies();
  const email = readSessionValue(jar.get(ADMIN_COOKIE)?.value);
  return email ? { ok: true, email } : { ok: false };
}
