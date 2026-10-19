import { NextResponse } from "next/server";
import { sessionCount } from "@/lib/lms/curriculum-meta";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Org = { id: string; name: string; code: string; kind: string };

/**
 * Organisation results for org admins. Runs as the signed-in user (never the
 * service role): org_results() checks private.is_org_admin() against the
 * caller's JWT and returns aggregates only.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign_in" }, { status: 401 });

  // Orgs this user administers (RLS: own memberships + orgs they own or belong to)
  const [{ data: mems }, { data: owned }] = await Promise.all([
    supabase.from("org_members").select("organisations(id, name, code, kind)").eq("user_id", user.id).eq("role", "admin"),
    supabase.from("organisations").select("id, name, code, kind").eq("owner_user_id", user.id),
  ]);
  const byId = new Map<string, Org>();
  for (const m of (mems ?? []) as unknown as { organisations: Org | null }[]) {
    if (m.organisations) byId.set(m.organisations.id, m.organisations);
  }
  for (const o of (owned ?? []) as Org[]) byId.set(o.id, o);
  const orgs = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));

  if (orgs.length === 0) return NextResponse.json({ error: "not_admin", orgs: [] }, { status: 403 });

  const wanted = new URL(request.url).searchParams.get("org") ?? "";
  if (wanted && !UUID_RE.test(wanted)) return NextResponse.json({ error: "bad_org" }, { status: 400 });
  const orgId = wanted || orgs[0].id;

  const totals = { kids: sessionCount("kids"), adolescents: sessionCount("adolescents"), adults: sessionCount("adults") };
  const { data, error } = await supabase.rpc("org_results", { p_org: orgId, p_session_totals: totals });
  if (error) {
    if (error.code === "42501") return NextResponse.json({ error: "not_admin", orgs }, { status: 403 });
    if (error.code === "PGRST202" || error.code === "42883") {
      return NextResponse.json({ error: "not_ready", orgs }, { status: 503 });
    }
    return NextResponse.json({ error: "unavailable", orgs }, { status: 503 });
  }
  return NextResponse.json(
    { orgs, results: data },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
