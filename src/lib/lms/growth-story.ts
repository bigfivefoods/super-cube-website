/**
 * Auto growth narrative for Report — pre/post + pulse patterns.
 */

import { constructs } from "@/lib/content";
import { deriveFacePattern } from "@/lib/lms/face-tracking";
import { buildAssessmentNarrative } from "@/lib/lms/narrative";
import { changeBand, compareAttempts } from "@/lib/lms/scoring";
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
    const narrative = buildAssessmentNarrative(pre.result, pre.programmeId);
    const weak =
      narrative.weakestIds
        .map((id) => constructs.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(" and ") || "your stretch faces";
    return {
      headline: narrative.overallHeadline,
      body: `${narrative.overallBody} ${weak} are your growth faces for the next 21 days. ${pattern.insight}`,
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

  const band = changeBand(growth, "overall");
  const sessionsDone = Object.values(state.lessonProgress).filter((v) => v === "completed").length;
  const signed = `${growth > 0 ? "+" : ""}${growth}`;

  // Honest framing: only call it growth when it is bigger than measurement noise,
  // and never attribute change to practice that did not happen.
  const headline =
    band?.id === "real_growth"
      ? `${name}, your overall score rose ${signed}, more than normal measurement noise.`
      : band?.id === "possible_growth"
        ? `${name}, your overall score rose ${signed}. That may be real growth, but it is not yet bigger than measurement noise.`
        : band?.id === "within_noise"
          ? `${name}, your overall score moved ${signed}, which is within normal measurement noise.`
          : band?.id === "possible_decline"
            ? `${name}, your overall score dipped ${signed}. That may be noise; treat it as data, not a verdict.`
            : `${name}, your overall score fell ${signed}. Use this as honest data, not a verdict.`;

  const parts: string[] = [];
  if (sessionsDone === 0) {
    parts.push("No practice sessions are recorded between your two sittings, so any change cannot be credited to the programme.");
  } else {
    parts.push(`${sessionsDone} practice session${sessionsDone === 1 ? "" : "s"} recorded between baseline and after-test.`);
  }
  if (top && top.delta != null) {
    const b = changeBand(top.delta, "face");
    parts.push(
      `Largest rise: ${top.name} (+${top.delta}${b ? `, ${b.label.toLowerCase()}` : ""}).`
    );
  }
  if (soft && soft.delta != null) {
    parts.push(
      `${soft.name} is the face to practise next (${soft.delta > 0 ? "+" : ""}${soft.delta}).`
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
