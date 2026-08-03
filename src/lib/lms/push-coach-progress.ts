import { buildFaceScoresFromState } from "@/lib/lms/face-scores";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

/**
 * Push consented non-journal progress (incl. face scores) to the org coach API.
 * No-op without org code + shareProgressWithCoach consent.
 */
export async function pushCoachProgressIfConsented(
  state?: LocalLmsState
): Promise<boolean> {
  const s = state ?? loadLmsState();
  if (!s.shareProgressWithCoach || !s.orgCode) return false;

  const pre = s.attempts.find((a) => a.phase === "pre");
  const post = s.attempts.find((a) => a.phase === "post");
  const lessonsCompleted = Object.values(s.lessonProgress).filter(
    (x) => x === "completed"
  ).length;

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
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
