/**
 * Parent / guardian consent for learners under 18 (POPIA section 35).
 *
 * Phase 0 method: the parent or guardian completes the consent screen on the
 * learner's device ("on-device attestation"). Wording is a DRAFT pending
 * Dr Muller's / a privacy practitioner's sign-off. Schools may instead consent
 * under a school contract (method "school_contract", Phase 1).
 */

import type { AgeBand, LearnerProfile } from "@/lib/lms/profile";

export const CONSENT_TEXT_VERSION = "guardian-2026-10-draft-1";

export const MINOR_AGE_BANDS: AgeBand[] = ["under-13", "13-17"];

export const GUARDIAN_RELATIONSHIPS = [
  "Parent",
  "Legal guardian",
  "Foster parent",
  "Other person with parental responsibility",
] as const;

export const CONSENT_POINTS = [
  "Super-Cube® will store your child's first name, age band, learning context, assessment answers, scores, session progress and private reflections.",
  "We use this only to run your child's leadership programme and show their growth report. We never sell it or use it for advertising.",
  "Reflections stay private. A teacher or coach only sees scores and progress if your child joins their cohort and sharing is switched on.",
  "You can withdraw consent or delete all of your child's data at any time from the You page (Delete my data).",
  "Results are developmental self-reflection, not a psychological or clinical assessment.",
];

export interface GuardianConsentRecord {
  guardianName: string;
  guardianEmail?: string;
  relationship: string;
  ageBand: AgeBand;
  textVersion: string;
  grantedAt: string;
  method: "on_device_attestation";
  cloudSaved?: boolean;
}

export function isMinorProfile(p?: LearnerProfile | null): boolean {
  return Boolean(p?.ageBand && MINOR_AGE_BANDS.includes(p.ageBand));
}

export function hasValidGuardianConsent(
  p: LearnerProfile | null | undefined,
  consent: GuardianConsentRecord | null | undefined,
): boolean {
  if (!isMinorProfile(p)) return true;
  return Boolean(consent && consent.textVersion === CONSENT_TEXT_VERSION && consent.ageBand === p?.ageBand);
}
