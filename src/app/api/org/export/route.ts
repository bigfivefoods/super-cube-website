import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** CSV export of org roster + progress for coaches/admins. */
export async function GET(request: Request) {
  try {
    const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "code required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { data: org } = await supabase
      .from("organisations")
      .select("id, code, name")
      .ilike("code", code)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    const { data: me } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!me || !["coach", "admin"].includes(me.role)) {
      return NextResponse.json({ error: "Coach access required" }, { status: 403 });
    }

    const { data: members } = await supabase
      .from("org_members")
      .select("user_id, role, display_name, joined_at")
      .eq("org_id", org.id);

    const { data: progress } = await supabase
      .from("org_progress_snapshots")
      .select(
        "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, client_updated_at"
      )
      .eq("org_id", org.id);

    const byUser = new Map((progress || []).map((p) => [p.user_id as string, p]));

    const header = [
      "display_name",
      "user_id",
      "role",
      "joined_at",
      "programme_id",
      "pathway_pct",
      "lessons_completed",
      "pre_overall",
      "post_overall",
      "growth",
      "certificate_id",
      "updated_at",
    ];

    const lines = [header.join(",")];
    for (const m of members || []) {
      const p = byUser.get(m.user_id as string);
      const row = [
        csv(m.display_name),
        csv(m.user_id),
        csv(m.role),
        csv(m.joined_at),
        csv(p?.programme_id),
        csv(p?.pathway_pct),
        csv(p?.lessons_completed),
        csv(p?.pre_overall),
        csv(p?.post_overall),
        csv(p?.growth),
        csv(p?.certificate_id),
        csv(p?.client_updated_at),
      ];
      lines.push(row.join(","));
    }

    const body = lines.join("\n");
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="super-cube-${org.code}-roster.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}

function csv(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
