/**
 * Local LMS store (localStorage).
 * Works offline / demo; ready to mirror into Supabase when connected.
 */

import type { ProgrammeId } from "@/lib/programmes";
import type { ConstructId } from "@/lib/content";
import type { AttemptResult, ResponseMap } from "@/lib/lms/scoring";
import type {
  OrientationResponses,
  OrientationResult,
} from "@/lib/lms/orientation";
import type { FacePulse } from "@/lib/lms/face-tracking";

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
  phase: "pre" | "post" | "mid";
  programmeId: ProgrammeId;
  responses: ResponseMap;
  result: AttemptResult;
  completedAt: string;
}

export interface LocalOrientation {
  responses: OrientationResponses;
  result: OrientationResult;
  completedAt: string;
}

/** Per-session leadership reflection (deliberate practice journal) */
export interface SessionReflection {
  lessonId: string;
  constructId: ConstructId;
  text: string;
  updatedAt: string;
}

export interface PracticeStreak {
  /** Current consecutive days with learning activity */
  current: number;
  /** Best streak ever */
  best: number;
  /** YYYY-MM-DD of last activity (local) */
  lastDate: string | null;
}

export interface SessionWin {
  lessonId: string;
  constructId: ConstructId;
  text: string;
  at: string;
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
  orientation?: LocalOrientation;
  /** Resume / continue intelligence */
  lastLessonId?: string;
  lastConstructId?: ConstructId;
  lastActivityAt?: string;
  /** Reflections keyed by lessonId */
  reflections?: Record<string, SessionReflection>;
  practiceStreak?: PracticeStreak;
  /** Prefer browser notifications for daily practice (opt-in) */
  notifyPractice?: boolean;
  /** ISO date when completion certificate was first earned */
  certificateEarnedAt?: string;
  /** Public certificate verification id (SC-YYYYMMDD-HEX) */
  certificateId?: string;
  /** School / company cohort code */
  orgCode?: string;
  /** Free demo unlock (one construct sample) without full paywall */
  demoUnlocked?: boolean;
  /** Last session win-of-the-day lines */
  sessionWins?: SessionWin[];
  /** Consent to share non-journal progress with cohort coaches */
  shareProgressWithCoach?: boolean;
  /** Onboarding welcome completed / seen */
  onboardingSeenAt?: string;
  /** In-progress assessment draft (save/resume) */
  assessmentDraft?: {
    phase: "pre" | "post" | "mid";
    programmeId: ProgrammeId;
    responses: ResponseMap;
    step: number;
    updatedAt: string;
  };
  /** ISO date of last "done for today" acknowledgment */
  doneForTodayAt?: string;
  /** Completed micro-practice ids by ISO date YYYY-MM-DD */
  microPracticeLog?: Record<string, string[]>;
  /** Guided first-run steps completed */
  firstRun?: {
    orient?: boolean;
    pre?: boolean;
    firstLesson?: boolean;
    firstWin?: boolean;
  };
  /** UI locale hint */
  locale?: "en" | "zu" | "af";
  /** Continuous daily/weekly face pulses for pattern tracking */
  facePulses?: FacePulse[];
}

const empty = (): LocalLmsState => ({
  lessonProgress: {},
  attempts: [],
  reflections: {},
  practiceStreak: { current: 0, best: 0, lastDate: null },
  facePulses: [],
});

export function loadLmsState(): LocalLmsState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as LocalLmsState;
    return {
      ...empty(),
      ...parsed,
      lessonProgress: parsed.lessonProgress ?? {},
      attempts: parsed.attempts ?? [],
      reflections: parsed.reflections ?? {},
      practiceStreak: parsed.practiceStreak ?? {
        current: 0,
        best: 0,
        lastDate: null,
      },
      facePulses: parsed.facePulses ?? [],
    };
  } catch {
    return empty();
  }
}

export function saveLmsState(state: LocalLmsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  // Notify same-tab listeners (dashboard, journey rail)
  try {
    window.dispatchEvent(new CustomEvent("sc-lms-update"));
  } catch {
    /* ignore */
  }
  // Debounced Supabase push when signed in (no-op if offline / unsigned)
  try {
    // Dynamic import avoids circular deps at module init
    void import("@/lib/lms/sync").then((m) => m.scheduleCloudPush());
  } catch {
    /* ignore */
  }
}

/** Local calendar day YYYY-MM-DD */
export function localDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/** Update streak + last activity timestamps */
export function touchActivity(state: LocalLmsState): LocalLmsState {
  const today = localDayKey();
  const streak = state.practiceStreak ?? {
    current: 0,
    best: 0,
    lastDate: null,
  };
  let { current, best, lastDate } = streak;

  if (!lastDate) {
    current = 1;
  } else if (lastDate === today) {
    // same day — keep current
  } else if (daysBetween(lastDate, today) === 1) {
    current += 1;
  } else {
    current = 1;
  }
  best = Math.max(best, current);
  lastDate = today;

  return {
    ...state,
    lastActivityAt: new Date().toISOString(),
    practiceStreak: { current, best, lastDate },
  };
}

export function markLessonInProgress(
  lessonId: string,
  constructId: ConstructId
): LocalLmsState {
  let state = loadLmsState();
  if (state.lessonProgress[lessonId] !== "completed") {
    state.lessonProgress = {
      ...state.lessonProgress,
      [lessonId]: "in_progress",
    };
  }
  state.lastLessonId = lessonId;
  state.lastConstructId = constructId;
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

export function markLessonCompleted(
  lessonId: string,
  constructId: ConstructId
): LocalLmsState {
  let state = loadLmsState();
  state.lessonProgress = {
    ...state.lessonProgress,
    [lessonId]: "completed",
  };
  state.lastLessonId = lessonId;
  state.lastConstructId = constructId;
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

export function saveReflection(
  lessonId: string,
  constructId: ConstructId,
  text: string
): LocalLmsState {
  let state = loadLmsState();
  const reflections = { ...(state.reflections ?? {}) };
  reflections[lessonId] = {
    lessonId,
    constructId,
    text: text.trim(),
    updatedAt: new Date().toISOString(),
  };
  state.reflections = reflections;
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

export function exportLmsBackup(): string {
  return JSON.stringify(loadLmsState(), null, 2);
}

export function importLmsBackup(json: string): LocalLmsState {
  const data = JSON.parse(json) as LocalLmsState;
  if (!data || typeof data !== "object") throw new Error("Invalid backup");
  const merged: LocalLmsState = {
    ...empty(),
    ...data,
    lessonProgress: data.lessonProgress ?? {},
    attempts: data.attempts ?? [],
    reflections: data.reflections ?? {},
    facePulses: data.facePulses ?? [],
  };
  saveLmsState(merged);
  return merged;
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

/** Access to full programme or open demo mode */
export function hasLearnAccess(state: LocalLmsState): boolean {
  if (hasLocalAccess(state)) return true;
  return Boolean(state.demoUnlocked);
}

export function setOrgCode(code: string): LocalLmsState {
  const state = loadLmsState();
  state.orgCode = code.trim().toUpperCase().slice(0, 24) || undefined;
  saveLmsState(state);
  return state;
}

export function unlockDemo(programmeId: ProgrammeId): LocalLmsState {
  let state = loadLmsState();
  state.demoUnlocked = true;
  state.user = {
    email: state.user?.email || "demo@super-cube.me",
    fullName: state.user?.fullName || "Demo Learner",
    programmeId,
  };
  if (!state.subscription || state.subscription.status !== "active") {
    state.subscription = {
      programmeId,
      planId: `${programmeId}_demo`,
      status: "active",
      activatedAt: new Date().toISOString(),
    };
  } else {
    state.subscription = { ...state.subscription, programmeId };
  }
  saveLmsState(state);
  return state;
}

export function recordSessionWin(
  lessonId: string,
  constructId: ConstructId,
  text: string
): LocalLmsState {
  let state = loadLmsState();
  const wins = [...(state.sessionWins ?? [])];
  wins.unshift({
    lessonId,
    constructId,
    text,
    at: new Date().toISOString(),
  });
  state.sessionWins = wins.slice(0, 20);
  saveLmsState(state);
  return state;
}

export function setNotifyPractice(enabled: boolean): LocalLmsState {
  const state = loadLmsState();
  state.notifyPractice = enabled;
  saveLmsState(state);
  return state;
}

export function setCertificateMeta(
  certificateId: string,
  earnedAt?: string
): LocalLmsState {
  const state = loadLmsState();
  state.certificateId = certificateId;
  state.certificateEarnedAt =
    state.certificateEarnedAt || earnedAt || new Date().toISOString();
  saveLmsState(state);
  return state;
}

export function setShareProgressConsent(enabled: boolean): LocalLmsState {
  const state = loadLmsState();
  state.shareProgressWithCoach = enabled;
  saveLmsState(state);
  return state;
}

export function markOnboardingSeen(): LocalLmsState {
  const state = loadLmsState();
  state.onboardingSeenAt = new Date().toISOString();
  saveLmsState(state);
  return state;
}

export function saveAssessmentDraft(draft: NonNullable<LocalLmsState["assessmentDraft"]>): LocalLmsState {
  const state = loadLmsState();
  state.assessmentDraft = draft;
  saveLmsState(state);
  return state;
}

export function clearAssessmentDraft(): LocalLmsState {
  const state = loadLmsState();
  delete state.assessmentDraft;
  saveLmsState(state);
  return state;
}

export function logMicroPractice(practiceId: string): LocalLmsState {
  const state = loadLmsState();
  const day = new Date().toISOString().slice(0, 10);
  const log = { ...(state.microPracticeLog ?? {}) };
  const list = new Set(log[day] ?? []);
  list.add(practiceId);
  log[day] = [...list];
  state.microPracticeLog = log;
  // Count as streak activity
  const streak = state.practiceStreak ?? { current: 0, best: 0, lastDate: null };
  if (streak.lastDate !== day) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    streak.current = streak.lastDate === y ? streak.current + 1 : 1;
    streak.best = Math.max(streak.best, streak.current);
    streak.lastDate = day;
  }
  state.practiceStreak = streak;
  saveLmsState(state);
  return state;
}

export function markFirstRunStep(
  step: keyof NonNullable<LocalLmsState["firstRun"]>
): LocalLmsState {
  const state = loadLmsState();
  state.firstRun = { ...(state.firstRun ?? {}), [step]: true };
  saveLmsState(state);
  return state;
}

export function setLmsLocale(locale: "en" | "zu" | "af"): LocalLmsState {
  const state = loadLmsState();
  state.locale = locale;
  saveLmsState(state);
  return state;
}

export function markDoneForToday(): LocalLmsState {
  const state = loadLmsState();
  state.doneForTodayAt = new Date().toISOString();
  saveLmsState(state);
  return state;
}
