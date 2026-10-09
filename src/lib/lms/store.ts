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
import type { LearnerProfile } from "@/lib/lms/profile";
import type { GuardianConsentRecord } from "@/lib/lms/consent";
import { advanceStreak, localDayKey } from "@/lib/lms/day";

const KEY = "supercube_lms_v1";

export interface LocalSubscription {
  programmeId: ProgrammeId;
  planId: string;
  status: "active" | "incomplete" | "cancelled";
  activatedAt: string;
  /** Last verified Paystack reference (idempotency) */
  paystackReference?: string;
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
  /** Set when the server holds this attempt (signed in, or claimed after sign-up) */
  serverId?: string;
  /** Per-attempt item-order seed and time taken (integrity checks) */
  seed?: number;
  durationMs?: number;
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

export interface MasteryRecord {
  /** Completion attempts at the knowledge check */
  attempts: number;
  /** Correct answers on the first attempt */
  firstCorrect: number;
  /** Best correct answers across attempts */
  bestCorrect: number;
  total: number;
  /** Correct answers needed for mastery */
  needed?: number;
  /** Reached the threshold on the first attempt */
  firstTry: boolean;
  /** Completed after a retry with explanations */
  retried: boolean;
  passedAt?: string;
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
  /** Demographics + identity captured at start */
  profile?: LearnerProfile;
  subscription?: LocalSubscription;
  /** Last successful Paystack payment reference */
  paystackReference?: string;
  /** Seat pack purchase (school pilot) */
  seatPack?: {
    packId: string;
    seats: number;
    orgCode?: string;
    orgName?: string;
    purchasedAt: string;
  };
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
  /** Streak freezes held on the server (signed in); each covers one missed day */
  streakFreezes?: number;
  /** Prefer browser notifications for daily practice (opt-in) */
  notifyPractice?: boolean;
  /** ISO date when completion certificate was first earned */
  certificateEarnedAt?: string;
  /** Public certificate verification id (SC-YYYYMMDD-HEX) */
  certificateId?: string;
  /** School / company / family cohort code */
  orgCode?: string;
  /** Free demo unlock (Choices sample sessions) without full paywall */
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
    /** Item-order seed, kept so a resumed attempt shows the same order */
    seed?: number;
    startedAt?: string;
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
    firstPulse?: boolean;
  };
  /** UI locale hint */
  locale?: "en" | "zu" | "af";
  /** Continuous daily/weekly face pulses for pattern tracking */
  facePulses?: FacePulse[];
  /** Parent/guardian consent (required for under-18 learners) */
  guardianConsent?: GuardianConsentRecord;
  /** Local day a streak freeze last covered a missed day (shown once as a notice) */
  streakFreezeUsedOn?: string;
  /** When each session was first completed (ISO); drives spaced reviews and the weekly goal */
  sessionCompletedAt?: Record<string, string>;
  /** Knowledge-check mastery per session (see lib/lms/mastery.ts) */
  mastery?: Record<string, MasteryRecord>;
  /** Day 3 / 7 / 21 spaced reviews per session: review day → ISO time done and score */
  sessionReviews?: Record<string, Partial<Record<"3" | "7" | "21", { at: string; correct: number; total: number }>>>;
  /** Weekly goal the learner chose: sessions, practices and reviews per week */
  weeklyGoal?: { target: number; setAt: string };
  /** Progress badges first seen on this device (id → ISO) */
  progressBadges?: Record<string, string>;
  /** Highest level already celebrated (so level-ups celebrate once) */
  celebratedLevel?: number;
  /** Face light tiers already celebrated (face → tier) */
  celebratedTiers?: Partial<Record<ConstructId, number>>;
  /** Last entitlement confirmed by the server (/api/lms/status) */
  serverEntitlement?: {
    kind: "paid" | "cohort" | "open" | "none";
    programmeId?: ProgrammeId;
    userId: string;
    checkedAt: string;
  };
}

/** Old builds stored a fake "active" `_demo` subscription that unlocked everything. */
function stripLegacyDemoSubscription(state: LocalLmsState): LocalLmsState {
  const sub = state.subscription;
  if (sub && sub.planId?.endsWith("_demo") && !sub.paystackReference && !state.paystackReference) {
    const { subscription: _drop, ...rest } = state;
    void _drop;
    return { ...rest, demoUnlocked: true } as LocalLmsState;
  }
  return state;
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
    const parsed = stripLegacyDemoSubscription(JSON.parse(raw) as LocalLmsState);
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

/**
 * Stable snapshots for useSyncExternalStore. getSnapshot must return the same
 * object until the stored JSON changes, or React re-renders forever.
 */
const SERVER_SNAPSHOT: LocalLmsState = empty();
let snapshotRaw: string | null | undefined;
let snapshot: LocalLmsState = SERVER_SNAPSHOT;

export function getLmsSnapshot(): LocalLmsState {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (snapshotRaw !== undefined && raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  snapshot = loadLmsState();
  return snapshot;
}

export function getLmsServerSnapshot(): LocalLmsState {
  return SERVER_SNAPSHOT;
}

export function subscribeLms(onStoreChange: () => void): () => void {
  const bump = () => {
    snapshotRaw = undefined;
    onStoreChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) bump();
  };
  window.addEventListener("sc-lms-update", bump);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("sc-lms-update", bump);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveLmsState(state: LocalLmsState) {
  if (typeof window === "undefined") return;
  snapshotRaw = undefined;
  localStorage.setItem(KEY, JSON.stringify(state));
  try {
    window.dispatchEvent(new CustomEvent("sc-lms-update"));
  } catch {
    /* ignore */
  }
  try {
    void import("@/lib/lms/sync").then((m) => m.scheduleCloudPush());
  } catch {
    /* ignore */
  }
}

/** Local calendar day YYYY-MM-DD (shared helper; re-exported for existing imports) */
export { localDayKey } from "@/lib/lms/day";

/** Update streak (local day, freezes) + last activity timestamps */
export function touchActivity(state: LocalLmsState): LocalLmsState {
  const step = advanceStreak(state.practiceStreak, state.streakFreezes ?? 0, localDayKey());
  return {
    ...state,
    lastActivityAt: new Date().toISOString(),
    practiceStreak: step.streak,
    streakFreezes: step.freezes,
    ...(step.freezesUsed > 0 ? { streakFreezeUsedOn: localDayKey() } : {}),
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
  if (!state.sessionCompletedAt?.[lessonId]) {
    state.sessionCompletedAt = { ...(state.sessionCompletedAt ?? {}), [lessonId]: new Date().toISOString() };
  }
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

const SERVER_ENTITLEMENT_TTL_MS = 7 * 24 * 3600 * 1000;

function serverEntitled(state: LocalLmsState): boolean {
  const e = state.serverEntitlement;
  if (!e || e.kind === "none") return false;
  return Date.now() - new Date(e.checkedAt).getTime() < SERVER_ENTITLEMENT_TTL_MS;
}

/**
 * Full pathway on this device. UX gate only: the server re-checks entitlement
 * before it accepts a post-assessment, a paid session or a certificate.
 */
export function hasLocalAccess(state: LocalLmsState): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true") return true;
  return hasPaidAccess(state) || serverEntitled(state);
}

/** Learn area visible (paid, or free sample sessions after "try free") */
export function hasLearnAccess(state: LocalLmsState): boolean {
  if (hasLocalAccess(state)) return true;
  return Boolean(state.demoUnlocked);
}

/** Paid via a Paystack reference verified by /api/paystack/verify (never the free demo) */
export function hasPaidAccess(state: LocalLmsState): boolean {
  const sub = state.subscription;
  const ref = sub?.paystackReference || state.paystackReference;
  return Boolean(
    sub?.status === "active" && ref && sub.planId && !sub.planId.includes("_demo")
  );
}

export function setOrgCode(code: string): LocalLmsState {
  const state = loadLmsState();
  state.orgCode = code.trim().toUpperCase().slice(0, 24) || undefined;
  saveLmsState(state);
  return state;
}

/**
 * "Try free": opens the free sample only (the Choices overview and its first skill).
 * It never creates an active subscription.
 */
export function unlockDemo(programmeId: ProgrammeId): LocalLmsState {
  const state = stripLegacyDemoSubscription(loadLmsState());
  state.demoUnlocked = true;
  state.user = {
    email: state.user?.email || "",
    fullName: state.user?.fullName || state.profile?.displayName || "Learner",
    programmeId,
  };
  if (state.subscription) {
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
  const state = loadLmsState();
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

export function saveAssessmentDraft(
  draft: NonNullable<LocalLmsState["assessmentDraft"]>
): LocalLmsState {
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
  let state = loadLmsState();
  const day = localDayKey();
  const log = { ...(state.microPracticeLog ?? {}) };
  const list = new Set(log[day] ?? []);
  list.add(practiceId);
  log[day] = [...list];
  state.microPracticeLog = log;
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

/** True when this micro-practice is already logged for the learner's local today. */
export function practiceDoneToday(state: Pick<LocalLmsState, "microPracticeLog"> | null | undefined, practiceId?: string): boolean {
  const list = state?.microPracticeLog?.[localDayKey()];
  if (!list || list.length === 0) return false;
  return practiceId ? list.includes(practiceId) : true;
}

/** Save a knowledge-check attempt for a session (device; synced with the learner state). */
export function saveMasteryRecord(lessonId: string, record: MasteryRecord): LocalLmsState {
  const state = loadLmsState();
  state.mastery = { ...(state.mastery ?? {}), [lessonId]: record };
  saveLmsState(state);
  return state;
}

/** Set the weekly goal (3, 5 or 7 sessions, practices or reviews a week). */
export function setWeeklyGoal(target: number): LocalLmsState {
  const state = loadLmsState();
  state.weeklyGoal = { target, setAt: state.weeklyGoal?.setAt && state.weeklyGoal.target === target ? state.weeklyGoal.setAt : new Date().toISOString() };
  saveLmsState(state);
  return state;
}

/** Record a Day 3 / 7 / 21 review of one session (one sitting covers every review day that is due). */
export function saveSessionReview(
  lessonId: string,
  days: readonly (3 | 7 | 21)[],
  correct: number,
  total: number,
): LocalLmsState {
  let state = loadLmsState();
  const at = new Date().toISOString();
  const byDay = { ...(state.sessionReviews?.[lessonId] ?? {}) };
  for (const d of days) byDay[String(d) as "3" | "7" | "21"] = { at, correct: d === days[0] ? correct : 0, total };
  state.sessionReviews = { ...(state.sessionReviews ?? {}), [lessonId]: byDay };
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

/** Remember what has been celebrated, so each level, light tier and badge celebrates once. */
export function markCelebrated(patch: Pick<LocalLmsState, "celebratedLevel" | "celebratedTiers" | "progressBadges">): void {
  const state = loadLmsState();
  if (patch.celebratedLevel !== undefined) state.celebratedLevel = Math.max(state.celebratedLevel ?? 0, patch.celebratedLevel);
  if (patch.celebratedTiers) {
    const tiers = { ...(state.celebratedTiers ?? {}) };
    for (const [face, t] of Object.entries(patch.celebratedTiers) as [ConstructId, number][]) tiers[face] = Math.max(tiers[face] ?? 0, t);
    state.celebratedTiers = tiers;
  }
  if (patch.progressBadges) state.progressBadges = { ...patch.progressBadges, ...(state.progressBadges ?? {}) };
  saveLmsState(state);
}

/** Clear the one-time "a freeze covered a missed day" notice. */
export function clearFreezeNotice(): void {
  const state = loadLmsState();
  if (!state.streakFreezeUsedOn) return;
  state.streakFreezeUsedOn = undefined;
  saveLmsState(state);
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
