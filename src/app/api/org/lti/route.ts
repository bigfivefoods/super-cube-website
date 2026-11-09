import { NextResponse } from "next/server";
import { LtiProtocolError } from "@/lib/lti/errors";
import { registrationFrom } from "@/lib/lti/register";
import { createSupabaseLtiStore } from "@/lib/lti/supabase-store";
import { toolUrls } from "@/lib/lti/urls";
import { requestOrigin } from "@/lib/lti/urls";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Org = { id: string; name: string; code: string };

/** Organisation admins register an LTI 1.3 platform and read the tool's addresses. */
export async function GET(request: Request) {
  const gate = await adminOrgs();
  if (!gate.ok) return gate.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  try {
    const platforms = await createSupabaseLtiStore(admin).listPlatforms(gate.orgs.map((org) => org.id));
    return NextResponse.json({
      orgs: gate.orgs,
      platforms: platforms.map(publicPlatform),
      tool: toolUrls(requestOrigin(request)),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const gate = await adminOrgs();
  if (!gate.ok) return gate.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const orgId = String(body.orgId || gate.orgs[0]?.id || "");
  if (!gate.orgs.some((org) => org.id === orgId)) return NextResponse.json({ error: "not_admin" }, { status: 403 });
  try {
    const input = registrationFrom(body, orgId);
    const saved = await createSupabaseLtiStore(admin).savePlatform(input);
    return NextResponse.json({ platform: publicPlatform(saved) }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  const gate = await adminOrgs();
  if (!gate.ok) return gate.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!UUID.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const store = createSupabaseLtiStore(admin);
    const row = await store.getPlatform(id);
    if (!row || !gate.orgs.some((org) => org.id === row.orgId)) {
      return NextResponse.json({ error: "not_admin" }, { status: 403 });
    }
    await store.deletePlatform(id, row.orgId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

function publicPlatform(row: {
  id: string;
  orgId: string;
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
  tokenUrl: string;
  jwksUrl: string;
}) {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    issuer: row.issuer,
    clientId: row.clientId,
    deploymentId: row.deploymentId,
    authLoginUrl: row.authLoginUrl,
    tokenUrl: row.tokenUrl,
    jwksUrl: row.jwksUrl,
  };
}

function fail(error: unknown) {
  if (error instanceof LtiProtocolError) {
    return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "unavailable" }, { status: 503 });
}

async function adminOrgs(): Promise<{ ok: true; orgs: Org[] } | { ok: false; response: NextResponse }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, response: NextResponse.json({ error: "unavailable" }, { status: 503 }) };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "sign_in" }, { status: 401 }) };
  const [{ data: mems }, { data: owned }] = await Promise.all([
    supabase.from("org_members").select("organisations(id, name, code)").eq("user_id", user.id).eq("role", "admin"),
    supabase.from("organisations").select("id, name, code").eq("owner_user_id", user.id),
  ]);
  const byId = new Map<string, Org>();
  for (const row of (mems ?? []) as unknown as { organisations: Org | Org[] | null }[]) {
    const org = Array.isArray(row.organisations) ? row.organisations[0] : row.organisations;
    if (org?.id) byId.set(org.id, org);
  }
  for (const org of (owned ?? []) as Org[]) if (org?.id) byId.set(org.id, org);
  const orgs = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (orgs.length === 0) return { ok: false, response: NextResponse.json({ error: "not_admin" }, { status: 403 }) };
  return { ok: true, orgs };
}
