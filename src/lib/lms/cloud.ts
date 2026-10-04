/**
 * Browser helpers for the server-side LMS API (Phase 0).
 * When the learner is signed in, the server is the source of truth for
 * attempts, completed sessions, entitlement and certificates; localStorage
 * mirrors it for offline display.
 */

import type { ConstructScore, ResponseMap } from "@/lib/lms/scoring";
import type { PostGate } from "@/lib/lms/gates";
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
  entitlement: { kind: "paid" | "cohort" | "open" | "none"; programmeId?: ProgrammeId };
  attempts: ServerAttemptView[];
  completions: string[];
  postGate: PostGate;
  certificate: { id: string; issued_at: string } | null;
  guardianConsent: { id: string; status: string; granted_at: string } | null;
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
  };
}

/** Pull server state and mirror it locally (server attempts replace local pre/post). */
export async function syncFromServer(programmeId: ProgrammeId): Promise<CloudResult<ServerStatus>> {
  const r = await call<ServerStatus>(`/api/lms/status?programme=${programmeId}`);
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
    kind: s.entitlement.kind,
    programmeId: s.entitlement.programmeId,
    userId: s.userId,
    checkedAt: new Date().toISOString(),
  };
  if (s.certificate?.id) {
    state.certificateId = s.certificate.id;
    state.certificateEarnedAt = state.certificateEarnedAt || s.certificate.issued_at;
  }
  saveLmsState(state);
  return r;
}

export function submitAttempt(phase: "pre" | "mid" | "post", programmeId: ProgrammeId, responses: ResponseMap) {
  return call<{ ok: true; attempt: ServerAttemptView }>("/api/lms/attempts", {
    method: "POST",
    body: JSON.stringify({ phase, programmeId, responses }),
  });
}

export function recordCompletion(programmeId: ProgrammeId, constructId: string, lessonId: string) {
  return call<{ ok: true }>("/api/lms/progress", {
    method: "POST",
    body: JSON.stringify({ programmeId, constructId, lessonId }),
  });
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
