import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Register certificate ID for public verify (authenticated preferred). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "")
      .trim()
      .toUpperCase();
    if (!id || !/^SC-\d{8}-[0-9A-F]{6,12}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid certificate id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    const admin = createAdminClient();
    const client = admin || supabase;
    if (!client) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const row = {
      id,
      user_id: user?.id ?? null,
      learner_name: String(body.learnerName || user?.email || "Learner").slice(
        0,
        200
      ),
      programme_id: body.programmeId ?? null,
      pre_overall: body.preOverall ?? null,
      post_overall: body.postOverall ?? null,
      growth: body.growth ?? null,
      org_code: body.orgCode ?? null,
      issued_at: body.issuedAt || new Date().toISOString(),
      meta: body.meta || {},
    };

    const { error } = await client.from("certificates").upsert(row, {
      onConflict: "id",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Register failed" },
      { status: 500 }
    );
  }
}

/** Public lookup for verify page */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim().toUpperCase();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      found: false,
      formatValid: /^SC-\d{8}-[0-9A-F]{6,12}$/i.test(id),
      message: "Registry unavailable — format-only check",
    });
  }

  const { data, error } = await admin
    .from("certificates")
    .select(
      "id, learner_name, programme_id, pre_overall, post_overall, growth, issued_at, org_code"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    found: Boolean(data),
    formatValid: /^SC-\d{8}-[0-9A-F]{6,12}$/i.test(id),
    certificate: data,
  });
}
