import type { ConstructId } from "@/lib/content";
import { deriveFacePattern } from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";

export type FaceScoreMap = Partial<
  Record<
    ConstructId,
    { pre?: number; post?: number; mid?: number; pulse?: number }
  >
>;

/** Build face score payload for coach progress API (consented only). */
export function buildFaceScoresFromState(state: LocalLmsState): FaceScoreMap {
  const map: FaceScoreMap = {};
  for (const phase of ["pre", "mid", "post"] as const) {
    const attempt = state.attempts.find((a) => a.phase === phase);
    if (!attempt) continue;
    for (const s of attempt.result.constructScores) {
      const cur = map[s.constructId] ?? {};
      cur[phase] = s.score;
      map[s.constructId] = cur;
    }
  }

  // Longitudinal pulse averages (0–100) from recent tracking
  const pattern = deriveFacePattern(state);
  if (pattern.pulseCount > 0) {
    for (const [id, avg] of Object.entries(pattern.averages)) {
      if (typeof avg !== "number") continue;
      const key = id as ConstructId;
      const cur = map[key] ?? {};
      cur.pulse = avg;
      map[key] = cur;
    }
  }

  return map;
}

export function meanFaceScores(
  maps: FaceScoreMap[],
  phase: "pre" | "post" | "mid" | "pulse" = "pre"
): Partial<Record<ConstructId, number>> {
  const sums: Partial<Record<ConstructId, number>> = {};
  const counts: Partial<Record<ConstructId, number>> = {};
  for (const m of maps) {
    for (const [id, v] of Object.entries(m)) {
      const score = v?.[phase];
      if (typeof score !== "number") continue;
      const key = id as ConstructId;
      sums[key] = (sums[key] ?? 0) + score;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  const out: Partial<Record<ConstructId, number>> = {};
  for (const id of Object.keys(sums) as ConstructId[]) {
    const c = counts[id] ?? 0;
    if (c > 0) out[id] = Math.round(((sums[id] ?? 0) / c) * 10) / 10;
  }
  return out;
}
