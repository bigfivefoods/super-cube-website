/**
 * Who may receive a self-service email (welcome, weekly)?
 * Only the signed-in user, at their own confirmed address. The request body
 * never chooses the recipient, so these routes can't be used to email
 * arbitrary addresses.
 */
export type AuthUserLike = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

export type VerifiedRecipient = { userId: string; email: string; name: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function verifiedRecipient(user: AuthUserLike): VerifiedRecipient | null {
  if (!user?.id) return null;
  const email = String(user.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return null;
  if (email.endsWith("@demo.local") || email === "demo@super-cube.me") return null;
  if (!user.email_confirmed_at && !user.confirmed_at) return null;
  const meta = user.user_metadata ?? {};
  const raw = String(meta.full_name ?? meta.name ?? "").replace(/[\u0000-\u001f<>]/g, "").trim();
  return { userId: user.id, email, name: raw.slice(0, 80) };
}

/** A link in a self-service email must stay on the site (no open redirect via email). */
export function sameSiteUrl(raw: unknown, site: string, fallback: string): string {
  const s = String(raw ?? "").trim();
  if (!s) return fallback;
  try {
    const base = new URL(site);
    const u = new URL(s, base);
    return u.origin === base.origin ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}
