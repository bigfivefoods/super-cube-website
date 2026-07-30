/**
 * Local demo store (localStorage) so the LMS works before Supabase is connected.
 * When Supabase env vars are present, API routes / server actions should prefer DB.
 */

import type { ProgrammeId } from "@/lib/programmes";
import type { AttemptResult, ResponseMap } from "@/lib/lms/scoring";

const KEY = "supercube_lms_v1";

export interface LocalSubscription {
  programmeId: ProgrammeId;
  planId: string;
  status: "active" | "incomplete" | "cancelled";
  activatedAt: string;
}

export interface LocalLessonProgress {
  [lessonId: string]: "completed" | "in_progress";
}

export interface LocalAttempt {
  phase: "pre" | "post";
  programmeId: ProgrammeId;
  responses: ResponseMap;
  result: AttemptResult;
  completedAt: string;
}

export interface LocalLmsState {
  user?: {
    email: string;
    fullName: string;
    programmeId?: ProgrammeId;
  };
  subscription?: LocalSubscription;
  lessonProgress: LocalLessonProgress;
  attempts: LocalAttempt[];
}

const empty = (): LocalLmsState => ({
  lessonProgress: {},
  attempts: [],
});

export function loadLmsState(): LocalLmsState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function saveLmsState(state: LocalLmsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Demo unlock: treat as active if local subscription active OR env DEMO_LMS_OPEN=true */
export function hasLocalAccess(state: LocalLmsState): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true") return true;
  return state.subscription?.status === "active";
}
