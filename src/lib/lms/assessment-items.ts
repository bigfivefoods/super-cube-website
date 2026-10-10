/**
 * Assessment items (v1), Likert labels and block labels.
 * Kept apart from curriculum.ts so the assessment and dashboard pages
 * don't ship the full session text.
 */
import { constructs, type ConstructId } from "@/lib/content";
import type { SessionSection } from "@/lib/lms/course-content";
import { assessmentPrompt, skillsForProgramme, type ProgrammeId } from "@/lib/programmes";

export interface AssessmentOption {
  /** Stored response value (1-based option number) */
  value: number;
  text: string;
  /** Provisional expert effectiveness key, 1 (least) to 4 (most effective) */
  key: number;
  /** Key on the 0–100 scale used for face scores */
  score: number;
  /** Feedback shown after the attempt (never during it) */
  why?: string;
}

export interface AssessmentItem {
  id: string;
  instrumentId: string;
  constructId: ConstructId;
  /** Likert statement, or the SJT scenario */
  prompt: string;
  /** v1 items are all likert_5; v2 adds situational judgement items */
  itemType: "likert_5" | "sjt";
  sortOrder: number;
  /** Reverse-keyed Likert item: scored as 6 − answer */
  reverse?: boolean;
  /** Skill (element) the item samples */
  skill?: string;
  /** Likert labels 1..5 when they differ from the v1 agreement scale */
  scaleLabels?: readonly string[];
  /** SJT options */
  options?: AssessmentOption[];
  /** Third-person wording for the observer (360) form; {name} is replaced */
  observerPrompt?: string;
}

export function buildAssessmentItems(
  programmeId: ProgrammeId
): AssessmentItem[] {
  const instrumentId = `super_cube_${programmeId}_v1`;
  const items: AssessmentItem[] = [];
  let order = 0;

  for (const construct of constructs) {
    const skills = skillsForProgramme(programmeId, construct.id);
    skills.forEach((skill, i) => {
      items.push({
        id: `${instrumentId}-${construct.id}-${i + 1}`,
        instrumentId,
        constructId: construct.id,
        prompt: assessmentPrompt(programmeId, construct.id, skill, i),
        itemType: "likert_5",
        sortOrder: order++,
      });
    });
  }

  return items;
}

export const LIKERT_LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
] as const;

export const BLOCK_META: Record<
  SessionSection["block"],
  { label: string; hint: string }
> = {
  read: { label: "Read", hint: "Understand the idea" },
  engage: { label: "Engage", hint: "Think it through" },
  apply: { label: "Apply", hint: "Do something real" },
};
