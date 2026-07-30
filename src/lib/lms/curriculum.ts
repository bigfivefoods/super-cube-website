import { constructs, type ConstructId } from "@/lib/content";
import {
  assessmentPrompt,
  courseId,
  programmes,
  skillsForProgramme,
  type ProgrammeId,
} from "@/lib/programmes";
import {
  COURSE_COPY,
  skillCopyFor,
  type SessionSection,
} from "@/lib/lms/course-content";

export type { SessionSection } from "@/lib/lms/course-content";

export type LessonType = "content" | "practice" | "quiz";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  /** Flat markdown for simple rendering / export */
  bodyMd: string;
  /** Structured Read · Engage · Apply blocks */
  sections: SessionSection[];
  lessonType: LessonType;
  sortOrder: number;
  durationMinutes: number;
  /** One-line session outcome */
  outcome: string;
}

export interface Course {
  id: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
  title: string;
  summary: string;
  /** Module promise from rich content */
  promise: string;
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

function sectionsToMd(sections: SessionSection[]): string {
  return sections
    .map((s) => `## ${s.title}\n\n${s.body}`)
    .join("\n\n");
}

function programmeCue(programmeId: ProgrammeId): string {
  if (programmeId === "kids") {
    return "Keep it simple, kind, and playful. Use short stories and one clear try.";
  }
  if (programmeId === "adolescents") {
    return "Use real school, sport, digital, and peer situations. Keep it honest and practical.";
  }
  return "Connect every idea to workplace leadership: meetings, teams, stakeholders, and delivery.";
}

function overviewSections(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string,
  skills: string[]
): { sections: SessionSection[]; outcome: string } {
  const copy = COURSE_COPY[constructId];
  const sections: SessionSection[] = [
    {
      block: "read",
      title: "Read · why this face matters",
      body: `${copy.overviewRead}\n\n### Skills in this module\n${skills.map((s) => `- **${s}**`).join("\n")}\n\n### Programme note\n${programmeCue(programmeId)}`,
    },
    {
      block: "engage",
      title: "Engage · make it personal",
      body: copy.overviewEngage,
    },
    {
      block: "apply",
      title: "Apply · this week",
      body: copy.overviewApply,
    },
  ];
  return {
    sections,
    outcome: `Understand the ${constructName} face and start one deliberate practice.`,
  };
}

function skillSections(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string,
  skill: string,
  skillIndex: number
): { sections: SessionSection[]; outcome: string } {
  const sc = skillCopyFor(constructId, skillIndex);
  const sections: SessionSection[] = [
    {
      block: "read",
      title: `Read · ${skill}`,
      body: `### What it is\n**${skill}** is a developable Super-Cube® skill on the **${constructName}** face.\n\n${sc.insight}\n\n### Practical tip\n${sc.practiceTip}\n\n### Common trap\n${sc.commonTrap}\n\n### Programme note\n${programmeCue(programmeId)}`,
    },
    {
      block: "engage",
      title: "Engage · scenario",
      body: `### Real situation\n${sc.scenario[programmeId]}\n\n### Your response\n1. What would a weak response look like?\n2. What would a Super-Cube® response look like?\n3. Which value or skill is most at stake?\n\nWrite 4–8 lines (or talk it through with a parent, mentor, or peer).`,
    },
    {
      block: "apply",
      title: "Apply · micro-action",
      body: `### Do this\n${sc.apply[programmeId]}\n\n### Close the loop\nAfter you try it, note:\n- What I did\n- What happened\n- What I will repeat next time\n\nMark the session complete when you have taken the action (or scheduled it with a real date).`,
    },
  ];
  return {
    sections,
    outcome: `Practise ${skill} with a real scenario and a micro-action.`,
  };
}

function practiceSections(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string
): { sections: SessionSection[]; outcome: string } {
  const copy = COURSE_COPY[constructId];
  const sections: SessionSection[] = [
    {
      block: "read",
      title: "Read · deliberate practice",
      body: `## Practice lab · ${constructName}\n\nDeliberate practice is how Super-Cube® becomes real. This session is not more theory—it is a **field lab**.\n\n### Challenge\n${copy.practiceLab.challenge[programmeId]}\n\n### Success checklist\n${copy.practiceLab.checklist.map((c) => `- [ ] ${c}`).join("\n")}`,
    },
    {
      block: "engage",
      title: "Engage · design your week",
      body: `### Plan\n1. When will you practise (day + time)?\n2. Where (context)?\n3. Who will notice or support you?\n4. How will you know it worked?\n\nWrite a simple plan you can actually keep.`,
    },
    {
      block: "apply",
      title: "Apply · complete the lab",
      body: `### Execute and reflect\nComplete the challenge, then answer:\n1. What did I try?\n2. What happened for me and for others?\n3. What will I systematise (habit, checklist, calendar)?\n\nMark complete when the checklist is mostly true and your reflection is written.`,
    },
  ];
  return {
    sections,
    outcome: `Run a real-world ${constructName.toLowerCase()} practice lab and reflect.`,
  };
}

function quizSections(
  constructId: ConstructId,
  constructName: string
): { sections: SessionSection[]; outcome: string } {
  const copy = COURSE_COPY[constructId];
  const sections: SessionSection[] = [
    {
      block: "read",
      title: "Read · quick recap",
      body: `## Quick check · ${constructName}\n\n${copy.relevance}\n\n### Self-rate (1 = not yet · 5 = consistently)\n${copy.quizPrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
    },
    {
      block: "engage",
      title: "Engage · teach-back",
      body: `### Explain it simply\nIn 60 seconds (or 5 sentences), teach the ${constructName} face to someone else:\n- What it is\n- Why it matters\n- One practice they can try today\n\nIf you can teach it, you own it.`,
    },
    {
      block: "apply",
      title: "Apply · next module ready",
      body: `### Lock one habit\nChoose **one** micro-habit from this module to keep for the next 14 days.\n\nWrite it as: **When** [trigger], **I will** [action], **so that** [purpose].\n\nThen mark complete and move on—or retake a skill session if a score felt low.`,
    },
  ];
  return {
    sections,
    outcome: `Check understanding and lock one ${constructName.toLowerCase()} habit.`,
  };
}

/** Full in-app curriculum (works without Supabase; mirrors seed) */
export function buildCurriculum(): Course[] {
  const courses: Course[] = [];
  let courseSort = 0;

  for (const programme of programmes) {
    constructs.forEach((construct) => {
      const id = courseId(programme.id, construct.id);
      const skills = skillsForProgramme(programme.id, construct.id);
      const copy = COURSE_COPY[construct.id];
      const lessons: Lesson[] = [];
      let order = 0;

      const overview = overviewSections(
        programme.id,
        construct.id,
        construct.name,
        skills
      );
      lessons.push({
        id: `${id}-overview`,
        courseId: id,
        title: `Overview: ${construct.name}`,
        sections: overview.sections,
        bodyMd: sectionsToMd(overview.sections),
        lessonType: "content",
        sortOrder: order++,
        durationMinutes: programme.id === "kids" ? 10 : 15,
        outcome: overview.outcome,
      });

      skills.forEach((skill, i) => {
        const built = skillSections(
          programme.id,
          construct.id,
          construct.name,
          skill,
          i
        );
        lessons.push({
          id: `${id}-skill-${i + 1}`,
          courseId: id,
          title: skill,
          sections: built.sections,
          bodyMd: sectionsToMd(built.sections),
          lessonType: "content",
          sortOrder: order++,
          durationMinutes: programme.id === "kids" ? 8 : 12,
          outcome: built.outcome,
        });
      });

      const practice = practiceSections(
        programme.id,
        construct.id,
        construct.name
      );
      lessons.push({
        id: `${id}-practice`,
        courseId: id,
        title: "Practice lab",
        sections: practice.sections,
        bodyMd: sectionsToMd(practice.sections),
        lessonType: "practice",
        sortOrder: order++,
        durationMinutes: 20,
        outcome: practice.outcome,
      });

      const quiz = quizSections(construct.id, construct.name);
      lessons.push({
        id: `${id}-quiz`,
        courseId: id,
        title: "Quick check",
        sections: quiz.sections,
        bodyMd: sectionsToMd(quiz.sections),
        lessonType: "quiz",
        sortOrder: order++,
        durationMinutes: 8,
        outcome: quiz.outcome,
      });

      courses.push({
        id,
        programmeId: programme.id,
        constructId: construct.id,
        title: `${construct.name} · ${programme.name}`,
        summary: construct.summary,
        promise: copy.promise,
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

export const BLOCK_META: Record<
  SessionSection["block"],
  { label: string; hint: string }
> = {
  read: { label: "Read", hint: "Understand the idea" },
  engage: { label: "Engage", hint: "Think it through" },
  apply: { label: "Apply", hint: "Do something real" },
};
