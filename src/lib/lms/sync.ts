/**
 * Supabase multi-device sync for LocalLmsState.
 * - Offline-first: always read/write localStorage
 * - When signed in: pull remote, merge, push
 * - Conflict: field-level merge (completed wins, latest reflection, etc.)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  loadLmsState,
  saveLmsState,
  type LocalAttempt,
  type LocalLmsState,
  type SessionReflection,
} from "@/lib/lms/store";

export type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "error"
  | "unsigned";

export type SyncResult = {
  status: SyncStatus;
  message?: string;
  merged?: LocalLmsState;
};

function progressRank(s?: string): number {
  if (s === "completed") return 2;
  if (s === "in_progress") return 1;
  return 0;
}

/** Merge two device states without losing completion or journal entries. */
export function mergeLmsStates(
  a: LocalLmsState,
  b: LocalLmsState
): LocalLmsState {
  const aTime = a.lastActivityAt ? Date.parse(a.lastActivityAt) : 0;
  const bTime = b.lastActivityAt ? Date.parse(b.lastActivityAt) : 0;
  const newer = aTime >= bTime ? a : b;
  const older = aTime >= bTime ? b : a;

  // lessonProgress: completed wins
  const lessonProgress = { ...older.lessonProgress };
  for (const [id, status] of Object.entries(a.lessonProgress || {})) {
    if (progressRank(status) >= progressRank(lessonProgress[id])) {
      lessonProgress[id] = status;
    }
  }
  for (const [id, status] of Object.entries(b.lessonProgress || {})) {
    if (progressRank(status) >= progressRank(lessonProgress[id])) {
      lessonProgress[id] = status;
    }
  }

  // attempts: one pre + one post, prefer later completedAt
  const attemptsByPhase = new Map<string, LocalAttempt>();
  for (const att of [...(a.attempts || []), ...(b.attempts || [])]) {
    const key = att.phase;
    const prev = attemptsByPhase.get(key);
    if (!prev || Date.parse(att.completedAt) >= Date.parse(prev.completedAt)) {
      attemptsByPhase.set(key, att);
    }
  }

  // reflections: latest per lesson
  const reflections: Record<string, SessionReflection> = {
    ...(a.reflections || {}),
  };
  for (const [id, ref] of Object.entries(b.reflections || {})) {
    const cur = reflections[id];
    if (!cur || Date.parse(ref.updatedAt) >= Date.parse(cur.updatedAt)) {
      reflections[id] = ref;
    }
  }

  // streak: best max; lastDate/current from more recent activity
  const sa = a.practiceStreak;
  const sb = b.practiceStreak;
  const best = Math.max(sa?.best ?? 0, sb?.best ?? 0);
  const practiceStreak =
    (aTime >= bTime ? sa : sb) ??
    sa ??
    sb ?? { current: 0, best: 0, lastDate: null };
  practiceStreak.best = Math.max(best, practiceStreak.best ?? 0);

  // orientation: prefer completed, then newer
  let orientation = a.orientation || b.orientation;
  if (a.orientation && b.orientation) {
    orientation =
      Date.parse(a.orientation.completedAt) >=
      Date.parse(b.orientation.completedAt)
        ? a.orientation
        : b.orientation;
  }

  // subscription: prefer active
  let subscription = a.subscription || b.subscription;
  if (a.subscription && b.subscription) {
    subscription =
      a.subscription.status === "active"
        ? a.subscription
        : b.subscription.status === "active"
          ? b.subscription
          : aTime >= bTime
            ? a.subscription
            : b.subscription;
  }

  // user: merge fields from both, prefer non-empty newer
  const user = {
    email: newer.user?.email || older.user?.email || "",
    fullName: newer.user?.fullName || older.user?.fullName || "",
    programmeId:
      newer.user?.programmeId ||
      older.user?.programmeId ||
      subscription?.programmeId,
  };

  return {
    user: user.email || user.fullName ? user : newer.user || older.user,
    subscription,
    lessonProgress,
    attempts: Array.from(attemptsByPhase.values()),
    orientation,
    lastLessonId: newer.lastLessonId || older.lastLessonId,
    lastConstructId: newer.lastConstructId || older.lastConstructId,
    lastActivityAt:
      aTime >= bTime ? a.lastActivityAt : b.lastActivityAt || a.lastActivityAt,
    reflections,
    practiceStreak,
    notifyPractice: Boolean(a.notifyPractice || b.notifyPractice),
    certificateEarnedAt:
      a.certificateEarnedAt && b.certificateEarnedAt
        ? Date.parse(a.certificateEarnedAt) <= Date.parse(b.certificateEarnedAt)
          ? a.certificateEarnedAt
          : b.certificateEarnedAt
        : a.certificateEarnedAt || b.certificateEarnedAt,
  };
}

function toPayload(state: LocalLmsState) {
  return JSON.parse(JSON.stringify(state)) as LocalLmsState;
}

async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null,
  fullName?: string | null,
  programmeId?: string | null
) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (data?.id) {
    // light update of name/programme if provided
    if (fullName || programmeId) {
      await supabase
        .from("profiles")
        .update({
          ...(fullName ? { full_name: fullName } : {}),
          ...(programmeId ? { programme_id: programmeId } : {}),
          ...(email ? { email } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
    return;
  }
  await supabase.from("profiles").upsert({
    id: userId,
    email: email ?? null,
    full_name: fullName ?? "",
    programme_id: programmeId ?? null,
  });
}

/** Pull remote state, merge with local, save local, push merged. */
export async function syncLearnerState(
  supabase?: SupabaseClient | null
): Promise<SyncResult> {
  const client = supabase ?? createClient();
  if (!client) {
    return { status: "offline", message: "Supabase is not configured." };
  }

  const {
    data: { user },
    error: userErr,
  } = await client.auth.getUser();
  if (userErr || !user) {
    return { status: "unsigned", message: "Sign in to sync across devices." };
  }

  try {
    const local = loadLmsState();
    await ensureProfile(
      client,
      user.id,
      user.email,
      local.user?.fullName ||
        (user.user_metadata?.full_name as string | undefined),
      local.user?.programmeId ||
        local.subscription?.programmeId ||
        (user.user_metadata?.programme_id as string | undefined)
    );

    const { data: remoteRow, error: pullErr } = await client
      .from("learner_state")
      .select("payload, client_updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pullErr) {
      // Table might not exist yet
      return {
        status: "error",
        message:
          pullErr.message.includes("learner_state") ||
          pullErr.code === "42P01" ||
          pullErr.message.includes("schema cache")
            ? "Run supabase/migrations/002_learner_state.sql in the Supabase SQL editor."
            : pullErr.message,
      };
    }

    const remotePayload = (remoteRow?.payload || null) as LocalLmsState | null;
    let merged = local;
    if (remotePayload && typeof remotePayload === "object") {
      const remoteNormalized: LocalLmsState = {
        lessonProgress: remotePayload.lessonProgress ?? {},
        attempts: remotePayload.attempts ?? [],
        reflections: remotePayload.reflections ?? {},
        practiceStreak: remotePayload.practiceStreak,
        user: remotePayload.user,
        subscription: remotePayload.subscription,
        orientation: remotePayload.orientation,
        lastLessonId: remotePayload.lastLessonId,
        lastConstructId: remotePayload.lastConstructId,
        lastActivityAt: remotePayload.lastActivityAt,
        notifyPractice: remotePayload.notifyPractice,
        certificateEarnedAt: remotePayload.certificateEarnedAt,
      };
      merged = mergeLmsStates(local, remoteNormalized);
    }

    // Hydrate user from auth
    const programmeFromMeta =
      typeof user.user_metadata?.programme_id === "string"
        ? (user.user_metadata.programme_id as NonNullable<
            LocalLmsState["user"]
          >["programmeId"])
        : undefined;

    merged = {
      ...merged,
      user: {
        email: user.email || merged.user?.email || "",
        fullName:
          merged.user?.fullName ||
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Learner",
        programmeId:
          merged.user?.programmeId ||
          merged.subscription?.programmeId ||
          programmeFromMeta,
      },
    };

    saveLmsState(merged);

    const clientUpdatedAt =
      merged.lastActivityAt || new Date().toISOString();

    const { error: pushErr } = await client.from("learner_state").upsert(
      {
        user_id: user.id,
        payload: toPayload(merged),
        client_updated_at: clientUpdatedAt,
      },
      { onConflict: "user_id" }
    );

    if (pushErr) {
      return {
        status: "error",
        message: pushErr.message,
        merged,
      };
    }

    return { status: "synced", message: "Progress synced to the cloud.", merged };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Sync failed",
    };
  }
}

/** Push local only (after local mutations). Debounced by callers. */
export async function pushLearnerState(): Promise<SyncResult> {
  const client = createClient();
  if (!client) return { status: "offline" };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { status: "unsigned" };

  const local = loadLmsState();
  const clientUpdatedAt = local.lastActivityAt || new Date().toISOString();

  await ensureProfile(
    client,
    user.id,
    user.email,
    local.user?.fullName,
    local.user?.programmeId || local.subscription?.programmeId
  );

  const { error } = await client.from("learner_state").upsert(
    {
      user_id: user.id,
      payload: toPayload(local),
      client_updated_at: clientUpdatedAt,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { status: "error", message: error.message };
  }
  return { status: "synced", message: "Saved to cloud." };
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced cloud push after local saves (1.2s). */
export function scheduleCloudPush() {
  if (typeof window === "undefined") return;
  if (!createClient()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void pushLearnerState().then((r) => {
      try {
        window.dispatchEvent(
          new CustomEvent("sc-lms-sync", { detail: r })
        );
      } catch {
        /* ignore */
      }
    });
  }, 1200);
}
