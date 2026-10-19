import { buildFaceScoresFromState } from "@/lib/lms/face-scores";
import { deriveFacePattern, getFacePulses } from "@/lib/lms/face-tracking";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

/**
 * Tell the server the learner's CURRENT sharing choice for their cohort.
 * Off: the server marks the snapshot as not shared and clears its figures.
 */
export async function syncCoachConsent(state?: LocalLmsState): Promise<boolean> {
  const s = state ?? loadLmsState();
  if (!s.orgCode) return false;
  if (s.shareProgressWithCoach) return pushCoachProgressIfConsented(s);
  try {
    const res = await fetch("/api/org/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgCode: s.orgCode, consent: false }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Push consented non-journal progress (incl. face scores + pulse meta) to the org coach API.
 * Without consent it syncs the "not shared" state instead (so a withdrawal reaches the
 * server even if it was made before this existed). No-op without an org code.
 */
export async function pushCoachProgressIfConsented(
  state?: LocalLmsState
): Promise<boolean> {
  const s = state ?? loadLmsState();
  if (!s.orgCode) return false;
  if (!s.shareProgressWithCoach) {
    void syncCoachConsent(s);
    return false;
  }

  const pre = s.attempts.find((a) => a.phase === "pre");
  const post = s.attempts.find((a) => a.phase === "post");
  const lessonsCompleted = Object.values(s.lessonProgress).filter(
    (x) => x === "completed"
  ).length;

  const pattern = deriveFacePattern(s);
  const pulses = getFacePulses(s);
  const lastPulseAt = pulses[0]?.at ?? null;

  try {
    const res = await fetch("/api/org/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgCode: s.orgCode,
        programmeId:
          s.subscription?.programmeId || s.user?.programmeId || null,
        consent: true,
        lessonsCompleted,
        preOverall: pre?.result.overall ?? null,
        postOverall: post?.result.overall ?? null,
        growth:
          pre && post
            ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
            : null,
        certificateId: s.certificateId ?? null,
        faceScores: buildFaceScoresFromState(s),
        pulseCount: pattern.pulseCount,
        pulseConsistency: pattern.consistency,
        lastPulseAt,
        pulseWindowDays: 28,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
