import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Push non-journal progress snapshot for coach dashboards.
 * Body: { orgCode, programmeId, pathwayPct, lessonsCompleted, preOverall, postOverall, growth, certificateId }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgCode = String(body.orgCode || "")
      .trim()
      .toUpperCase();
    if (!orgCode) {
      return NextResponse.json({ error: "orgCode required" }, { status: 400 });
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

    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .ilike("code", orgCode)
      .eq("active", true)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ error: "Unknown org" }, { status: 404 });
    }

    // Ensure membership
    await supabase.from("org_members").upsert(
      {
        org_id: org.id,
        user_id: user.id,
        role: "learner",
        display_name: user.email,
      },
      { onConflict: "org_id,user_id" }
    );

    const row = {
      org_id: org.id,
      user_id: user.id,
      programme_id: body.programmeId ?? null,
      pathway_pct: Number(body.pathwayPct) || 0,
      lessons_completed: Number(body.lessonsCompleted) || 0,
      pre_overall: body.preOverall ?? null,
      post_overall: body.postOverall ?? null,
      growth: body.growth ?? null,
      certificate_id: body.certificateId ?? null,
      client_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("org_progress_snapshots")
      .upsert(row, { onConflict: "org_id,user_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Progress push failed" },
      { status: 500 }
    );
  }
}
