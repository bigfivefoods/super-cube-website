/**
 * Assessment integrity v1.1 (engineering only; item wording unchanged).
 *  - one attention-check item per attempt (not scored)
 *  - item order randomised within each face, from a per-attempt seed
 *  - data-quality flags: attention check, straight-lining, too fast
 *  - Cronbach's alpha for the live reliability view in admin
 * Shared by the browser and the server; no I/O here.
 */
import type { AssessmentItem } from "@/lib/lms/curriculum";
import type { ProgrammeId } from "@/lib/programmes";

export type QualityFlag =
  | "attention_failed"
  | "attention_missing"
  | "straight_lining"
  | "too_fast"
  | "honesty_low";

export const QUALITY_FLAG_LABELS: Record<QualityFlag, string> = {
  attention_failed: "Attention check missed",
  attention_missing: "No attention check (older app)",
  straight_lining: "Same answer to (almost) every item",
  too_fast: "Finished unusually fast",
  honesty_low: "Said answers only partly describe what they do (v2)",
};

/** v2 honesty item: an answer at or below this is flagged (EQ-i 2.0 uses the same idea). */
export const HONESTY_FLAG_AT_OR_BELOW = 3;

/** The attention check asks for "Agree" (4) on a 1–5 scale. */
export const ATTENTION_EXPECTED = 4;
/** Fewer than this many milliseconds per item on average is flagged as too fast. */
export const MIN_MS_PER_ITEM = 1500;
/** Share of identical answers at or above which an attempt is flagged as straight-lining. */
export const STRAIGHT_LINE_SHARE = 0.9;
/** Reliability is labelled provisional below this many usable attempts. */
export const RELIABILITY_MIN_N = 50;

export type AttentionItem = { id: string; prompt: string };

export function attentionItem(programmeId: ProgrammeId, version: "v1" | "v2" = "v1"): AttentionItem {
  if (version === "v2") {
    // v2 uses a frequency scale, so the check names "Often" (still 4)
    const prompt =
      programmeId === "kids"
        ? "This one checks that you are reading. Please tap 4 (Often)."
        : "To show you are reading each statement, please choose 4 (Often) for this one.";
    return { id: `super_cube_${programmeId}_v2-attention-1`, prompt };
  }
  const prompt =
    programmeId === "kids"
      ? "This one is a check that you are reading. Please tap 4 (Agree)."
      : "To show you are reading each statement, please choose 4 (Agree) for this one.";
  return { id: `super_cube_${programmeId}_v1-attention-1`, prompt };
}

/** Small, fast, deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  const r = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type ShownItem = {
  id: string;
  prompt: string;
  constructId: string;
  attention?: boolean;
  itemType?: AssessmentItem["itemType"];
  options?: AssessmentItem["options"];
  scaleLabels?: AssessmentItem["scaleLabels"];
};

/**
 * Items for one face in a stable random order for this attempt. The attention
 * check is placed on one face (chosen by the seed) at a random position among
 * the statements. v2 situational judgement items follow the statements, in
 * their own random order. (v1 has no SJTs, so its order is unchanged.)
 */
export function itemsForFace(
  items: AssessmentItem[],
  faceIds: string[],
  faceId: string,
  seed: number,
  attention: AttentionItem,
): ShownItem[] {
  const faceIndex = faceIds.indexOf(faceId);
  const toShown = (i: AssessmentItem): ShownItem => {
    const s: ShownItem = { id: i.id, prompt: i.prompt, constructId: i.constructId };
    if (i.itemType === "sjt") {
      s.itemType = "sjt";
      s.options = i.options;
    }
    if (i.scaleLabels) s.scaleLabels = i.scaleLabels;
    return s;
  };
  const faceItems = items.filter((i) => i.constructId === faceId);
  const own: ShownItem[] = seededShuffle(
    faceItems.filter((i) => i.itemType !== "sjt"),
    seed + faceIndex * 7919,
  ).map(toShown);
  const sjts: ShownItem[] = seededShuffle(
    faceItems.filter((i) => i.itemType === "sjt"),
    seed + faceIndex * 7919 + 1,
  ).map(toShown);
  const r = rng(seed ^ 0x5bd1e995);
  const attentionFace = Math.floor(r() * faceIds.length);
  if (attentionFace === faceIndex && own.length > 0) {
    // never first on the face, so it doesn't stand out
    const pos = 1 + Math.floor(r() * own.length);
    own.splice(pos, 0, {
      id: attention.id,
      prompt: attention.prompt,
      constructId: "attention",
      attention: true,
      ...(own[0]?.scaleLabels ? { scaleLabels: own[0].scaleLabels } : {}),
    });
  }
  return [...own, ...sjts];
}

/** Full order shown for an attempt (face by face), used to store item positions. */
export function itemOrder(items: AssessmentItem[], faceIds: string[], seed: number, attention: AttentionItem): string[] {
  return faceIds.flatMap((f) => itemsForFace(items, faceIds, f, seed, attention).map((i) => i.id));
}

export function isStraightLining(values: number[]): boolean {
  if (values.length < 6) return false;
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const top = Math.max(...counts.values());
  return top / values.length >= STRAIGHT_LINE_SHARE;
}

export function qualityFlags(input: {
  scoredValues: number[];
  attentionValue: number | null | undefined;
  durationMs?: number | null;
  /** v2 only */
  honestyValue?: number | null;
}): QualityFlag[] {
  const flags: QualityFlag[] = [];
  if (input.attentionValue == null) flags.push("attention_missing");
  else if (input.attentionValue !== ATTENTION_EXPECTED) flags.push("attention_failed");
  if (isStraightLining(input.scoredValues)) flags.push("straight_lining");
  const n = input.scoredValues.length + (input.attentionValue == null ? 0 : 1);
  if (input.durationMs != null && input.durationMs > 0 && input.durationMs < n * MIN_MS_PER_ITEM) flags.push("too_fast");
  if (input.honestyValue != null && input.honestyValue <= HONESTY_FLAG_AT_OR_BELOW) flags.push("honesty_low");
  return flags;
}

function variance(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / n;
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1);
}

/**
 * Cronbach's alpha for a respondents × items matrix (complete rows only).
 * Returns null when it can't be estimated (fewer than 2 items or 3 respondents,
 * or no variance in totals).
 */
export function cronbachAlpha(rows: number[][]): number | null {
  const complete = rows.filter((r) => r.length > 0 && r.every((v) => Number.isFinite(v)));
  if (complete.length < 3) return null;
  const k = complete[0].length;
  if (k < 2 || complete.some((r) => r.length !== k)) return null;
  const itemVars = Array.from({ length: k }, (_, j) => variance(complete.map((r) => r[j])));
  const totalVar = variance(complete.map((r) => r.reduce((a, b) => a + b, 0)));
  if (totalVar === 0) return null;
  return (k / (k - 1)) * (1 - itemVars.reduce((a, b) => a + b, 0) / totalVar);
}

/** Plain-language band for alpha (George & Mallery style, simplified). */
export function alphaBand(a: number | null): string {
  if (a == null) return "Not enough data";
  if (a >= 0.9) return "Excellent";
  if (a >= 0.8) return "Good";
  if (a >= 0.7) return "Acceptable";
  if (a >= 0.6) return "Questionable";
  return "Poor";
}
