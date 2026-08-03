/**
 * Learner demographic + identity profile (local, privacy-first).
 * Captured at start; powers You, Report context, and cohort matching.
 */

import type { ProgrammeId } from "@/lib/programmes";
import { loadLmsState, saveLmsState, type LocalLmsState } from "@/lib/lms/store";

export type AgeBand =
  | "under-13"
  | "13-17"
  | "18-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55+";

export type LearnerRole =
  | "student"
  | "educator"
  | "manager"
  | "executive"
  | "entrepreneur"
  | "parent"
  | "professional"
  | "other";

export type LearningContext =
  | "school"
  | "university"
  | "corporate"
  | "ngo"
  | "family"
  | "self"
  | "faith"
  | "other";

export type CohortKind = "solo" | "family" | "school" | "company" | "friends";

export interface LearnerProfile {
  displayName: string;
  email?: string;
  ageBand?: AgeBand;
  role?: LearnerRole;
  context?: LearningContext;
  country?: string;
  city?: string;
  goal?: string;
  cohortKind?: CohortKind;
  /** Preferred programme derived from age band */
  programmeId?: ProgrammeId;
  profileCompletedAt?: string;
  /** Optional bio line for You page */
  about?: string;
}

export const AGE_BANDS: { id: AgeBand; label: string; programmeId: ProgrammeId }[] =
  [
    { id: "under-13", label: "Under 13", programmeId: "kids" },
    { id: "13-17", label: "13–17", programmeId: "adolescents" },
    { id: "18-24", label: "18–24", programmeId: "adolescents" },
    { id: "25-34", label: "25–34", programmeId: "adults" },
    { id: "35-44", label: "35–44", programmeId: "adults" },
    { id: "45-54", label: "45–54", programmeId: "adults" },
    { id: "55+", label: "55+", programmeId: "adults" },
  ];

export const ROLES: { id: LearnerRole; label: string }[] = [
  { id: "student", label: "Student" },
  { id: "educator", label: "Educator / teacher" },
  { id: "manager", label: "Manager / team lead" },
  { id: "executive", label: "Executive / senior leader" },
  { id: "entrepreneur", label: "Entrepreneur" },
  { id: "parent", label: "Parent / caregiver" },
  { id: "professional", label: "Professional" },
  { id: "other", label: "Other" },
];

export const CONTEXTS: { id: LearningContext; label: string }[] = [
  { id: "school", label: "School" },
  { id: "university", label: "University / college" },
  { id: "corporate", label: "Company / workplace" },
  { id: "ngo", label: "NPO / NGO" },
  { id: "family", label: "Family" },
  { id: "faith", label: "Faith community" },
  { id: "self", label: "Personal growth" },
  { id: "other", label: "Other" },
];

export const COHORT_KINDS: { id: CohortKind; label: string; hint: string }[] = [
  { id: "solo", label: "Just me", hint: "Learn on your own pace" },
  { id: "family", label: "Family", hint: "Parents, kids, household" },
  { id: "school", label: "School / class", hint: "Teacher or school code" },
  { id: "company", label: "Company / team", hint: "Work cohort or pilot" },
  { id: "friends", label: "Friends / peers", hint: "Study circle" },
];

export function profileComplete(p?: LearnerProfile | null): boolean {
  if (!p?.displayName?.trim()) return false;
  if (!p.ageBand || !p.role || !p.context) return false;
  return Boolean(p.profileCompletedAt);
}

export function getProfile(state?: LocalLmsState): LearnerProfile | undefined {
  const s = state ?? loadLmsState();
  if (s.profile) return s.profile;
  // Back-compat from user field
  if (s.user?.fullName) {
    return {
      displayName: s.user.fullName,
      email: s.user.email,
      programmeId: s.user.programmeId,
    };
  }
  return undefined;
}

export function saveProfile(
  partial: Partial<LearnerProfile>,
  opts?: { complete?: boolean }
): LocalLmsState {
  const state = loadLmsState();
  const prev = state.profile ?? getProfile(state) ?? { displayName: "" };
  const age = partial.ageBand ?? prev.ageBand;
  const programmeId =
    partial.programmeId ??
    (age ? AGE_BANDS.find((a) => a.id === age)?.programmeId : undefined) ??
    prev.programmeId;

  const profile: LearnerProfile = {
    ...prev,
    ...partial,
    displayName: (partial.displayName ?? prev.displayName ?? "").trim(),
    programmeId,
    profileCompletedAt: opts?.complete
      ? new Date().toISOString()
      : prev.profileCompletedAt,
  };

  state.profile = profile;
  state.user = {
    email: profile.email || state.user?.email || "",
    fullName: profile.displayName || state.user?.fullName || "Learner",
    programmeId: programmeId || state.user?.programmeId,
  };
  if (programmeId) {
    if (state.subscription) {
      state.subscription = { ...state.subscription, programmeId };
    }
  }
  saveLmsState(state);
  return state;
}

export function profileStory(p: LearnerProfile): string {
  const bits: string[] = [];
  if (p.role) {
    const role = ROLES.find((r) => r.id === p.role)?.label ?? p.role;
    bits.push(role);
  }
  if (p.context) {
    const ctx = CONTEXTS.find((c) => c.id === p.context)?.label ?? p.context;
    bits.push(ctx.toLowerCase());
  }
  if (p.ageBand) bits.push(`age ${p.ageBand}`);
  if (p.city || p.country) {
    bits.push([p.city, p.country].filter(Boolean).join(", "));
  }
  if (!bits.length) return "Complete your profile to personalise Learn.";
  return bits.join(" · ");
}
