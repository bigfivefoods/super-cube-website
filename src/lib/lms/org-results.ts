/**
 * Organisation results dashboard (org admins). Turns the aggregate-only
 * org_results() RPC payload into display rows: per-face before/after with 95% CIs
 * and Cohen's d_av, the completion funnel, engagement, and an aggregate CSV.
 * Nothing here ever sees a name or a single learner's score.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { csvCell, effectLabel, MIN_GROUP, tCritical95, type EffectLabel } from "@/lib/lms/cohort-stats";

export type RawStats = {
  n: number;
  suppressed?: boolean;
  pre_mean?: number;
  pre_sd?: number | null;
  post_mean?: number;
  post_sd?: number | null;
  diff_mean?: number;
  diff_sd?: number | null;
};

export type OrgResultsRaw = {
  org: { id: string; name: string; code: string; kind: string } | null;
  min_group: number;
  generated_at: string;
  members: { learners: number; staff: number };
  funnel: {
    joined: number;
    consented: number;
    baseline: number;
    started: number;
    halfway: number;
    completed: number;
    remeasured: number;
    certified: number;
  };
  engagement: {
    active_7d: number;
    active_30d: number;
    sessions_completed: number;
    avg_session_share: number | null;
    median_streak: number | null;
    minutes_30d: number;
    weekly_active: { week: string; active: number }[];
  };
  overall: RawStats;
  faces: (RawStats & { face: string })[];
};

export type Ci = { mean: number; low: number; high: number };
export type FaceRow = {
  id: string;
  name: string;
  color: string;
  n: number;
  suppressed: boolean;
  before?: Ci;
  after?: Ci;
  change?: Ci;
  d?: number | null;
  label?: EffectLabel | null;
};

const num = (v: unknown): number => (v == null ? Number.NaN : Number(v));

function ci(mean: number, sdv: number | null | undefined, n: number): Ci {
  const s = num(sdv);
  const half = n > 1 && Number.isFinite(s) ? (tCritical95(n - 1) * s) / Math.sqrt(n) : Number.NaN;
  return { mean, low: mean - half, high: mean + half };
}

export function statsRow(raw: RawStats | undefined, base: { id: string; name: string; color: string }, k = MIN_GROUP): FaceRow {
  const n = Number(raw?.n ?? 0);
  if (!raw || raw.suppressed || n < k || raw.pre_mean == null || raw.post_mean == null || raw.diff_mean == null) {
    return { ...base, n, suppressed: true };
  }
  const preM = num(raw.pre_mean);
  const postM = num(raw.post_mean);
  const diffM = num(raw.diff_mean);
  const sAv = (num(raw.pre_sd) + num(raw.post_sd)) / 2;
  const d = Number.isFinite(sAv) && sAv > 0 ? diffM / sAv : null;
  return {
    ...base,
    n,
    suppressed: false,
    before: ci(preM, raw.pre_sd, n),
    after: ci(postM, raw.post_sd, n),
    change: ci(diffM, raw.diff_sd, n),
    d,
    label: d == null ? null : effectLabel(d),
  };
}

/** All six faces in model order (a face nobody has re-measured yet shows as n = 0). */
export function faceRows(raw: OrgResultsRaw): FaceRow[] {
  const k = raw.min_group || MIN_GROUP;
  return constructs.map((c) =>
    statsRow(
      raw.faces.find((f) => f.face === (c.id as ConstructId)),
      { id: c.id, name: c.name, color: c.color },
      k,
    ),
  );
}

export function overallRow(raw: OrgResultsRaw): FaceRow {
  return statsRow(raw.overall, { id: "overall", name: "Overall", color: "#0a0a0a" }, raw.min_group || MIN_GROUP);
}

export const FUNNEL: { key: keyof OrgResultsRaw["funnel"]; label: string }[] = [
  { key: "joined", label: "Joined the cohort" },
  { key: "consented", label: "Sharing progress" },
  { key: "baseline", label: "Took the 28-question baseline" },
  { key: "started", label: "Started sessions" },
  { key: "halfway", label: "Halfway through sessions" },
  { key: "completed", label: "Completed all sessions" },
  { key: "remeasured", label: "Took the after-test" },
  { key: "certified", label: "Certified" },
];

export function funnelRows(raw: OrgResultsRaw): { key: string; label: string; count: number; pct: number }[] {
  const base = Math.max(1, raw.funnel.joined);
  return FUNNEL.map((s) => {
    const count = Number(raw.funnel[s.key] ?? 0);
    return { key: s.key, label: s.label, count, pct: Math.round((count / base) * 100) };
  });
}

/** Completion rate: learners who took the after-test, of those who took the baseline. */
export function completionRate(raw: OrgResultsRaw): number | null {
  return raw.funnel.baseline > 0 ? Math.round((raw.funnel.remeasured / raw.funnel.baseline) * 100) : null;
}

const r1 = (v: number | undefined) => (v != null && Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : "");
const r2 = (v: number | null | undefined) => (v != null && Number.isFinite(v) ? (Math.round(v * 100) / 100).toFixed(2) : "");

/** Aggregate-only CSV (no names, no individual scores). */
export function orgResultsCsv(raw: OrgResultsRaw): string {
  const k = raw.min_group || MIN_GROUP;
  const rows: (string | number)[][] = [
    ["Super-Cube® organisation results", raw.org?.name ?? ""],
    ["Generated", raw.generated_at],
    ["Learners joined", raw.funnel.joined],
    ["Learners sharing progress", raw.funnel.consented],
    [],
    ["Face", "n (paired)", "Before mean", "Before 95% CI low", "Before 95% CI high", "After mean", "After 95% CI low", "After 95% CI high", "Change", "Change 95% CI low", "Change 95% CI high", "Cohen's d (d_av)", "Effect"],
  ];
  for (const f of [...faceRows(raw), overallRow(raw)]) {
    rows.push(
      f.suppressed
        ? [f.name, f.n < k ? `fewer than ${k}` : f.n, "", "", "", "", "", "", "", "", "", "", "suppressed"]
        : [f.name, f.n, r1(f.before?.mean), r1(f.before?.low), r1(f.before?.high), r1(f.after?.mean), r1(f.after?.low), r1(f.after?.high), r1(f.change?.mean), r1(f.change?.low), r1(f.change?.high), r2(f.d), f.label ?? ""],
    );
  }
  rows.push([], ["Funnel step", "Learners", "% of joined"]);
  for (const s of funnelRows(raw)) rows.push([s.label, s.count, s.pct]);
  const e = raw.engagement;
  rows.push(
    [],
    ["Engagement", "Value"],
    ["Active in the last 7 days", e.active_7d],
    ["Active in the last 30 days", e.active_30d],
    ["Sessions completed (total)", e.sessions_completed],
    ["Average share of sessions completed (%)", e.avg_session_share == null ? "" : Math.round(Number(e.avg_session_share) * 100)],
    ["Median practice streak (days)", e.median_streak == null ? "" : Number(e.median_streak)],
    ["Practice minutes in the last 30 days", Math.round(Number(e.minutes_30d))],
    [],
    ["Week starting", "Active learners"],
    ...e.weekly_active.map((w) => [w.week, w.active]),
    [],
    [`Scores are 0–100 from the server-scored 28-question baseline and after-test. Paired learners who share progress only; 95% CIs use Student's t; groups under ${k} suppressed. Self-report, no control group.`],
  );
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
