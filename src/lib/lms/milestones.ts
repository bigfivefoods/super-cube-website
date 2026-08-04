/**
 * Milestone badges derived from LMS state — surface on You page.
 */

import type { LocalLmsState } from "@/lib/lms/store";
import { profileComplete, getProfile } from "@/lib/lms/profile";

export interface Milestone {
  id: string;
  label: string;
  earned: boolean;
  detail?: string;
}

export function getMilestones(state: LocalLmsState): Milestone[] {
  const profile = getProfile(state);
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");
  const lessons = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;
  const reflections = Object.values(state.reflections ?? {}).filter((r) =>
    r.text?.trim()
  ).length;
  const pulses = state.facePulses?.length ?? 0;
  const streak = state.practiceStreak?.current ?? 0;
  const best = state.practiceStreak?.best ?? 0;

  return [
    {
      id: "profile",
      label: "Profile set",
      earned: profileComplete(profile),
      detail: profile?.displayName,
    },
    {
      id: "orient",
      label: "Oriented",
      earned: Boolean(state.orientation),
      detail: state.orientation?.result.label,
    },
    {
      id: "baseline",
      label: "Baseline",
      earned: Boolean(pre),
      detail: pre ? `Overall ${pre.result.overall}` : undefined,
    },
    {
      id: "first_pulse",
      label: "First pulse",
      earned: pulses >= 1,
      detail: pulses > 0 ? `${pulses} total` : undefined,
    },
    {
      id: "first_lesson",
      label: "First session",
      earned: lessons >= 1,
      detail: lessons ? `${lessons} done` : undefined,
    },
    {
      id: "reflect",
      label: "First reflection",
      earned: reflections >= 1,
      detail: reflections ? `${reflections} journal` : undefined,
    },
    {
      id: "streak3",
      label: "3-day streak",
      earned: best >= 3 || streak >= 3,
      detail: streak ? `Now ${streak}d` : undefined,
    },
    {
      id: "streak7",
      label: "7-day streak",
      earned: best >= 7 || streak >= 7,
      detail: best >= 7 ? `Best ${best}d` : undefined,
    },
    {
      id: "pulse10",
      label: "10 pulses",
      earned: pulses >= 10,
      detail: pulses ? `${pulses} logged` : undefined,
    },
    {
      id: "post",
      label: "Post-assessment",
      earned: Boolean(post),
      detail: post ? `Overall ${post.result.overall}` : undefined,
    },
    {
      id: "certificate",
      label: "Certificate",
      earned: Boolean(state.certificateId),
      detail: state.certificateId,
    },
    {
      id: "cohort",
      label: "Joined cohort",
      earned: Boolean(state.orgCode),
      detail: state.orgCode,
    },
  ];
}

export function earnedCount(state: LocalLmsState): number {
  return getMilestones(state).filter((m) => m.earned).length;
}
