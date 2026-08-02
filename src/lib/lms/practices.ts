/**
 * I–Thou practice library — relational leadership exercises
 * grounded in Buber and Super-Cube® whole-person development.
 */

import type { ConstructId } from "@/lib/content";

export interface PracticeExercise {
  id: string;
  title: string;
  constructId: ConstructId | "relational";
  minutes: number;
  audience: "all" | "kids" | "adolescents" | "adults";
  summary: string;
  steps: string[];
  debrief: string;
}

export const practiceLibrary: PracticeExercise[] = [
  {
    id: "ithou-presence",
    title: "I–Thou presence (3 minutes)",
    constructId: "relational",
    minutes: 3,
    audience: "all",
    summary:
      "Treat the next person you meet as a full subject—not a role, task, or obstacle.",
    steps: [
      "Before speaking, silently acknowledge: this person has an inner world as real as mine.",
      "Offer full attention for three minutes—no phone, no multitasking.",
      "Reflect one thing you heard in their words (not your advice).",
    ],
    debrief: "When did you slip into I–It (using them as a means)?",
  },
  {
    id: "choice-council",
    title: "Decision council of three",
    constructId: "choices",
    minutes: 12,
    audience: "adults",
    summary: "Pressure-test a decision with moral, strategic, and human lenses.",
    steps: [
      "State the decision in one sentence.",
      "Write: moral risk · strategic upside · human impact.",
      "Choose, then write the first 48-hour action.",
    ],
    debrief: "Which lens almost got skipped?",
  },
  {
    id: "principle-card",
    title: "Principle card",
    constructId: "principles",
    minutes: 8,
    audience: "all",
    summary: "Make one principle portable and public.",
    steps: [
      "Write one principle on a card or phone note.",
      "Share it with one peer or family member.",
      "Act on it once within 24 hours.",
    ],
    debrief: "What pressure tested the principle?",
  },
  {
    id: "perspective-walk",
    title: "Perspective walk",
    constructId: "mental",
    minutes: 10,
    audience: "adolescents",
    summary: "Walk while arguing the opposite view fairly.",
    steps: [
      "State your view.",
      "Walk 5 minutes arguing the opposite as if you believed it.",
      "Return and note one valid point you had ignored.",
    ],
    debrief: "What did steel-manning change?",
  },
  {
    id: "feel-then-fix",
    title: "Feel, then fix",
    constructId: "emotional",
    minutes: 6,
    audience: "all",
    summary: "Name emotion before problem-solving.",
    steps: [
      "In a hard chat, pause once.",
      "Name one feeling in the room.",
      "Only then propose a next step.",
    ],
    debrief: "Did the other person open up or shut down?",
  },
  {
    id: "body-as-signal",
    title: "Body as leadership signal",
    constructId: "physical",
    minutes: 5,
    audience: "all",
    summary: "Align posture and breath with the message you want to send.",
    steps: [
      "Before a key interaction: feet planted, shoulders open, jaw soft.",
      "Three slow breaths.",
      "Enter with one clear intention sentence.",
    ],
    debrief: "How did others respond to your presence?",
  },
  {
    id: "purpose-circle",
    title: "Purpose circle",
    constructId: "spiritual",
    minutes: 15,
    audience: "adults",
    summary: "Connect daily work to contribution beyond self.",
    steps: [
      "Who is better off if our team succeeds?",
      "What would those people need from us this month?",
      "Pick one behaviour that serves that answer.",
    ],
    debrief: "Does the calendar match the purpose?",
  },
  {
    id: "kids-kind-leader",
    title: "Kind leader of the day",
    constructId: "emotional",
    minutes: 5,
    audience: "kids",
    summary: "Practice noticing and naming kindness as leadership.",
    steps: [
      "Notice one person who helped someone else.",
      "Tell them what you saw.",
      "Do one kind act yourself before day’s end.",
    ],
    debrief: "How did kindness change the group?",
  },
];

export function practicesForAudience(
  audience: PracticeExercise["audience"] | "all"
) {
  if (audience === "all") return practiceLibrary;
  return practiceLibrary.filter(
    (p) => p.audience === "all" || p.audience === audience
  );
}
