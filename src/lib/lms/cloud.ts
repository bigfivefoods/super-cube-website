/**
 * Browser helpers for the server-side LMS API (Phase 0).
 * When the learner is signed in, the server is the source of truth for
 * attempts, completed sessions, entitlement and certificates; localStorage
 * mirrors it for offline display.
 */

import type { ConstructScore, ResponseMap } from "@/lib/lms/scoring";
import type { PostGate } from "@/lib/lms/gates";
import { CONSENT_TEXT_VERSION } from "@/lib/lms/consent";
import type { AgeBand } from "@/lib/lms/profile";
import type { ProgrammeId } from "@/lib/programmes";
import { loadLmsState, saveLmsState, type LocalAttempt } from "@/lib/lms/store";

export type ServerAttemptView = {
  id: string;
  phase: "pre" | "mid" | "post";
  programmeId: ProgrammeId;
  overall: number;
  constructScores: ConstructScore[];
  responses: ResponseMap;
  completedAt: string;
};

export type ServerStatus = {
  signedIn: true;
  userId: string;
  email?: string;
  programmeId: ProgrammeId;
  entitlement: { tier: "paid" | "cohort" | "open" | "none"; programmeId?: ProgrammeId };
  attempts: ServerAttemptView[];
  completions: string[];
  postGate: PostGate;
  certificate: { id: string; issued_at: string } | null;
  guardianConsent: {
    id: string;
    status: string;
    granted_at: string;
    learner_age_band?: string;
    consent_text_version?: string;
    guardian_name?: string;
    relationship?: string;
  } | null;
};

export type CloudResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "signed_out" }
  | { kind: "unavailable" }
  | { kind: "error"; status: number; body: Record<string, unknown> };

async function call<T>(url: string, init?: RequestInit): Promise<CloudResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401) return { kind: "signed_out" };
    if (res.status === 503) return { kind: "unavailable" };
    if (!res.ok) return { kind: "error", status: res.status, body };
    return { kind: "ok", data: body as T };
  } catch {
    return { kind: "unavailable" };
  }
}

export function toLocalAttempt(a: ServerAttemptView): LocalAttempt {
  return {
    phase: a.phase,
    programmeId: a.programmeId,
    responses: a.responses,
    result: { constructScores: a.constructScores, overall: Number(a.overall) },
    completedAt: a.completedAt,
    serverId: a.id,
  };
}

/**
 * Baselines taken while signed out live only on this device. Once the learner
 * is signed in, hand each one to the server (first one wins, re-scored there),
 * so the baseline can't be retaken "for real" after signing up.
 */
export async function claimDeviceBaselines(): Promise<number> {
  const state = loadLmsState();
  const pending = state.attempts.filter((a) => a.phase === "pre" && !a.serverId);
  let claimed = 0;
  for (const a of pending) {
    const r = await call<{ ok: true; claimed: boolean; attempt: ServerAttemptView }>("/api/lms/attempts/claim", {
      method: "POST",
      body: JSON.stringify({
        programmeId: a.programmeId,
        responses: a.responses,
        completedAt: a.completedAt,
        meta: { seed: a.seed, durationMs: a.durationMs },
      }),
    });
    if (r.kind !== "ok") continue;
    const next = loadLmsState();
    next.attempts = [
      ...next.attempts.filter((x) => !(x.phase === "pre" && x.programmeId === a.programmeId)),
      toLocalAttempt(r.data.attempt),
    ];
    saveLmsState(next);
    if (r.data.claimed) claimed += 1;
  }
  return claimed;
}

/** Pull server state and mirror it locally (server attempts replace local pre/post). */
export async function syncFromServer(programmeId: ProgrammeId): Promise<CloudResult<ServerStatus>> {
  let r = await call<ServerStatus>(`/api/lms/status?programme=${programmeId}`);
  if (r.kind === "ok" && !r.data.attempts.some((a) => a.phase === "pre")) {
    // Signed in with no server baseline: claim one taken on this device first
    if ((await claimDeviceBaselines()) > 0) r = await call<ServerStatus>(`/api/lms/status?programme=${programmeId}`);
  }
  if (r.kind !== "ok") return r;
  const s = r.data;
  const state = loadLmsState();
  const serverPhases = new Set(s.attempts.map((a) => a.phase));
  state.attempts = [
    // keep local attempts the server doesn't have (other programmes, offline mids)
    ...state.attempts.filter(
      (a) => a.programmeId !== programmeId || !serverPhases.has(a.phase),
    ),
    ...s.attempts.map(toLocalAttempt),
  ];
  const progress = { ...state.lessonProgress };
  for (const id of s.completions) progress[id] = "completed";
  state.lessonProgress = progress;
  state.serverEntitlement = {
    kind: s.entitlement.tier,
    programmeId: s.entitlement.programmeId,
    userId: s.userId,
    checkedAt: new Date().toISOString(),
  };
  if (s.certificate?.id) {
    state.certificateId = s.certificate.id;
    state.certificateEarnedAt = state.certificateEarnedAt || s.certificate.issued_at;
  }
  const consent = s.guardianConsent;
  if (consent?.status === "granted" && consent.guardian_name && consent.learner_age_band) {
    state.guardianConsent = {
      guardianName: consent.guardian_name,
      relationship: consent.relationship || "Parent",
      ageBand: consent.learner_age_band as AgeBand,
      textVersion: consent.consent_text_version || CONSENT_TEXT_VERSION,
      grantedAt: consent.granted_at,
      method: "on_device_attestation",
      cloudSaved: true,
    };
  }
  saveLmsState(state);
  return r;
}

export function submitAttempt(
  phase: "pre" | "mid" | "post",
  programmeId: ProgrammeId,
  responses: ResponseMap,
  meta: { seed?: number; durationMs?: number } = {},
) {
  return call<{ ok: true; attempt: ServerAttemptView }>("/api/lms/attempts", {
    method: "POST",
    body: JSON.stringify({ phase, programmeId, responses, meta }),
  });
}

export type ServerStreak = { current: number; best: number; freezes: number; lastDay: string | null };
export type ServerActivity = { streak: ServerStreak & { freezesUsed?: number; freezeEarned?: boolean }; newBadges: { badgeId: string; name: string }[] };

/** Keep the device's streak in step with the server's (the server wins when signed in). */
export function mirrorServerStreak(s: ServerStreak | null | undefined) {
  if (!s) return;
  const state = loadLmsState();
  state.practiceStreak = { current: s.current, best: Math.max(s.best, state.practiceStreak?.best ?? 0), lastDate: s.lastDay };
  state.streakFreezes = s.freezes;
  saveLmsState(state);
}

export async function recordLessonOpen(programmeId: ProgrammeId, constructId: string, lessonId: string) {
  return call<{ ok: true; opened?: boolean }>("/api/lms/progress", {
    method: "POST",
    body: JSON.stringify({ action: "open", programmeId, constructId, lessonId }),
  });
}

export async function recordCompletion(
  programmeId: ProgrammeId,
  constructId: string,
  lessonId: string,
  check?: { answers: (number | null)[]; retry: boolean },
) {
  const r = await call<{ ok: true; countsForGate?: boolean; engagement?: ServerActivity | null }>("/api/lms/progress", {
    method: "POST",
    body: JSON.stringify({ action: "complete", programmeId, constructId, lessonId, answers: check?.answers, retry: check?.retry }),
  });
  if (r.kind === "ok") mirrorServerStreak(r.data.engagement?.streak);
  return r;
}

/** A daily check-in or micro-practice; silently skipped when signed out. */
export async function recordHabit(kind: "pulse" | "practice_complete", ref?: string, programmeId?: string) {
  const r = await call<{ ok: true } & ServerActivity>("/api/lms/events", {
    method: "POST",
    body: JSON.stringify({ kind, ref, programmeId }),
  });
  if (r.kind === "ok") mirrorServerStreak(r.data.streak);
  return r;
}

export type EngagementView = {
  streak: ServerStreak;
  badges: { id: string; badgeId: string; name: string; criteria: string; awardedAt: string }[];
  push: { configured: boolean; subscribed: boolean; minorNeedsConsent: boolean };
};

export function fetchEngagement() {
  return call<EngagementView>("/api/lms/engagement");
}

export type IssuedCertificate = {
  id: string;
  learner_name: string;
  programme_id: ProgrammeId;
  pre_overall: number;
  post_overall: number;
  growth: number;
  issued_at: string;
};

export function issueCertificate(programmeId: ProgrammeId, learnerName?: string, orgCode?: string) {
  return call<{ ok: true; certificate: IssuedCertificate; existing?: boolean }>("/api/certificates/issue", {
    method: "POST",
    body: JSON.stringify({ programmeId, learnerName, orgCode }),
  });
}

export function deleteAccountOnServer() {
  return call<{ ok: true }>("/api/account/delete", {
    method: "POST",
    body: JSON.stringify({ confirm: "DELETE" }),
  });
}
