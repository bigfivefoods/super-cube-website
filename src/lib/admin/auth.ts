import type { SupabaseClient } from "@supabase/supabase-js";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { newsletterDb } from "@/lib/newsletter/db";

export type AdminContext =
  | { ok: true; email: string; db: SupabaseClient }
  | { ok: false; reason: "signed_out" | "not_configured" };

/**
 * The LMS admin console uses the existing admin role: a Super-Cube account on
 * NEWSLETTER_ADMIN_EMAILS, signed in through the admin sign-in form (signed,
 * httpOnly, 12-hour cookie). Learners, coaches and org admins never qualify.
 * All reads and writes then use the service role on the server.
 */
export async function requireLmsAdmin(): Promise<AdminContext> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) return { ok: false, reason: "signed_out" };
  const db = newsletterDb();
  if (!db) return { ok: false, reason: "not_configured" };
  return { ok: true, email: admin.email, db };
}

/** Append a row to the admin audit log. Never pass journals, answers or scores. */
export async function audit(
  db: SupabaseClient,
  actor: string,
  action: string,
  targetType: string,
  targetId: string | null,
  detail: Record<string, unknown> = {},
) {
  const { error } = await db.from("admin_audit_log").insert({
    actor,
    action,
    target_type: targetType,
    target_id: targetId,
    detail,
  });
  if (error) console.error("[admin] audit log write failed", error.message);
}
