import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dayKeyIn, SA_TIME_ZONE } from "@/lib/datetime";
import { BADGES, earnedBadges, isBadgeId, type BadgeId, type StreakView } from "@/lib/lms/badges";
import { getCoursesForProgramme } from "@/lib/lms/curriculum-meta";
import { consentCounts, type ConsentGrant } from "@/lib/lms/guardian-gate";
import { isMinorLearner } from "@/lib/lms/server/share-links";
import type { ProgrammeId } from "@/lib/programmes";

export type ActivityKind = "session_complete" | "practice_complete" | "pulse" | "assessment";

/** Max activity events a learner can log in 24 hours (each one is a habit tick, not a page view). */
export const MAX_EVENTS_PER_DAY = 200;

export interface ActivityResult {
  streak: StreakView & { freezesUsed: number; freezeEarned: boolean; counted: boolean };
  newBadges: { badgeId: BadgeId; name: string }[];
}

async function learnerTimeZone(admin: SupabaseClient, userId: string): Promise<string> {
  const { data } = await admin.from("practice_streaks").select("timezone").eq("user_id", userId).maybeSingle();
  return (data as { timezone?: string } | null)?.timezone || SA_TIME_ZONE;
}

export async function eventsInLastDay(admin: SupabaseClient, userId: string): Promise<number> {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin
    .from("learning_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  return count ?? 0;
}

/**
 * Append an activity event and move the streak in one transaction (lms_record_activity),
 * then award any badges the learner now qualifies for. The day is the learner's local day
 * worked out on the server, so the browser can't backdate activity.
 */
export async function recordActivity(
  admin: SupabaseClient,
  userId: string,
  input: { kind: ActivityKind; ref?: string | null; programmeId?: string | null; minutes?: number | null },
): Promise<ActivityResult> {
  const tz = await learnerTimeZone(admin, userId);
  const { data, error } = await admin.rpc("lms_record_activity", {
    p_user: userId,
    p_kind: input.kind,
    p_ref: input.ref ?? null,
    p_programme: input.programmeId ?? null,
    p_minutes: input.minutes ?? null,
    p_local_day: dayKeyIn(tz),
    p_meta: {},
  });
  if (error) throw new Error(error.message);
  const streak = data as ActivityResult["streak"];
  const newBadges = await awardBadges(admin, userId, streak.best);
  return { streak, newBadges };
}

/** Award every badge the learner's server record qualifies for; returns the new ones. */
export async function awardBadges(
  admin: SupabaseClient,
  userId: string,
  bestStreak?: number,
): Promise<{ badgeId: BadgeId; name: string }[]> {
  const [completions, attempts, streakRow, existing] = await Promise.all([
    admin.from("lms_lesson_completions").select("lesson_id, programme_id, construct_id").eq("user_id", userId),
    admin.from("lms_attempts").select("phase").eq("user_id", userId),
    bestStreak == null
      ? admin.from("practice_streaks").select("best_days").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: { best_days: bestStreak } }),
    admin.from("learner_badges").select("badge_id").eq("user_id", userId),
  ]);
  const done = (completions.data ?? []) as { lesson_id: string; programme_id: string; construct_id: string }[];
  const byCourse = new Map<string, Set<string>>();
  for (const c of done) {
    const k = `${c.programme_id}:${c.construct_id}`;
    if (!byCourse.has(k)) byCourse.set(k, new Set());
    byCourse.get(k)!.add(c.lesson_id);
  }
  let facesComplete = 0;
  for (const [k, lessons] of byCourse) {
    const [programmeId, constructId] = k.split(":");
    const course = getCoursesForProgramme(programmeId as ProgrammeId).find((c) => c.constructId === constructId);
    if (course && course.lessons.length > 0 && course.lessons.every((l) => lessons.has(l.id))) facesComplete += 1;
  }
  const phases = new Set(((attempts.data ?? []) as { phase: string }[]).map((a) => a.phase));
  const earned = earnedBadges({
    sessionsDone: new Set(done.map((d) => d.lesson_id)).size,
    baseline: phases.has("pre"),
    post: phases.has("post"),
    bestStreak: Number((streakRow.data as { best_days?: number } | null)?.best_days ?? 0),
    facesComplete,
  });
  const have = new Set(((existing.data ?? []) as { badge_id: string }[]).map((b) => b.badge_id));
  const fresh = earned.filter((b) => !have.has(b));
  if (fresh.length === 0) return [];
  const rows = fresh.map((badgeId) => ({
    id: `SCB-${randomBytes(9).toString("base64url")}`,
    user_id: userId,
    badge_id: badgeId,
    evidence: { awarded_by: "server", rule: BADGES[badgeId].criteria },
  }));
  const { data: inserted, error } = await admin
    .from("learner_badges")
    .upsert(rows, { onConflict: "user_id,badge_id", ignoreDuplicates: true })
    .select("badge_id");
  if (error) {
    console.error("[lms] badge award failed", error.message);
    return [];
  }
  const got = ((inserted ?? []) as { badge_id: string }[]).map((r) => r.badge_id).filter(isBadgeId);
  if (got.length) {
    await admin.from("learning_events").insert(
      got.map((badgeId) => ({ user_id: userId, kind: "badge_awarded", ref: badgeId, local_day: dayKeyIn(SA_TIME_ZONE) })),
    );
  }
  return got.map((badgeId) => ({ badgeId, name: BADGES[badgeId].name }));
}

/** Engagement never blocks the main action: log and carry on. */
export async function recordActivitySafe(
  admin: SupabaseClient,
  userId: string,
  input: Parameters<typeof recordActivity>[2],
): Promise<ActivityResult | null> {
  try {
    return await recordActivity(admin, userId, input);
  } catch (e) {
    console.error("[lms] activity not recorded", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface EngagementView {
  streak: StreakView;
  badges: { id: string; badgeId: BadgeId; name: string; criteria: string; awardedAt: string }[];
  push: { configured: boolean; subscribed: boolean; minorNeedsConsent: boolean };
}

export function pushConfigured(): boolean {
  return process.env.NEXT_PUBLIC_LMS_PUSH === "1" && Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
}

export async function minorMayGetPush(admin: SupabaseClient, userId: string): Promise<boolean> {
  if (!(await isMinorLearner(admin, userId))) return true;
  const { data } = await admin
    .from("guardian_consents")
    .select("learner_user_id, recorded_by, status, method, scope")
    .eq("learner_user_id", userId)
    .eq("status", "granted")
    .limit(5);
  return (data ?? []).some((c) => {
    const row = c as ConsentGrant & { scope?: unknown };
    return consentCounts(userId, row) && Array.isArray(row.scope) && row.scope.includes("learning");
  });
}

export async function getEngagement(admin: SupabaseClient, userId: string): Promise<EngagementView> {
  const [streak, badges, subs, mayPush] = await Promise.all([
    admin
      .from("practice_streaks")
      .select("current_days, best_days, freezes_available, last_day")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("learner_badges")
      .select("id, badge_id, awarded_at")
      .eq("user_id", userId)
      .eq("revoked", false)
      .order("awarded_at", { ascending: true }),
    admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("revoked_at", null),
    minorMayGetPush(admin, userId),
  ]);
  const s = streak.data as
    | { current_days: number; best_days: number; freezes_available: number; last_day: string | null }
    | null;
  return {
    streak: {
      current: s?.current_days ?? 0,
      best: s?.best_days ?? 0,
      freezes: s?.freezes_available ?? 0,
      lastDay: s?.last_day ?? null,
    },
    badges: ((badges.data ?? []) as { id: string; badge_id: string; awarded_at: string }[])
      .filter((b) => isBadgeId(b.badge_id))
      .map((b) => ({
        id: b.id,
        badgeId: b.badge_id as BadgeId,
        name: BADGES[b.badge_id as BadgeId].name,
        criteria: BADGES[b.badge_id as BadgeId].criteria,
        awardedAt: b.awarded_at,
      })),
    push: { configured: pushConfigured(), subscribed: (subs.count ?? 0) > 0, minorNeedsConsent: !mayPush },
  };
}
