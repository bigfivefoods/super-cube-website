import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ID_RE = /^SC-\d{8}-[0-9A-F]{6,12}$/;

/**
 * Certificates are issued only by POST /api/certificates/issue (signed-in, server-scored).
 * This legacy endpoint no longer accepts writes.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Certificates are issued by the server only. Use Learn → Report while signed in." },
    { status: 410 },
  );
}

/** Public lookup for the verify page. Returns found | not_found | unavailable. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim().toUpperCase() ?? "";
  if (!id) return NextResponse.json({ status: "invalid", found: false }, { status: 400 });
  if (!ID_RE.test(id)) {
    return NextResponse.json({ status: "invalid", found: false });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ status: "unavailable", found: false }, { status: 503 });
  }

  const { data, error } = await admin
    .from("certificates")
    .select("id, learner_name, programme_id, pre_overall, post_overall, growth, issued_at, org_code, revoked")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ status: "unavailable", found: false }, { status: 503 });
  }
  if (!data) return NextResponse.json({ status: "not_found", found: false });
  if (data.revoked) return NextResponse.json({ status: "revoked", found: false });

  const { revoked: _r, ...certificate } = data;
  return NextResponse.json({ status: "found", found: true, certificate });
}
