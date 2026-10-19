import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createAnonServerClient } from "@supabase/supabase-js";
import { isCertId, normaliseCertId, toPublicCertificate, type LookupResult } from "@/lib/lms/verify";

const COLUMNS = "id, learner_name, programme_id, issued_at, revoked, revoked_at";

/**
 * Look up one certificate by its exact ID. Never lists, never returns scores.
 * Uses the service role when the server has it; otherwise the anon-callable
 * verify_certificate() RPC, which returns the same public columns for one ID.
 */
export async function lookupCertificate(raw: unknown): Promise<LookupResult> {
  const id = normaliseCertId(raw);
  if (!isCertId(id)) return { status: "invalid" };

  type Row = Parameters<typeof toPublicCertificate>[0];
  let row: Row | null = null;

  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("certificates").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) return { status: "unavailable" };
    row = (data as Row | null) ?? null;
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { status: "unavailable" };
    const anon = createAnonServerClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await anon.rpc("verify_certificate", { p_id: id });
    if (error) return { status: "unavailable" };
    const list = (Array.isArray(data) ? data : data ? [data] : []) as Row[];
    row = list[0] ?? null;
  }

  if (!row) return { status: "not_found" };
  const certificate = toPublicCertificate(row);
  return certificate.revoked ? { status: "revoked", certificate } : { status: "found", certificate };
}
