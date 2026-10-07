/**
 * Cohort impact statistics for coaches and sponsors (Phase 1 · stage 6).
 * Pure functions over consented progress snapshots (scores 0–100, never journal text).
 *
 * Before/after per face is paired: only learners with both a baseline and a re-measure count.
 * - 95% confidence intervals use Student's t (two-sided).
 * - Cohen's d is d_av: mean change ÷ the average of the before and after SDs
 *   (Cumming 2012; Lakens 2013), which keeps d comparable with between-group effect sizes.
 * - Groups smaller than MIN_GROUP are suppressed so no single learner can be singled out.
 */

export const MIN_GROUP = 3;

const T95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12,
  2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
];

/** Two-sided 95% critical t for df degrees of freedom. */
export function tCritical95(df: number): number {
  if (df < 1) return Number.NaN;
  if (df <= 30) return T95[df - 1];
  if (df <= 40) return 2.021;
  if (df <= 60) return 2.0;
  if (df <= 120) return 1.98;
  return 1.96;
}

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n − 1). */
export function sd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

export interface Interval {
  mean: number;
  low: number;
  high: number;
}

export function ci95(xs: number[]): Interval {
  const m = mean(xs);
  const half = xs.length > 1 ? (tCritical95(xs.length - 1) * sd(xs)) / Math.sqrt(xs.length) : Number.NaN;
  return { mean: m, low: m - half, high: m + half };
}

export type EffectLabel = "negligible" | "small" | "medium" | "large";

export function effectLabel(d: number): EffectLabel {
  const a = Math.abs(d);
  if (a < 0.2) return "negligible";
  if (a < 0.5) return "small";
  if (a < 0.8) return "medium";
  return "large";
}

export interface PairedResult {
  n: number;
  before: Interval;
  after: Interval;
  change: Interval;
  /** Cohen's d_av; null when both SDs are 0 */
  d: number | null;
  label: EffectLabel | null;
}

/** Paired before/after summary, or null when fewer than MIN_GROUP pairs. */
export function pairedSummary(pairs: { pre: number; post: number }[]): PairedResult | null {
  const ok = pairs.filter((p) => Number.isFinite(p.pre) && Number.isFinite(p.post));
  if (ok.length < MIN_GROUP) return null;
  const pre = ok.map((p) => p.pre);
  const post = ok.map((p) => p.post);
  const diff = ok.map((p) => p.post - p.pre);
  const sAv = (sd(pre) + sd(post)) / 2;
  const d = sAv > 0 ? mean(diff) / sAv : null;
  return {
    n: ok.length,
    before: ci95(pre),
    after: ci95(post),
    change: ci95(diff),
    d,
    label: d == null ? null : effectLabel(d),
  };
}

export interface CohortLearner {
  userId: string;
  displayName: string | null;
  role: string;
  joinedAt: string;
  progress: {
    pathway_pct?: number;
    lessons_completed?: number;
    pre_overall?: number | null;
    post_overall?: number | null;
    growth?: number | null;
    certificate_id?: string | null;
    face_scores?: Record<string, { pre?: number; post?: number; mid?: number }> | null;
    last_pulse_at?: string | null;
    client_updated_at?: string | null;
  } | null;
}

export const FUNNEL_STEPS = [
  { id: "joined", label: "Joined the cohort" },
  { id: "sharing", label: "Sharing progress" },
  { id: "baseline", label: "Baseline taken" },
  { id: "started", label: "Started sessions" },
  { id: "halfway", label: "Halfway through" },
  { id: "post", label: "Re-measured" },
  { id: "certified", label: "Certified" },
] as const;

export function isLearner(r: CohortLearner): boolean {
  return r.role !== "coach" && r.role !== "admin";
}

export function funnel(rows: CohortLearner[]): { id: string; label: string; count: number; pct: number }[] {
  const learners = rows.filter(isLearner);
  const total = learners.length;
  const has = (pred: (r: CohortLearner) => boolean) => learners.filter(pred).length;
  const counts: Record<string, number> = {
    joined: total,
    sharing: has((r) => Boolean(r.progress)),
    baseline: has((r) => r.progress?.pre_overall != null),
    started: has((r) => (r.progress?.lessons_completed ?? 0) >= 1),
    halfway: has((r) => (r.progress?.pathway_pct ?? 0) >= 50),
    post: has((r) => r.progress?.post_overall != null),
    certified: has((r) => Boolean(r.progress?.certificate_id)),
  };
  return FUNNEL_STEPS.map((s) => ({
    id: s.id,
    label: s.label,
    count: counts[s.id],
    pct: total ? Math.round((counts[s.id] / total) * 100) : 0,
  }));
}

const DAY = 86_400_000;

export interface AtRisk {
  userId: string;
  name: string;
  reasons: string[];
}

/** Supportive flags for learners who may need a check-in. Only learners who share progress can be flagged. */
export function atRiskLearners(rows: CohortLearner[], now: Date = new Date()): AtRisk[] {
  const out: AtRisk[] = [];
  for (const r of rows.filter(isLearner)) {
    const p = r.progress;
    if (!p) continue;
    const reasons: string[] = [];
    const sinceJoin = Math.floor((now.getTime() - Date.parse(r.joinedAt)) / DAY);
    const lastSeen = Math.max(
      p.client_updated_at ? Date.parse(p.client_updated_at) : 0,
      p.last_pulse_at ? Date.parse(p.last_pulse_at) : 0,
    );
    const quietDays = lastSeen ? Math.floor((now.getTime() - lastSeen) / DAY) : null;
    if (p.pre_overall == null && sinceJoin >= 7) reasons.push(`No baseline ${sinceJoin} days after joining`);
    if (quietDays != null && quietDays >= 14) reasons.push(`Quiet for ${quietDays} days`);
    if (sinceJoin >= 21 && (p.pathway_pct ?? 0) < 25 && p.post_overall == null) {
      reasons.push(`${p.pathway_pct ?? 0}% of sessions after ${Math.floor(sinceJoin / 7)} weeks`);
    }
    if (p.growth != null && p.growth <= -5) reasons.push(`Overall score down ${Math.abs(p.growth)} points since baseline`);
    if (reasons.length) out.push({ userId: r.userId, name: r.displayName || "Learner", reasons });
  }
  return out.sort((a, b) => b.reasons.length - a.reasons.length);
}

export interface FaceImpact {
  id: string;
  name: string;
  result: PairedResult | null;
}

export function faceImpact(rows: CohortLearner[], faces: { id: string; name: string }[]): FaceImpact[] {
  const learners = rows.filter(isLearner);
  return faces.map((f) => ({
    id: f.id,
    name: f.name,
    result: pairedSummary(
      learners
        .map((r) => r.progress?.face_scores?.[f.id])
        .filter((s): s is { pre: number; post: number } => typeof s?.pre === "number" && typeof s?.post === "number")
        .map((s) => ({ pre: s.pre, post: s.post })),
    ),
  }));
}

export function overallImpact(rows: CohortLearner[]): PairedResult | null {
  return pairedSummary(
    rows
      .filter(isLearner)
      .filter((r) => r.progress?.pre_overall != null && r.progress?.post_overall != null)
      .map((r) => ({ pre: Number(r.progress!.pre_overall), post: Number(r.progress!.post_overall) })),
  );
}

const r1 = (v: number) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : "");
const r2 = (v: number | null) => (v != null && Number.isFinite(v) ? (Math.round(v * 100) / 100).toFixed(2) : "");

function csvCell(v: string | number): string {
  const s = String(v);
  // Neutralise spreadsheet formulas and quote when needed
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Aggregate-only ROI CSV (no names): per-face impact, overall, then the funnel. */
export function roiCsv(input: {
  cohortName: string;
  generatedAt: string;
  faces: FaceImpact[];
  overall: PairedResult | null;
  funnel: ReturnType<typeof funnel>;
}): string {
  const rows: (string | number)[][] = [
    ["Super-Cube® cohort impact", input.cohortName],
    ["Generated", input.generatedAt],
    [],
    ["Face", "n (paired)", "Before mean", "Before 95% CI low", "Before 95% CI high", "After mean", "After 95% CI low", "After 95% CI high", "Change", "Change 95% CI low", "Change 95% CI high", "Cohen's d (d_av)", "Effect"],
  ];
  const line = (name: string, r: PairedResult | null) =>
    r
      ? [name, r.n, r1(r.before.mean), r1(r.before.low), r1(r.before.high), r1(r.after.mean), r1(r.after.low), r1(r.after.high), r1(r.change.mean), r1(r.change.low), r1(r.change.high), r2(r.d), r.label ?? ""]
      : [name, `fewer than ${MIN_GROUP}`, "", "", "", "", "", "", "", "", "", "", "suppressed"];
  for (const f of input.faces) rows.push(line(f.name, f.result));
  rows.push(line("Overall", input.overall));
  rows.push([]);
  rows.push(["Funnel step", "Learners", "% of joined"]);
  for (const s of input.funnel) rows.push([s.label, s.count, s.pct]);
  rows.push([]);
  rows.push(["Scores are 0–100 self-report. Paired learners only; 95% CIs use Student's t; groups under 3 suppressed."]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
