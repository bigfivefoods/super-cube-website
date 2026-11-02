import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Org = { id: string; name: string; code: string; kind: string };

/**
 * Self vs others for an organisation. Runs as the signed-in user: the SQL
 * function checks private.is_org_admin and returns aggregates of learners
 * who currently share progress.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign_in" }, { status: 401 });

  const [{ data: mems }, { data: owned }] = await Promise.all([
    supabase.from("org_members").select("organisations(id, name, code, kind)").eq("user_id", user.id).eq("role", "admin"),
    supabase.from("organisations").select("id, name, code, kind").eq("owner_user_id", user.id),
  ]);
  const byId = new Map<string, Org>();
  for (const m of (mems ?? []) as unknown as { organisations: Org | null }[]) {
    if (m.organisations) byId.set(m.organisations.id, m.organisations);
  }
  for (const o of (owned ?? []) as Org[]) byId.set(o.id, o);
  if (byId.size === 0) return NextResponse.json({ error: "not_admin" }, { status: 403 });

  const wanted = new URL(request.url).searchParams.get("org") ?? "";
  if (wanted && !UUID_RE.test(wanted)) return NextResponse.json({ error: "bad_org" }, { status: 400 });
  const orgId = wanted && byId.has(wanted) ? wanted : [...byId.keys()][0];
  const { data, error } = await supabase.rpc("org_checkin_comparison", { p_org: orgId });
  if (error) {
    if (error.code === "42501") return NextResponse.json({ error: "not_admin" }, { status: 403 });
    if (error.code === "PGRST202" || error.code === "42883") return NextResponse.json({ error: "not_ready" }, { status: 503 });
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  return NextResponse.json({ comparison: data }, { headers: { "Cache-Control": "private, no-store" } });
}
