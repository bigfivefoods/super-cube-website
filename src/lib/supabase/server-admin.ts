import { createAdminClient } from "@/lib/supabase/admin";

export { createAdminClient };

/** Ensure a profile row exists for a user (webhook / payment flows). */
export async function ensureProfile(opts: {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  programmeId?: string | null;
}) {
  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "Admin client missing" };

  const { error } = await admin.from("profiles").upsert(
    {
      id: opts.userId,
      email: opts.email ?? null,
      full_name: opts.fullName ?? null,
      programme_id: opts.programmeId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
