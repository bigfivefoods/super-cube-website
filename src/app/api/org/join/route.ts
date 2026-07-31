import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Join an organisation by cohort code (authenticated). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    const role = body.role === "coach" ? "coach" : "learner";
    const displayName = String(body.displayName || "").trim() || null;

    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { data: org, error: orgErr } = await supabase
      .from("organisations")
      .select("id, code, name, kind")
      .ilike("code", code)
      .eq("active", true)
      .maybeSingle();

    if (orgErr || !org) {
      return NextResponse.json(
        { error: "Unknown or inactive cohort code" },
        { status: 404 }
      );
    }

    const { error: memErr } = await supabase.from("org_members").upsert(
      {
        org_id: org.id,
        user_id: user.id,
        role,
        display_name: displayName || user.email || null,
      },
      { onConflict: "org_id,user_id" }
    );

    if (memErr) {
      return NextResponse.json({ error: memErr.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      org: { id: org.id, code: org.code, name: org.name, kind: org.kind },
      role,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Join failed" },
      { status: 500 }
    );
  }
}
