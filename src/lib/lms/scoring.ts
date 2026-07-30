import type { ConstructId } from "@/lib/content";
import { constructs } from "@/lib/content";
import type { AssessmentItem } from "@/lib/lms/curriculum";

export type ResponseMap = Record<string, number>; // itemId -> 1..5

export interface ConstructScore {
  constructId: ConstructId;
  name: string;
  color: string;
  rawMean: number;
  score: number; // 0-100
  itemCount: number;
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

export function scoreAttempt(
  items: AssessmentItem[],
  responses: ResponseMap
): AttemptResult {
  const constructScores: ConstructScore[] = constructs.map((c) => {
    const cItems = items.filter((i) => i.constructId === c.id);
    const values = cItems
      .map((i) => responses[i.id])
      .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 5);

    const rawMean =
      values.length === 0
        ? 0
        : values.reduce((a, b) => a + b, 0) / values.length;

    return {
      constructId: c.id,
      name: c.name,
      color: c.color,
      rawMean,
      score: Math.round(likertToScore(rawMean) * 10) / 10,
      itemCount: values.length,
    };
  });

  const scored = constructScores.filter((s) => s.itemCount > 0);
  const overall =
    scored.length === 0
      ? 0
      : Math.round(
          (scored.reduce((a, s) => a + s.score, 0) / scored.length) * 10
        ) / 10;

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
