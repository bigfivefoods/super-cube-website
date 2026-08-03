/**
 * Continuous Super-Cube® face tracking
 * Daily/weekly pulses → patterns → adaptive practice recommendations
 */

import { constructs, type ConstructId } from "@/lib/content";
import {
  getMicroPracticesFor,
  pickDailyMicroPractice,
  type MicroPractice,
} from "@/lib/lms/micro-practices";
import {
  loadLmsState,
  localDayKey,
  saveLmsState,
  touchActivity,
  type LocalLmsState,
} from "@/lib/lms/store";

export type PulseSource = "daily" | "weekly" | "quick";

export interface FacePulse {
  date: string; // YYYY-MM-DD
  scores: Partial<Record<ConstructId, number>>; // 1–5 scale
  focusFace?: ConstructId;
  note?: string;
  source: PulseSource;
  at: string; // ISO
}

export type FaceTrend = "up" | "flat" | "down" | "unknown";

export interface FacePattern {
  weakest: ConstructId[];
  strongest: ConstructId[];
  trend: Partial<Record<ConstructId, FaceTrend>>;
  averages: Partial<Record<ConstructId, number>>; // 0–100
  consistency: number; // 0–100 (how regularly the user pulses)
  pulseCount: number;
  daysCovered: number;
  insight: string;
}

const CONSTRUCT_IDS = constructs.map((c) => c.id);

/** Convert 1–5 slider to 0–100 for charts / comparison with assessments */
export function pulseToHundred(v: number): number {
  const clamped = Math.min(5, Math.max(1, v));
  return Math.round(((clamped - 1) / 4) * 100);
}

export function hundredToPulse(v: number): number {
  return Math.round((Math.min(100, Math.max(0, v)) / 100) * 4 + 1);
}

export function getFacePulses(state?: LocalLmsState): FacePulse[] {
  const s = state ?? loadLmsState();
  return [...(s.facePulses ?? [])].sort((a, b) => b.date.localeCompare(a.date));
}

export function getTodayPulse(state?: LocalLmsState): FacePulse | undefined {
  const day = localDayKey();
  return getFacePulses(state).find((p) => p.date === day);
}

/** Save or replace today's pulse (one primary pulse per day) */
export function saveFacePulse(
  input: Omit<FacePulse, "date" | "at"> & { date?: string }
): LocalLmsState {
  let state = loadLmsState();
  const date = input.date ?? localDayKey();
  const pulse: FacePulse = {
    date,
    scores: input.scores,
    focusFace: input.focusFace,
    note: input.note?.trim() || undefined,
    source: input.source,
    at: new Date().toISOString(),
  };

  const existing = [...(state.facePulses ?? [])].filter((p) => p.date !== date);
  existing.unshift(pulse);
  // Keep ~6 months
  state.facePulses = existing.slice(0, 180);
  state = touchActivity(state);
  saveLmsState(state);
  return state;
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Derive patterns from recent pulses (and fall back to pre assessment) */
export function deriveFacePattern(
  state?: LocalLmsState,
  windowDays = 28
): FacePattern {
  const s = state ?? loadLmsState();
  const pulses = getFacePulses(s);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffKey = localDayKey(cutoff);

  const recent = pulses.filter((p) => p.date >= cutoffKey);
  const averages: Partial<Record<ConstructId, number>> = {};
  const trend: Partial<Record<ConstructId, FaceTrend>> = {};

  for (const id of CONSTRUCT_IDS) {
    const vals = recent
      .map((p) => p.scores[id])
      .filter((v): v is number => typeof v === "number");
    const avg5 = mean(vals);
    if (avg5 != null) averages[id] = pulseToHundred(avg5);

    if (vals.length >= 4) {
      const mid = Math.floor(vals.length / 2);
      const newer = mean(vals.slice(0, mid)) ?? 0;
      const older = mean(vals.slice(mid)) ?? 0;
      const delta = newer - older;
      trend[id] = delta > 0.25 ? "up" : delta < -0.25 ? "down" : "flat";
    } else {
      trend[id] = "unknown";
    }
  }

  // Fallback to pre-assessment if no pulse averages yet
  if (Object.keys(averages).length === 0) {
    const pre = s.attempts.find((a) => a.phase === "pre");
    if (pre?.result.constructScores) {
      for (const cs of pre.result.constructScores) {
        averages[cs.constructId] = cs.score;
        trend[cs.constructId] = "unknown";
      }
    }
  }

  const ranked = CONSTRUCT_IDS.filter((id) => averages[id] != null).sort(
    (a, b) => (averages[a] ?? 999) - (averages[b] ?? 999)
  );

  const weakest = ranked.slice(0, 2);
  const strongest = [...ranked].reverse().slice(0, 2);

  const uniqueDays = new Set(recent.map((p) => p.date)).size;
  const consistency = Math.min(
    100,
    Math.round((uniqueDays / Math.max(1, Math.min(windowDays, 14))) * 100)
  );

  let insight = "Log a few daily pulses so patterns can emerge.";
  if (recent.length >= 3 && weakest[0]) {
    const name = constructs.find((c) => c.id === weakest[0])?.name ?? weakest[0];
    const t = trend[weakest[0]];
    if (t === "down") {
      insight = `${name} has been trending lower — prioritise short practices on this face.`;
    } else if (t === "up") {
      insight = `${name} is still a stretch face but improving. Keep the deliberate practice going.`;
    } else {
      insight = `${name} is your current growth priority based on recent pulses.`;
    }
  } else if (weakest[0] && recent.length === 0) {
    const name = constructs.find((c) => c.id === weakest[0])?.name ?? weakest[0];
    insight = `From your baseline, ${name} is the highest-leverage face to practise.`;
  }

  return {
    weakest,
    strongest,
    trend,
    averages,
    consistency,
    pulseCount: recent.length,
    daysCovered: uniqueDays,
    insight,
  };
}

/** Adaptive micro-practice using longitudinal weakest faces */
export function recommendPractice(state?: LocalLmsState): MicroPractice {
  const pattern = deriveFacePattern(state);
  return pickDailyMicroPractice(pattern.weakest);
}

export function recommendPracticesForFocus(
  focus: ConstructId[],
  limit = 4
): MicroPractice[] {
  const pool =
    focus.length > 0
      ? focus.flatMap((id) => getMicroPracticesFor(id))
      : constructs.flatMap((c) => getMicroPracticesFor(c.id));
  return pool.slice(0, limit);
}

/** Simple series for charts: last N days average overall + per face */
export function pulseSeries(
  state?: LocalLmsState,
  days = 14
): { date: string; overall: number | null; faces: Partial<Record<ConstructId, number>> }[] {
  const pulses = getFacePulses(state);
  const out: {
    date: string;
    overall: number | null;
    faces: Partial<Record<ConstructId, number>>;
  }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDayKey(d);
    const p = pulses.find((x) => x.date === key);
    if (!p) {
      out.push({ date: key, overall: null, faces: {} });
      continue;
    }
    const faces: Partial<Record<ConstructId, number>> = {};
    const vals: number[] = [];
    for (const id of CONSTRUCT_IDS) {
      const v = p.scores[id];
      if (typeof v === "number") {
        const h = pulseToHundred(v);
        faces[id] = h;
        vals.push(h);
      }
    }
    out.push({
      date: key,
      overall: vals.length ? Math.round(mean(vals)!) : null,
      faces,
    });
  }
  return out;
}
