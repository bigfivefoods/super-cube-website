import { NextResponse } from "next/server";

export const revalidate = 3600;

export type LiveImpactResults = {
  available: boolean;
  /** ISO date the aggregate was produced */
  updatedAt?: string;
  cohorts?: number;
  learners?: number;
  /** Mean overall score change (0–100 scale), pre → post */
  overallDelta?: number;
  /** Mean change per face (0–100 scale) */
  byFace?: Partial<Record<
    "choices" | "principles" | "mental" | "emotional" | "physical" | "spiritual",
    number
  >>;
};

const FACES = [
  "choices",
  "principles",
  "mental",
  "emotional",
  "physical",
  "spiritual",
] as const;

/**
 * Aggregate, consented, anonymised cohort results for the public /impact page.
 *
 * Reads a JSON aggregate from IMPACT_RESULTS_URL when it is configured (for
 * example an endpoint the LMS publishes once cohorts complete post-assessment).
 * Until then it returns { available: false } and the page shows research
 * results only. Nothing here reads learner-level data.
 */
export async function GET() {
  const url = process.env.IMPACT_RESULTS_URL?.trim();
  if (!url) {
    return NextResponse.json({ available: false } satisfies LiveImpactResults);
  }
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(String(res.status));
    const raw = (await res.json()) as Record<string, unknown>;
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? v : undefined;
    const learners = num(raw.learners);
    // Privacy floor: never publish aggregates from very small groups.
    if (!learners || learners < 10) {
      return NextResponse.json({ available: false } satisfies LiveImpactResults);
    }
    const byFaceRaw = (raw.byFace ?? {}) as Record<string, unknown>;
    const byFace: LiveImpactResults["byFace"] = {};
    for (const f of FACES) {
      const v = num(byFaceRaw[f]);
      if (v !== undefined) byFace[f] = v;
    }
    return NextResponse.json({
      available: true,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
      cohorts: num(raw.cohorts),
      learners,
      overallDelta: num(raw.overallDelta),
      byFace,
    } satisfies LiveImpactResults);
  } catch {
    return NextResponse.json({ available: false } satisfies LiveImpactResults);
  }
}
