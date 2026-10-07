/**
 * "Who is stuck where": a pure function that turns server records into one
 * pathway stage per learner. No journals, answers or scores are read here.
 */
import { MINOR_AGE_BANDS } from "@/lib/lms/consent";
import { POST_MIN_DAYS, sessionsRequiredFor } from "@/lib/lms/gates";
import type { AgeBand } from "@/lib/lms/profile";
import type { ProgrammeId } from "@/lib/programmes";

export type StageId =
  | "needs_consent"
  | "no_baseline"
  | "no_seat"
  | "learning"
  | "waiting_day21"
  | "post_open"
  | "post_done"
  | "certified";

export const STAGES: { id: StageId; label: string; hint: string }[] = [
  { id: "needs_consent", label: "Needs guardian consent", hint: "Under 18 with no granted consent on record" },
  { id: "no_baseline", label: "No baseline yet", hint: "Account created, baseline not taken" },
  { id: "no_seat", label: "Baseline done, no seat", hint: "Needs a paid programme or a cohort seat" },
  { id: "learning", label: "Learning", hint: "Working through sessions" },
  { id: "waiting_day21", label: "Waiting for day 21", hint: "Sessions done; after-test opens 21 days after baseline" },
  { id: "post_open", label: "After-test open", hint: "Everything is in place to re-measure" },
  { id: "post_done", label: "After-test done", hint: "Certificate not issued yet" },
  { id: "certified", label: "Certified", hint: "Certificate issued and valid" },
];

export type LearnerInput = {
  id: string;
  email: string | null;
  fullName: string | null;
  programmeId: string | null;
  createdAt: string;
  ageBand: string | null;
  lastActivityAt: string | null;
  preAt: string | null;
  postAt: string | null;
  completions: number;
  certificateValid: boolean;
  consentGranted: boolean;
  entitled: boolean;
  cohorts: string[];
};

export type LearnerRow = LearnerInput & {
  stage: StageId;
  minor: boolean;
  sessionsRequired: number;
  sessionsTotal: number;
  postOpensOn: string | null;
  inactiveDays: number | null;
};

const DAY = 86_400_000;

export function isMinor(ageBand: string | null | undefined): boolean {
  return Boolean(ageBand && (MINOR_AGE_BANDS as string[]).includes(ageBand as AgeBand));
}

export function learnerStage(l: LearnerInput, now = Date.now()): LearnerRow {
  const programme = (["kids", "adolescents", "adults"].includes(l.programmeId ?? "")
    ? l.programmeId
    : "adults") as ProgrammeId;
  const { total, required } = sessionsRequiredFor(programme);
  const minor = isMinor(l.ageBand);
  const postOpensOn = l.preAt ? new Date(new Date(l.preAt).getTime() + POST_MIN_DAYS * DAY).toISOString() : null;
  const last = l.lastActivityAt || l.postAt || l.preAt || l.createdAt;
  const inactiveDays = last ? Math.floor((now - new Date(last).getTime()) / DAY) : null;

  let stage: StageId;
  if (minor && !l.consentGranted) stage = "needs_consent";
  else if (l.certificateValid) stage = "certified";
  else if (l.postAt) stage = "post_done";
  else if (!l.preAt) stage = "no_baseline";
  else if (!l.entitled) stage = "no_seat";
  else if (l.completions < required) stage = "learning";
  else if (postOpensOn && new Date(postOpensOn).getTime() > now) stage = "waiting_day21";
  else stage = "post_open";

  return { ...l, stage, minor, sessionsRequired: required, sessionsTotal: total, postOpensOn, inactiveDays };
}
