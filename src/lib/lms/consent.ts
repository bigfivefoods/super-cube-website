/**
 * Parent / guardian consent for learners under 18 (POPIA section 35(1)(a):
 * prior consent of a competent person).
 *
 * Phase 0 method: the parent or guardian completes the consent screen on the
 * learner's device ("on-device attestation"). Schools may instead consent
 * under a school contract (method "school_contract", Phase 1).
 * Full wording, email template and policy section: docs/guardian-consent.md
 */

import type { AgeBand, LearnerProfile } from "@/lib/lms/profile";

export const CONSENT_TEXT_VERSION = "guardian-2026-10-v1";

export const MINOR_AGE_BANDS: AgeBand[] = ["under-13", "13-17"];

export const GUARDIAN_RELATIONSHIPS = [
  "Parent",
  "Legal guardian",
  "Foster parent",
  "Other person with parental responsibility",
] as const;

export const CONSENT_INTRO =
  "Super-Cube® helps young people grow as leaders, and we look after their information carefully. South Africa's privacy law (POPIA) says a parent or guardian must agree before we use a child's personal information. Please read this with your child, then complete the form yourself.";

export const CONSENT_POINTS: { label: string; text: string }[] = [
  {
    label: "Why",
    text: "We use your child's information only to run their Super-Cube® programme, show their progress and growth report, and issue their certificate. We never sell it, never use it for advertising, and never share it for anyone else's marketing.",
  },
  {
    label: "What we collect",
    text: "Their first name or nickname, age band and learning context (for example school or sport); their assessment answers and scores; their session progress and certificate; and their private reflections. If they sign in, we also store a login email. We do not collect ID numbers, photos, location or health information.",
  },
  {
    label: "Who sees it",
    text: "Your child, and you on their device or account. Reflections are always private. A coach or school only sees your child's scores and progress if your child joins their cohort with a code, and never their reflections. Any reports we publish or share with funders are anonymous and grouped (aggregate only).",
  },
  {
    label: "How long we keep it",
    text: "While your child uses Super-Cube®. When you delete it, it is erased straight away from our live systems and from backups within 30 days. We keep only an anonymous note that a deletion happened.",
  },
  {
    label: "Your rights",
    text: "You can withdraw consent or delete everything at any time from the You page (Delete my data), or by emailing us. You may also ask to see or correct your child's information, or complain to the Information Regulator (inforegulator.org.za).",
  },
  {
    label: "Good to know",
    text: "Super-Cube® is a self-reflection and learning tool. It is not a psychological or clinical assessment.",
  },
  {
    label: "Questions",
    text: "hello@super-cube.me",
  },
];

export const CONSENT_CHECKBOX_TEXT =
  "I am this learner's parent, legal guardian or other person with parental responsibility. I have read the points above with my child, and I consent to Super-Cube® using my child's information as described, for their leadership programme. I know I can withdraw this consent or delete their data at any time.";

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
