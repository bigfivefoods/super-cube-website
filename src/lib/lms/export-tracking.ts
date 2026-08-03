/**
 * Export helpers for face pulses, longitudinal series, and research-friendly aggregates.
 */

import { constructs, type ConstructId } from "@/lib/content";
import {
  deriveFacePattern,
  getFacePulses,
  pulseSeries,
  pulseToHundred,
} from "@/lib/lms/face-tracking";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Full pulse history CSV (device-local; notes included — private). */
export function exportFacePulsesCsv(state?: LocalLmsState): string {
  const s = state ?? loadLmsState();
  const pulses = getFacePulses(s);
  const header = [
    "date",
    "source",
    "focus_face",
    "note",
    "at",
    ...constructs.map((c) => c.id),
    ...constructs.map((c) => `${c.id}_0_100`),
  ].join(",");

  const rows = pulses.map((p) => {
    const cells: (string | number)[] = [
      p.date,
      p.source,
      p.focusFace ?? "",
      p.note ?? "",
      p.at,
    ];
    for (const c of constructs) {
      cells.push(p.scores[c.id] ?? "");
    }
    for (const c of constructs) {
      const v = p.scores[c.id];
      cells.push(typeof v === "number" ? pulseToHundred(v) : "");
    }
    return cells.map(csvEscape).join(",");
  });

  return [header, ...rows].join("\n");
}

/** 14/28-day overall series CSV for longitudinal charts / research. */
export function exportPulseSeriesCsv(
  state?: LocalLmsState,
  days = 28
): string {
  const series = pulseSeries(state, days);
  const header = ["date", "overall", ...constructs.map((c) => c.id)].join(",");
  const rows = series.map((d) => {
    const cells: (string | number)[] = [d.date, d.overall ?? ""];
    for (const c of constructs) {
      cells.push(d.faces[c.id] ?? "");
    }
    return cells.map(csvEscape).join(",");
  });
  return [header, ...rows].join("\n");
}

/**
 * Anonymised research export — no notes, no emails, pattern summary only.
 * Suitable for consented aggregate studies.
 */
export function exportResearchSummaryJson(state?: LocalLmsState): string {
  const s = state ?? loadLmsState();
  const pattern = deriveFacePattern(s);
  const pre = s.attempts.find((a) => a.phase === "pre");
  const post = s.attempts.find((a) => a.phase === "post");
  const mid = s.attempts.find((a) => a.phase === "mid");

  const face = (phase: "pre" | "mid" | "post") => {
    const att =
      phase === "pre" ? pre : phase === "mid" ? mid : post;
    if (!att) return null;
    const out: Partial<Record<ConstructId, number>> = {};
    for (const cs of att.result.constructScores) {
      out[cs.constructId] = cs.score;
    }
    return { overall: att.result.overall, faces: out };
  };

  const payload = {
    schema: "super-cube-research-v1",
    exportedAt: new Date().toISOString(),
    anonymised: true,
    programmeId:
      s.subscription?.programmeId || s.user?.programmeId || null,
    assessments: {
      pre: face("pre"),
      mid: face("mid"),
      post: face("post"),
    },
    pulse: {
      count28d: pattern.pulseCount,
      consistency: pattern.consistency,
      daysCovered: pattern.daysCovered,
      averages: pattern.averages,
      trend: pattern.trend,
      weakest: pattern.weakest,
      strongest: pattern.strongest,
    },
    lessonsCompleted: Object.values(s.lessonProgress).filter(
      (x) => x === "completed"
    ).length,
    reflectionCount: Object.keys(s.reflections ?? {}).length,
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadTextFile(
  content: string,
  filename: string,
  mime = "text/csv;charset=utf-8"
) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
