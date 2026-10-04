import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ServerContext =
  | { ok: true; user: User; supabase: SupabaseClient; admin: SupabaseClient }
  | { ok: false; status: number; error: string };

/** Signed-in user + user-scoped client + service-role client (server only). */
export async function requireUser(): Promise<ServerContext> {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return { ok: false, status: 503, error: "Cloud learning is not configured" };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Sign in required" };
  return { ok: true, user, supabase, admin };
}
