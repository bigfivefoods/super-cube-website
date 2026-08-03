import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Coach roster: members + progress snapshots for an org the user coaches. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = String(url.searchParams.get("code") || "")
      .trim()
      .toUpperCase();

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

    // Find orgs where user is coach/admin
    const { data: memberships } = await supabase
      .from("org_members")
      .select("org_id, role, organisations(id, code, name, kind)")
      .eq("user_id", user.id)
      .in("role", ["coach", "admin"]);

    type Mem = {
      org_id: string;
      role: string;
      organisations: {
        id: string;
        code: string;
        name: string;
        kind: string;
      } | null;
    };

    const list = (memberships || []) as unknown as Mem[];
    let org =
      list.map((m) => m.organisations).find((o) => o && o.code === code) ||
      list[0]?.organisations ||
      null;

    if (!org && code) {
      // Allow looking up by code if member is coach
      const { data: byCode } = await supabase
        .from("organisations")
        .select("id, code, name, kind")
        .ilike("code", code)
        .maybeSingle();
      if (byCode) {
        const isCoach = list.some((m) => m.org_id === byCode.id);
        if (isCoach) org = byCode;
      }
    }

    if (!org) {
      return NextResponse.json({
        orgs: list.map((m) => m.organisations).filter(Boolean),
        roster: [],
        message: "No coach org yet. Join with role=coach or use DEMO2026.",
      });
    }

    const { data: members } = await supabase
      .from("org_members")
      .select("user_id, role, display_name, joined_at")
      .eq("org_id", org.id);

    let progress: Record<string, unknown>[] | null = null;
    {
      const first = await supabase
        .from("org_progress_snapshots")
        .select(
          "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, face_scores, client_updated_at"
        )
        .eq("org_id", org.id);
      if (first.error && /face_scores/i.test(first.error.message)) {
        const retry = await supabase
          .from("org_progress_snapshots")
          .select(
            "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, client_updated_at"
          )
          .eq("org_id", org.id);
        progress = (retry.data || []) as Record<string, unknown>[];
      } else {
        progress = (first.data || []) as Record<string, unknown>[];
      }
    }

    const progressByUser = new Map(
      (progress || []).map((p) => [String(p.user_id), p])
    );

    const roster = (members || []).map((m) => ({
      userId: m.user_id,
      role: m.role,
      displayName: m.display_name,
      joinedAt: m.joined_at,
      progress: progressByUser.get(m.user_id as string) || null,
    }));

    return NextResponse.json({
      org,
      orgs: list.map((m) => m.organisations).filter(Boolean),
      roster,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Roster failed" },
      { status: 500 }
    );
  }
}
