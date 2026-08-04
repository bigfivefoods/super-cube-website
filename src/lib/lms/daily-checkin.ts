/**
 * Daily check-in instrument: 3 quick slider questions per Super-Cube® face.
 * Face score = mean of the three 1–5 answers (stored on FacePulse.scores).
 */

import { constructs, type ConstructId } from "@/lib/content";

export type CheckInQuestion = {
  id: string;
  prompt: string;
};

/** Three key questions per construct for rapid journal capture */
export const CHECKIN_QUESTIONS: Record<ConstructId, CheckInQuestion[]> = {
  choices: [
    {
      id: "c1",
      prompt: "I made clear decisions under pressure today.",
    },
    {
      id: "c2",
      prompt: "My choices aligned with my values, not only convenience.",
    },
    {
      id: "c3",
      prompt: "I took calculated risks rather than freezing or over-controlling.",
    },
  ],
  principles: [
    {
      id: "p1",
      prompt: "I acted with integrity others could see.",
    },
    {
      id: "p2",
      prompt: "I treated people fairly, even when it cost me something.",
    },
    {
      id: "p3",
      prompt: "I held myself accountable without shifting blame.",
    },
  ],
  mental: [
    {
      id: "m1",
      prompt: "I stayed clear on priorities and the bigger picture.",
    },
    {
      id: "m2",
      prompt: "I solved problems thoughtfully instead of reacting.",
    },
    {
      id: "m3",
      prompt: "I learned something useful and applied it.",
    },
  ],
  emotional: [
    {
      id: "e1",
      prompt: "I noticed and regulated my own emotions well.",
    },
    {
      id: "e2",
      prompt: "I read the room and responded with empathy.",
    },
    {
      id: "e3",
      prompt: "I built safety and connection with others.",
    },
  ],
  physical: [
    {
      id: "ph1",
      prompt: "I had enough energy and presence to lead well.",
    },
    {
      id: "ph2",
      prompt: "I protected rest, movement, or recovery when needed.",
    },
    {
      id: "ph3",
      prompt: "My body language projected steadiness, not depletion.",
    },
  ],
  spiritual: [
    {
      id: "s1",
      prompt: "I stayed connected to purpose beyond tasks.",
    },
    {
      id: "s2",
      prompt: "My work today felt meaningful, not empty busyness.",
    },
    {
      id: "s3",
      prompt: "I led by example in a way I am proud of.",
    },
  ],
};

export const SCALE_LABELS = [
  "Not today",
  "Slightly",
  "Somewhat",
  "Mostly",
  "Fully",
] as const;

export function meanFaceScore(answers: (number | undefined)[]): number | null {
  const vals = answers.filter(
    (v): v is number => typeof v === "number" && v >= 1 && v <= 5
  );
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/** Build construct scores map from 3-question answers */
export function scoresFromAnswers(
  answers: Partial<Record<ConstructId, (number | undefined)[]>>
): Partial<Record<ConstructId, number>> {
  const scores: Partial<Record<ConstructId, number>> = {};
  for (const c of constructs) {
    const m = meanFaceScore(answers[c.id] ?? []);
    if (m != null) scores[c.id] = m;
  }
  return scores;
}

export function countAnsweredFaces(
  answers: Partial<Record<ConstructId, (number | undefined)[]>>
): number {
  return constructs.filter((c) => {
    const a = answers[c.id] ?? [];
    return a.filter((v) => typeof v === "number" && v >= 1 && v <= 5).length >= 2;
  }).length;
}

/** Week strip: last 6 days + today (or centered on selected) */
export function weekDaysAround(center = new Date(), past = 6, future = 0): Date[] {
  const days: Date[] = [];
  for (let i = past; i >= -future; i--) {
    const d = new Date(center);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function monthGrid(year: number, month: number): (Date | null)[] {
  // month 0-indexed
  const first = new Date(year, month, 1);
  const startPad = first.getDay(); // 0 Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d, 12, 0, 0, 0));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"] as const;
