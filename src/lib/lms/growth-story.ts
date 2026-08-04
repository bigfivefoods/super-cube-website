/**
 * Auto growth narrative for Report — pre/post + pulse patterns.
 */

import { constructs } from "@/lib/content";
import { deriveFacePattern } from "@/lib/lms/face-tracking";
import { buildAssessmentNarrative } from "@/lib/lms/narrative";
import { compareAttempts } from "@/lib/lms/scoring";
import type { LocalLmsState } from "@/lib/lms/store";
import { getProfile } from "@/lib/lms/profile";

export function buildGrowthStory(state: LocalLmsState): {
  headline: string;
  body: string;
  focusLine: string;
} {
  const name =
    getProfile(state)?.displayName?.split(" ")[0] ||
    state.user?.fullName?.split(" ")[0] ||
    "You";
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");
  const pattern = deriveFacePattern(state);

  if (!pre) {
    return {
      headline: `${name}, your story starts with a baseline.`,
      body: "Take the pre-assessment to map the six faces. Practice and pulses will write the next chapters.",
      focusLine: "Next: complete orientation (if needed) and your baseline assessment.",
    };
  }

  if (!post) {
    const narrative = buildAssessmentNarrative(pre.result);
    const weak =
      narrative.weakestIds
        .map((id) => constructs.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(" and ") || "your stretch faces";
    return {
      headline: narrative.overallHeadline,
      body: `${narrative.overallBody} Right now ${weak} offer the highest leverage. ${pattern.insight}`,
      focusLine: narrative.weekFocus,
    };
  }

  const growth =
    Math.round((post.result.overall - pre.result.overall) * 10) / 10;
  const rows = compareAttempts(pre.result, post.result);
  const lifted = [...rows]
    .filter((r) => (r.delta ?? 0) > 0)
    .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const stalled = [...rows]
    .filter((r) => (r.delta ?? 0) <= 0)
    .sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));

  const top = lifted[0];
  const soft = stalled[0];

  let headline =
    growth > 0
      ? `${name}, you grew +${growth} overall — deliberate practice shows.`
      : growth === 0
        ? `${name}, overall held steady — refine the stretch faces next.`
        : `${name}, overall shifted ${growth}. Use this as honest data, not a verdict.`;

  const parts: string[] = [];
  if (top && top.delta != null) {
    parts.push(
      `Strongest lift: ${top.name} (${top.delta > 0 ? "+" : ""}${top.delta}).`
    );
  }
  if (soft && soft.delta != null) {
    parts.push(
      `${soft.name} needs more deliberate reps (${soft.delta > 0 ? "+" : ""}${soft.delta}).`
    );
  }
  if (pattern.pulseCount >= 3) {
    parts.push(pattern.insight);
  } else {
    parts.push(
      "Keep logging face pulses so the next chapter includes lived daily patterns, not only bookend scores."
    );
  }

  const focusName =
    soft?.name ||
    constructs.find((c) => c.id === pattern.weakest[0])?.name ||
    "your lowest face";

  return {
    headline,
    body: parts.join(" "),
    focusLine: `This month: one session and three micro-practices on ${focusName}.`,
  };
}
