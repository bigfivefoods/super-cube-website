import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { constructs } from "@/lib/content";

/** CSV export of org roster + progress for coaches/admins (research-ready). */
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

    // Prefer full select including pulse + face_scores; graceful degrade
    let progress: Record<string, unknown>[] = [];
    {
      const selects = [
        "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, face_scores, pulse_count, pulse_consistency, last_pulse_at, client_updated_at",
        "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, face_scores, client_updated_at",
        "user_id, programme_id, pathway_pct, lessons_completed, pre_overall, post_overall, growth, certificate_id, client_updated_at",
      ];
      for (const sel of selects) {
        const res = await supabase
          .from("org_progress_snapshots")
          .select(sel)
          .eq("org_id", org.id);
        if (!res.error) {
          // Cast via unknown — Supabase client types can widen to GenericStringError[]
          progress = (res.data || []) as unknown as Record<string, unknown>[];
          break;
        }
        if (!/column|face_scores|pulse_/i.test(res.error.message)) {
          progress = [];
          break;
        }
      }
    }

    const byUser = new Map(progress.map((p) => [String(p.user_id), p]));

    const faceCols = constructs.flatMap((c) => [
      `face_${c.id}_pre`,
      `face_${c.id}_post`,
      `face_${c.id}_pulse`,
    ]);

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
      "pulse_count",
      "pulse_consistency",
      "last_pulse_at",
      ...faceCols,
      "updated_at",
    ];

    const lines = [header.join(",")];
    for (const m of members || []) {
      const p = byUser.get(m.user_id as string) as Record<string, unknown> | undefined;
      const faces =
        p?.face_scores && typeof p.face_scores === "object"
          ? (p.face_scores as Record<
              string,
              { pre?: number; post?: number; pulse?: number }
            >)
          : {};

      const faceVals = constructs.flatMap((c) => {
        const f = faces[c.id];
        return [f?.pre ?? "", f?.post ?? "", f?.pulse ?? ""];
      });

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
        csv(p?.pulse_count),
        csv(p?.pulse_consistency),
        csv(p?.last_pulse_at),
        ...faceVals.map(csv),
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
