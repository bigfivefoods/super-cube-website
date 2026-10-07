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
  type SessionSection,
} from "@/lib/lms/course-content";
import {
  arcToMarkdown,
  faceCheck,
  overviewArc,
  skillArc,
  type ResolvedArc,
  type RetrievalQ,
} from "@/lib/lms/sessions";

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
  /** Eight-step learning arc (overview and skill sessions) */
  arc?: ResolvedArc;
  /** Practice lab (WOOP) */
  lab?: PracticeLab;
  /** End-of-module retrieval check (one question per skill) */
  faceCheck?: RetrievalQ[];
}

export interface PracticeLab {
  challenge: string;
  checklist: string[];
  /** WOOP prompts: wish, outcome, obstacle, plan */
  woop: { id: "wish" | "outcome" | "obstacle" | "plan"; label: string; prompt: string }[];
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

function sectionsToMd(sections: SessionSection[]): string {
  return sections
    .map((s) => `## ${s.title}\n\n${s.body}`)
    .join("\n\n");
}

function arcSections(arc: ResolvedArc, extraRead = ""): SessionSection[] {
  const md = arcToMarkdown(arc);
  return [
    { block: "read", title: "Read · hook, idea and example", body: md.read + extraRead },
    { block: "engage", title: "Engage · reflect and check", body: md.engage },
    { block: "apply", title: "Apply · practise and plan", body: md.apply },
  ];
}

function overviewSessions(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string,
  skills: string[]
): { sections: SessionSection[]; outcome: string; arc: ResolvedArc } {
  const arc = overviewArc(programmeId, constructId);
  return {
    arc,
    sections: arcSections(arc, `\n\n### Skills in this module\n${skills.map((s) => `- **${s}**`).join("\n")}`),
    outcome: `Understand the ${constructName} face and start one deliberate practice.`,
  };
}

function skillSessions(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  skill: string
): { sections: SessionSection[]; outcome: string; arc: ResolvedArc } {
  const arc = skillArc(programmeId, constructId, skill);
  return {
    arc,
    sections: arcSections(arc),
    outcome:
      programmeId === "kids"
        ? `Learn about ${skill.toLowerCase()} with a story and one small try.`
        : `Practise ${skill} with a real example, a micro-practice and an if–then plan.`,
  };
}

const WOOP_PROMPTS: Record<ProgrammeId, PracticeLab["woop"]> = {
  adults: [
    { id: "wish", label: "Wish", prompt: "What do you want to achieve with this face in the next 7 days? Make it challenging but realistic." },
    { id: "outcome", label: "Outcome", prompt: "What is the best result of reaching it? Picture it for a moment: for you, your team and the people you serve." },
    { id: "obstacle", label: "Obstacle", prompt: "What is the main thing inside you (a habit, an emotion, an assumption) that could get in the way?" },
    { id: "plan", label: "Plan", prompt: "If [obstacle] happens, then I will [action]. Write it as one sentence." },
  ],
  adolescents: [
    { id: "wish", label: "Wish", prompt: "What do you want to get better at this week? Pick something that matters to you." },
    { id: "outcome", label: "Outcome", prompt: "What's the best thing that would happen if you did? Imagine it." },
    { id: "obstacle", label: "Obstacle", prompt: "What in you might get in the way, like a habit, a feeling or an excuse?" },
    { id: "plan", label: "Plan", prompt: "If [obstacle] happens, then I will [action]." },
  ],
  kids: [
    { id: "wish", label: "My wish", prompt: "What do I want to try this week?" },
    { id: "outcome", label: "The best bit", prompt: "How will I feel when I do it?" },
    { id: "obstacle", label: "What might stop me", prompt: "What could get in the way?" },
    { id: "plan", label: "My plan", prompt: "If that happens, then I will…" },
  ],
};

function practiceSessions(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string
): { sections: SessionSection[]; outcome: string; lab: PracticeLab } {
  const copy = COURSE_COPY[constructId];
  const lab: PracticeLab = {
    challenge: copy.practiceLab.challenge[programmeId],
    checklist: copy.practiceLab.checklist,
    woop: WOOP_PROMPTS[programmeId],
  };
  const sections: SessionSection[] = [
    {
      block: "read",
      title: "Read · the challenge",
      body: `## Practice lab · ${constructName}\n\nThis session is a **field lab**: one real-world challenge, planned with WOOP (Wish, Outcome, Obstacle, Plan), a method from motivation research that pairs a positive picture of the goal with an honest look at what could get in the way.\n\n### Challenge\n${lab.challenge}\n\n### Success checklist\n${lab.checklist.map((c) => `- [ ] ${c}`).join("\n")}`,
    },
    {
      block: "engage",
      title: "Engage · WOOP plan",
      body: lab.woop.map((w) => `### ${w.label}\n${w.prompt}`).join("\n\n"),
    },
    {
      block: "apply",
      title: "Apply · complete the lab",
      body: `### Do it, then reflect\n1. What did I try?\n2. What happened, for me and for others?\n3. What will I keep doing (habit, checklist, calendar)?\n\nMark complete when most of the checklist is true and your reflection is written.`,
    },
  ];
  return {
    lab,
    sections,
    outcome: `Plan and run a real-world ${constructName.toLowerCase()} challenge with WOOP.`,
  };
}

function quizSessions(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  constructName: string
): { sections: SessionSection[]; outcome: string; faceCheck: RetrievalQ[] } {
  const qs = faceCheck(programmeId, constructId);
  const sections: SessionSection[] = [
    {
      block: "read",
      title: "Read · face check",
      body: `## Face check · ${constructName}\n\nAnswer from memory first. Pulling ideas back out of memory helps them stick far better than re-reading.\n\n${qs.map((q, i) => `${i + 1}. ${q.q}`).join("\n")}`,
    },
    {
      block: "engage",
      title: "Engage · teach-back",
      body: `### Explain it simply\nIn 60 seconds (or five sentences), teach the ${constructName} face to someone else:\n- What it is\n- Why it matters\n- One practice they can try today\n\nIf you can teach it, you own it.`,
    },
    {
      block: "apply",
      title: "Apply · lock one habit",
      body: `### Lock one habit\nChoose **one** micro-habit from this module to keep for the next 14 days. Write it as an if–then plan: **If** [situation], **then I will** [action].`,
    },
  ];
  return {
    faceCheck: qs,
    sections,
    outcome: `Check what stuck from ${constructName} and lock one habit.`,
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

      const overview = overviewSessions(
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
        arc: overview.arc,
      });

      skills.forEach((skill, i) => {
        const built = skillSessions(programme.id, construct.id, skill);
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
          arc: built.arc,
        });
      });

      const practice = practiceSessions(
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
        lab: practice.lab,
      });

      const quiz = quizSessions(programme.id, construct.id, construct.name);
      lessons.push({
        id: `${id}-quiz`,
        courseId: id,
        title: "Face check",
        sections: quiz.sections,
        bodyMd: sectionsToMd(quiz.sections),
        lessonType: "quiz",
        sortOrder: order++,
        durationMinutes: 8,
        outcome: quiz.outcome,
        faceCheck: quiz.faceCheck,
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
