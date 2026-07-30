import { constructs, type ConstructId } from "@/lib/content";
import {
  assessmentPrompt,
  courseId,
  programmes,
  skillsForProgramme,
  type ProgrammeId,
} from "@/lib/programmes";

export type LessonType = "content" | "practice" | "quiz";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  bodyMd: string;
  lessonType: LessonType;
  sortOrder: number;
  durationMinutes: number;
}

export interface Course {
  id: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
  title: string;
  summary: string;
  coverPath: string;
  sortOrder: number;
  lessons: Lesson[];
}

export interface AssessmentItem {
  id: string;
  instrumentId: string;
  constructId: ConstructId;
  prompt: string;
  itemType: "likert_5";
  sortOrder: number;
}

function lessonBody(
  programmeId: ProgrammeId,
  constructName: string,
  skill: string,
  kind: "overview" | "skill" | "practice" | "quiz"
): string {
  const tone =
    programmeId === "kids"
      ? "Keep language simple. Use a short story and one fun practice."
      : programmeId === "adolescents"
        ? "Use a realistic peer or school scenario."
        : "Connect to workplace leadership practice.";

  if (kind === "overview") {
    return `## Why ${constructName} matters\n\n${tone}\n\nThis module develops the **${constructName}** face of the Super-Cube®. You will learn the core skills, practise them, and check your understanding.\n\n### Learning outcomes\n- Understand what ${constructName.toLowerCase()} leadership looks like in daily life\n- Practise one skill this week\n- Reflect on growth`;
  }
  if (kind === "skill") {
    return `## Skill: ${skill}\n\n${tone}\n\n### What it is\n**${skill}** is a developable capability on the ${constructName} face of Super-Cube®.\n\n### Why it matters\nStrong leaders grow this skill deliberately—not by chance.\n\n### Try this\n1. Notice one moment today where ${skill.toLowerCase()} shows up.\n2. Write one sentence about what you did well.\n3. Write one sentence about what you will try next time.`;
  }
  if (kind === "practice") {
    return `## Practice lab\n\n${tone}\n\n### Micro-action (this week)\nPick **one** situation and deliberately practise a ${constructName.toLowerCase()} skill.\n\n### Reflection prompts\n1. What did I try?\n2. What happened?\n3. What will I repeat or change?\n\nMark this lesson complete when you have written your reflection.`;
  }
  return `## Quick check\n\nAnswer these for yourself (1 = not yet, 5 = consistently):\n\n1. I understand the ${constructName} skills in this module.\n2. I can give an example from my life or work.\n3. I have a next practice action.\n\nWhen ready, mark complete and continue.`;
}

/** Full in-app curriculum (works without Supabase; mirrors seed) */
export function buildCurriculum(): Course[] {
  const courses: Course[] = [];
  let courseSort = 0;

  for (const programme of programmes) {
    constructs.forEach((construct, cIndex) => {
      const id = courseId(programme.id, construct.id);
      const skills = skillsForProgramme(programme.id, construct.id);
      const lessons: Lesson[] = [];
      let order = 0;

      lessons.push({
        id: `${id}-overview`,
        courseId: id,
        title: `Overview: ${construct.name}`,
        bodyMd: lessonBody(programme.id, construct.name, "", "overview"),
        lessonType: "content",
        sortOrder: order++,
        durationMinutes: programme.id === "kids" ? 8 : 12,
      });

      skills.forEach((skill, i) => {
        lessons.push({
          id: `${id}-skill-${i + 1}`,
          courseId: id,
          title: skill,
          bodyMd: lessonBody(programme.id, construct.name, skill, "skill"),
          lessonType: "content",
          sortOrder: order++,
          durationMinutes: programme.id === "kids" ? 6 : 10,
        });
      });

      lessons.push({
        id: `${id}-practice`,
        courseId: id,
        title: "Practice lab",
        bodyMd: lessonBody(programme.id, construct.name, "", "practice"),
        lessonType: "practice",
        sortOrder: order++,
        durationMinutes: 15,
      });

      lessons.push({
        id: `${id}-quiz`,
        courseId: id,
        title: "Quick check",
        bodyMd: lessonBody(programme.id, construct.name, "", "quiz"),
        lessonType: "quiz",
        sortOrder: order++,
        durationMinutes: 5,
      });

      courses.push({
        id,
        programmeId: programme.id,
        constructId: construct.id,
        title: `${construct.name} · ${programme.name}`,
        summary: construct.summary,
        coverPath: `/images/programs/${construct.id}-cover.jpg`,
        sortOrder: courseSort++,
        lessons,
      });
    });
  }

  return courses;
}

export const curriculum = buildCurriculum();

export function getCoursesForProgramme(programmeId: ProgrammeId): Course[] {
  return curriculum.filter((c) => c.programmeId === programmeId);
}

export function getCourse(id: string): Course | undefined {
  return curriculum.find((c) => c.id === id);
}

export function getLesson(
  courseIdStr: string,
  lessonId: string
): { course: Course; lesson: Lesson } | undefined {
  const course = getCourse(courseIdStr);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { course, lesson };
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
