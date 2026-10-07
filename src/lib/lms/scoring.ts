import type { ConstructId } from "@/lib/content";
import { constructs } from "@/lib/content";
import type { AssessmentItem } from "@/lib/lms/curriculum";
import { SJT_WEIGHT } from "@/lib/lms/instruments/v2-bank";

export type ResponseMap = Record<string, number>; // itemId -> 1..5

export interface ConstructScore {
  constructId: ConstructId;
  name: string;
  color: string;
  /** Mean Likert answer after reverse keying (1–5); 0 when the face has no Likert answers */
  rawMean: number;
  score: number; // 0-100
  itemCount: number;
  /** v2 only: Likert part (0–100) */
  likertScore?: number | null;
  /** v2 only: situational judgement part (0–100) */
  sjtScore?: number | null;
}

export interface AttemptResult {
  constructScores: ConstructScore[];
  overall: number;
}

/** Likert 1–5 → 0–100 scale */
export function likertToScore(value: number): number {
  const v = Math.min(5, Math.max(1, value));
  return ((v - 1) / 4) * 100;
}

/** Answer after keying: reverse-keyed items score 6 − answer. */
export function keyedValue(item: Pick<AssessmentItem, "reverse">, value: number): number {
  return item.reverse ? 6 - value : value;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Score an attempt. Works for every instrument version:
 *  - v1: Likert only, no reverse keying, so results are identical to the
 *    original engine (existing attempts keep their scores).
 *  - v2: reverse-keyed Likert items, plus SJT items scored by their
 *    effectiveness key. A face with both parts blends them
 *    (1 − SJT_WEIGHT) × Likert + SJT_WEIGHT × SJT.
 * Items or answers that don't belong (attention/honesty checks) are ignored.
 */
export function scoreAttempt(
  items: AssessmentItem[],
  responses: ResponseMap,
  sjtWeight: number = SJT_WEIGHT,
): AttemptResult {
  const constructScores: ConstructScore[] = constructs.map((c) => {
    const cItems = items.filter((i) => i.constructId === c.id);
    const likertValues: number[] = [];
    const sjtScores: number[] = [];
    for (const i of cItems) {
      const v = responses[i.id];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      if (i.itemType === "sjt") {
        const opt = i.options?.find((o) => o.value === v);
        if (opt) sjtScores.push(opt.score);
      } else if (v >= 1 && v <= 5) {
        likertValues.push(keyedValue(i, v));
      }
    }

    const rawMean =
      likertValues.length === 0
        ? 0
        : likertValues.reduce((a, b) => a + b, 0) / likertValues.length;
    const likertScore = likertValues.length ? likertToScore(rawMean) : null;
    const sjtScore = sjtScores.length ? sjtScores.reduce((a, b) => a + b, 0) / sjtScores.length : null;
    const score =
      likertScore != null && sjtScore != null
        ? (1 - sjtWeight) * likertScore + sjtWeight * sjtScore
        : (likertScore ?? sjtScore ?? 0);

    const base: ConstructScore = {
      constructId: c.id,
      name: c.name,
      color: c.color,
      rawMean,
      score: round1(score),
      itemCount: likertValues.length + sjtScores.length,
    };
    // Only v2 attempts carry the part scores, so v1 results stay byte-identical.
    if (sjtScores.length || cItems.some((i) => i.reverse)) {
      base.likertScore = likertScore == null ? null : round1(likertScore);
      base.sjtScore = sjtScore == null ? null : round1(sjtScore);
    }
    return base;
  });

  const scored = constructScores.filter((s) => s.itemCount > 0);
  const overall =
    scored.length === 0
      ? 0
      : round1(scored.reduce((a, s) => a + s.score, 0) / scored.length);

  return { constructScores, overall };
}

export function compareAttempts(
  pre: AttemptResult,
  post?: AttemptResult | null
) {
  return constructs.map((c) => {
    const preScore =
      pre.constructScores.find((s) => s.constructId === c.id)?.score ?? 0;
    const postScore = post
      ? (post.constructScores.find((s) => s.constructId === c.id)?.score ?? null)
      : null;
    const delta =
      postScore === null ? null : Math.round((postScore - preScore) * 10) / 10;
    return {
      constructId: c.id,
      name: c.name,
      color: c.color,
      pre: preScore,
      post: postScore,
      delta,
    };
  });
}

export function recommendations(result: AttemptResult): string[] {
  const sorted = [...result.constructScores].sort((a, b) => a.score - b.score);
  const lowest = sorted.slice(0, 2);
  const highest = [...sorted].reverse().slice(0, 2);

  const recs: string[] = [];
  highest.forEach((s) => {
    recs.push(
      `Strength: **${s.name}** (${s.score}). Keep deliberate practice here so it stays a leadership advantage.`
    );
  });
  lowest.forEach((s) => {
    recs.push(
      `Priority: develop **${s.name}** (${s.score}). Start with that course module and complete the practice lab this week.`
    );
  });
  return recs;
}

/* -------------------------------------------------------------------------- */
/* Honest change bands (reliable change, Jacobson & Truax 1991)               */
/* -------------------------------------------------------------------------- */

/**
 * PROVISIONAL psychometric constants until Super-Cube® norms exist.
 * - Face reliability 0.70 = midpoint of the founding study's α range (0.60–0.80).
 * - Overall reliability 0.85 = six faces averaged (Spearman-Brown style gain).
 * - SD 15 (faces) / 12 (overall) on the 0–100 scale are conservative placeholders.
 * Replace with values from the live norm sample (Phase 1).
 */
export const CHANGE_CONSTANTS = {
  face: { reliability: 0.7, sd: 15 },
  overall: { reliability: 0.85, sd: 12 },
} as const;

export type ChangeBandId =
  | "real_growth"
  | "possible_growth"
  | "within_noise"
  | "possible_decline"
  | "real_decline";

export interface ChangeBand {
  id: ChangeBandId;
  label: string;
  short: string;
  /** Reliable change index (delta / standard error of the difference) */
  rci: number;
  /** Points needed for "real" change at 95% confidence */
  threshold: number;
  tone: "good" | "neutral" | "bad";
}

export function reliableChangeThreshold(kind: "face" | "overall"): number {
  const { reliability, sd } = CHANGE_CONSTANTS[kind];
  const sem = sd * Math.sqrt(1 - reliability);
  const sDiff = Math.sqrt(2) * sem;
  return Math.round(1.96 * sDiff * 10) / 10;
}

export function changeBand(
  delta: number | null | undefined,
  kind: "face" | "overall" = "face",
): ChangeBand | null {
  if (delta == null || !Number.isFinite(delta)) return null;
  const { reliability, sd } = CHANGE_CONSTANTS[kind];
  const sDiff = Math.sqrt(2) * sd * Math.sqrt(1 - reliability);
  const rci = Math.round((delta / sDiff) * 100) / 100;
  const threshold = reliableChangeThreshold(kind);
  if (rci >= 1.96)
    return { id: "real_growth", label: "Real growth", short: "Real", rci, threshold, tone: "good" };
  if (rci >= 1)
    return { id: "possible_growth", label: "Possible growth (not yet certain)", short: "Possible", rci, threshold, tone: "neutral" };
  if (rci > -1)
    return { id: "within_noise", label: "Within normal noise", short: "Noise", rci, threshold, tone: "neutral" };
  if (rci > -1.96)
    return { id: "possible_decline", label: "Possible dip (not yet certain)", short: "Possible dip", rci, threshold, tone: "neutral" };
  return { id: "real_decline", label: "Real decline", short: "Decline", rci, threshold, tone: "bad" };
}
