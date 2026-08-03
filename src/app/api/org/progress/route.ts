import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Push non-journal progress snapshot for coach dashboards.
 * Includes optional longitudinal pulse metadata when migration 005 is applied.
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

    if (body.consent === false) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "no_consent",
      });
    }

    await supabase.from("org_members").upsert(
      {
        org_id: org.id,
        user_id: user.id,
        role: "learner",
        display_name: user.email,
      },
      { onConflict: "org_id,user_id" }
    );

    const faceScores =
      body.faceScores && typeof body.faceScores === "object"
        ? body.faceScores
        : {};

    const fullRow: Record<string, unknown> = {
      org_id: org.id,
      user_id: user.id,
      programme_id: body.programmeId ?? null,
      pathway_pct: Number(body.pathwayPct) || 0,
      lessons_completed: Number(body.lessonsCompleted) || 0,
      pre_overall: body.preOverall ?? null,
      post_overall: body.postOverall ?? null,
      growth: body.growth ?? null,
      certificate_id: body.certificateId ?? null,
      face_scores: faceScores,
      pulse_count: Number(body.pulseCount) || 0,
      pulse_consistency: Number(body.pulseConsistency) || 0,
      last_pulse_at: body.lastPulseAt ?? null,
      pulse_window_days: Number(body.pulseWindowDays) || 28,
      client_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const attempts: Record<string, unknown>[] = [
      fullRow,
      Object.fromEntries(
        Object.entries(fullRow).filter(
          ([k]) =>
            !["pulse_count", "pulse_consistency", "last_pulse_at", "pulse_window_days"].includes(
              k
            )
        )
      ),
      Object.fromEntries(
        Object.entries(fullRow).filter(
          ([k]) =>
            ![
              "face_scores",
              "pulse_count",
              "pulse_consistency",
              "last_pulse_at",
              "pulse_window_days",
            ].includes(k)
        )
      ),
    ];

    let lastError: string | null = null;
    for (const row of attempts) {
      const { error } = await supabase
        .from("org_progress_snapshots")
        .upsert(row, { onConflict: "org_id,user_id" });
      if (!error) {
        return NextResponse.json({ ok: true });
      }
      lastError = error.message;
      if (!/column|face_scores|pulse_/i.test(error.message)) {
        break;
      }
    }

    return NextResponse.json(
      { error: lastError || "Progress push failed" },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Progress push failed" },
      { status: 500 }
    );
  }
}
