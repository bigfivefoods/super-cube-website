/**
 * 360 / observer feedback (shared by browser and server; no I/O here).
 * Behind a switch that is OFF by default: LMS_360=on (server) and
 * NEXT_PUBLIC_LMS_360=on (browser). Adults only for now; Kids/Teens observer
 * wording exists in the v2 bank and waits for a guardian-consent decision.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { likertToScore } from "@/lib/lms/scoring";
import type { ObserverItem } from "@/lib/lms/instruments";

export type RaterRelationship = "manager" | "peer" | "direct_report" | "other";

export const RELATIONSHIP_LABELS: Record<RaterRelationship, string> = {
  manager: "Manager",
  peer: "Peer",
  direct_report: "Direct report",
  other: "Other colleague",
};

/** A group (or "all others") is only shown once this many raters have answered. */
export const MIN_RATERS_TO_SHOW = 3;
export const MAX_RATERS_PER_REQUEST = 12;

export function is360EnabledServer(): boolean {
  return (process.env.LMS_360 ?? "").trim().toLowerCase() === "on";
}
export function is360EnabledClient(): boolean {
  return (process.env.NEXT_PUBLIC_LMS_360 ?? "").trim().toLowerCase() === "on";
}

export type FaceObserverScore = { constructId: ConstructId; score: number | null; answered: number };

/**
 * Score one observer response. 1..5 answers on the frequency scale, reverse
 * items flipped; 0 means "I haven't seen this" and is left out.
 */
export function scoreObserver(items: ObserverItem[], responses: Record<string, number>): FaceObserverScore[] {
  return constructs.map((c) => {
    const vals = items
      .filter((i) => i.constructId === c.id)
      .map((i) => {
        const v = responses[i.id];
        if (!Number.isInteger(v) || v < 1 || v > 5) return null;
        return i.reverse ? 6 - v : v;
      })
      .filter((v): v is number => v != null);
    const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    return {
      constructId: c.id,
      score: mean == null ? null : Math.round(likertToScore(mean) * 10) / 10,
      answered: vals.length,
    };
  });
}

/** Validate a rater's answers: every item 0..5 (0 = not observed), at least half observed. */
export function validateObserverResponses(
  items: ObserverItem[],
  raw: unknown,
): { ok: true; responses: Record<string, number> } | { ok: false; error: string } {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Record<string, number> = {};
  for (const i of items) {
    const v = Number(src[i.id]);
    if (!Number.isInteger(v) || v < 0 || v > 5) return { ok: false, error: "Please answer every statement" };
    out[i.id] = v;
  }
  const seen = Object.values(out).filter((v) => v > 0).length;
  if (seen < Math.ceil(items.length / 2)) {
    return { ok: false, error: "Please rate at least half of the statements (use “I haven't seen this” for the rest)" };
  }
  return { ok: true, responses: out };
}

/**
 * Average face scores across raters, ignoring faces a rater could not observe.
 * A face observed by fewer than minPerFace raters shows no score, so one
 * person's view can never be singled out (anonymity holds per face, not just per group).
 */
export function averageObserverScores(rows: FaceObserverScore[][], minPerFace = 1): FaceObserverScore[] {
  return constructs.map((c) => {
    const vals = rows
      .map((r) => r.find((f) => f.constructId === c.id)?.score)
      .filter((v): v is number => typeof v === "number");
    return {
      constructId: c.id,
      score: vals.length && vals.length >= minPerFace ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null,
      answered: vals.length,
    };
  });
}
