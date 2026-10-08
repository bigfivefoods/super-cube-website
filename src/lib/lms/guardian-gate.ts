/**
 * Who may record learning for a learner under 18.
 * A granted row counts only when someone other than the learner recorded it
 * (or it arrived by a method that is not the learner's own attestation).
 */
import { MINOR_AGE_BANDS } from "@/lib/lms/consent";

export const CONSENT_REQUIRED_MESSAGE =
  "A parent or guardian must record consent before this learner can continue. The learner cannot consent for themselves.";

export type ConsentGrant = {
  learner_user_id?: string | null;
  recorded_by?: string | null;
  status?: string | null;
  method?: string | null;
};

export function isUnder18Band(band: string | null | undefined): boolean {
  return Boolean(band && (MINOR_AGE_BANDS as readonly string[]).includes(band));
}

/** True when this row is consent recorded by someone other than the learner. */
export function consentCounts(learnerUserId: string, row: ConsentGrant): boolean {
  if (row.status !== "granted") return false;
  if (row.learner_user_id && row.learner_user_id !== learnerUserId) return false;
  if (row.method === "email_verified" || row.method === "school_contract") return true;
  return Boolean(row.recorded_by && row.recorded_by !== learnerUserId);
}

/** Adults are allowed. Under-18 learners need a counting consent row. */
export function minorLearningAllowed(
  ageBand: string | null | undefined,
  learnerUserId: string,
  rows: ConsentGrant[],
): boolean {
  if (!isUnder18Band(ageBand)) return true;
  return rows.some((row) => consentCounts(learnerUserId, row));
}

function responseMap(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length > 0);
}

/** Assessment answers inside a learner-state blob (not reflections or profile). */
export function payloadHasAssessmentAnswers(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const body = payload as {
    attempts?: { responses?: unknown }[];
    assessmentDraft?: { responses?: unknown };
    orientation?: { responses?: unknown };
  };
  if (Array.isArray(body.attempts) && body.attempts.some((attempt) => responseMap(attempt?.responses))) return true;
  if (responseMap(body.assessmentDraft?.responses)) return true;
  if (responseMap(body.orientation?.responses)) return true;
  return false;
}

/**
 * Drop assessment answers. Used when an under-18 learner has no consent
 * recorded by someone else — the rest of the blob (profile, consent, entitlement) stays.
 * The database trigger applies the same removal.
 */
export function redactAssessmentAnswers<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = { ...payload };
  delete next.attempts;
  delete next.assessmentDraft;
  const orientation = next.orientation;
  if (orientation && typeof orientation === "object" && !Array.isArray(orientation)) {
    const copy = { ...(orientation as Record<string, unknown>) };
    delete copy.responses;
    next.orientation = copy;
  }
  return next as T;
}

export function minorMaySyncAnswers(
  ageBand: string | null | undefined,
  learnerUserId: string,
  rows: ConsentGrant[],
): boolean {
  return minorLearningAllowed(ageBand, learnerUserId, rows);
}
