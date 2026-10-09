/**
 * Honest session durations, computed from the content itself.
 * Reading time (words ÷ reading speed for the age group) plus a fixed,
 * modest allowance for each activity. Used by the curriculum, so every
 * place that shows a duration agrees.
 */
import type { ProgrammeId } from "@/lib/programmes";

/** Average silent-reading speed (words per minute) by programme. Kids read with an adult. */
export const READING_WPM: Record<ProgrammeId, number> = {
  adults: 200,
  adolescents: 180,
  kids: 90,
};

/** Activity allowances, in minutes. */
export const ACTIVITY_MINUTES = {
  reflect: 1,
  practice: 0.5,
  ifThen: 1,
  question: 0.5,
  questionKids: 0.75,
  journal: 2,
  woop: 6,
  labReflect: 2,
  teachBack: 1,
} as const;

export const MIN_SESSION_MINUTES = 3;

export function wordCount(text: string): number {
  const m = text.replace(/[#*_>`[\]()-]/g, " ").match(/[A-Za-zÀ-ÿ0-9’']+/g);
  return m ? m.length : 0;
}

export function readingMinutes(texts: string[], programmeId: ProgrammeId): number {
  const words = texts.reduce((n, t) => n + wordCount(t), 0);
  return words / READING_WPM[programmeId];
}

function round(min: number): number {
  return Math.max(MIN_SESSION_MINUTES, Math.round(min));
}

export interface ArcLike {
  hook: string;
  core: string;
  example: { title: string; body: string };
  reflect: string;
  practice: string;
  ifThen: string;
  check: { q: string; options: string[] }[];
  journal: string;
}

/** Eight-step session: read everything, then do each activity once. */
export function arcMinutes(arc: ArcLike, programmeId: ProgrammeId): number {
  const texts = [
    arc.hook,
    arc.core,
    arc.example.title,
    arc.example.body,
    arc.reflect,
    arc.practice,
    arc.ifThen,
    arc.journal,
    ...arc.check.flatMap((q) => [q.q, ...q.options]),
  ];
  const perQ = programmeId === "kids" ? ACTIVITY_MINUTES.questionKids : ACTIVITY_MINUTES.question;
  return round(
    readingMinutes(texts, programmeId) +
      ACTIVITY_MINUTES.reflect +
      ACTIVITY_MINUTES.practice +
      ACTIVITY_MINUTES.ifThen +
      perQ * arc.check.length +
      ACTIVITY_MINUTES.journal
  );
}

/** Practice lab: read the challenge and checklist, plan with WOOP, reflect. */
export function labMinutes(texts: string[], programmeId: ProgrammeId): number {
  return round(readingMinutes(texts, programmeId) + ACTIVITY_MINUTES.woop + ACTIVITY_MINUTES.labReflect);
}

/** Face check: answer the questions, teach back, write the habit. */
export function faceCheckMinutes(questions: { q: string; options: string[] }[], programmeId: ProgrammeId): number {
  const perQ = programmeId === "kids" ? ACTIVITY_MINUTES.questionKids : ACTIVITY_MINUTES.question;
  const texts = questions.flatMap((q) => [q.q, ...q.options]);
  return round(
    readingMinutes(texts, programmeId) + perQ * questions.length + ACTIVITY_MINUTES.teachBack + ACTIVITY_MINUTES.journal
  );
}

/** Rating-scale questionnaire: about 10 seconds a statement (kids, with an adult: 15). */
export function questionnaireMinutes(items: number, programmeId: ProgrammeId): number {
  const secs = programmeId === "kids" ? 15 : 10;
  return Math.max(1, Math.round((items * secs) / 60));
}
