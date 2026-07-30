import { constructs, type ConstructId } from "@/lib/content";

export type ProgrammeId = "kids" | "adolescents" | "adults";

export interface Programme {
  id: ProgrammeId;
  name: string;
  ageLabel: string;
  ageMin: number;
  ageMax: number;
  tagline: string;
  description: string;
  audienceNote: string;
  tone: string;
  sortOrder: number;
  /** One-time course price in whole USD */
  priceUsd: number;
}

/** Single launch price for every Super-Cube® programme */
export const COURSE_PRICE_USD = 6;

export const programmes: Programme[] = [
  {
    id: "kids",
    name: "Super-Cube® Kids",
    ageLabel: "Ages 5–12",
    ageMin: 5,
    ageMax: 12,
    tagline: "Growing character, curiosity, and kindness.",
    description:
      "A guided Super-Cube journey for younger learners—simple language, stories, play-based practice, and parent/teacher support. Builds the six faces of leadership as everyday strengths.",
    audienceNote: "Ideal for parents, schools, and after-school programmes.",
    tone: "playful, visual, short sessions",
    sortOrder: 1,
    priceUsd: COURSE_PRICE_USD,
  },
  {
    id: "adolescents",
    name: "Super-Cube® Adolescents",
    ageLabel: "Ages 13–21",
    ageMin: 13,
    ageMax: 21,
    tagline: "Identity, influence, and wise decisions.",
    description:
      "For teens and young adults navigating school, sport, first jobs, and digital life. Develops choices, principles, mindset, emotions, body, and purpose—with real-world scenarios.",
    audienceNote:
      "Ideal for high school, college, youth leadership, and first-time supervisors.",
    tone: "relatable, scenario-led, peer-ready",
    sortOrder: 2,
    priceUsd: COURSE_PRICE_USD,
  },
  {
    id: "adults",
    name: "Super-Cube® Adults",
    ageLabel: "Ages 22+",
    ageMin: 22,
    ageMax: 99,
    tagline: "Human-centric leadership for work and life.",
    description:
      "The full professional Super-Cube pathway: pre-assessment, six construct courses, deliberate practice, post-assessment, and a personal development report for workplace leaders.",
    audienceNote: "Ideal for professionals, managers, and high-potentials.",
    tone: "professional, evidence-informed, workplace-applied",
    sortOrder: 3,
    priceUsd: COURSE_PRICE_USD,
  },
];

export function getProgramme(id: string): Programme | undefined {
  return programmes.find((p) => p.id === id);
}

/** Age-appropriate skill labels per construct */
export function skillsForProgramme(
  programmeId: ProgrammeId,
  constructId: ConstructId
): string[] {
  const base = constructs.find((c) => c.id === constructId)?.elements ?? [];
  if (programmeId === "adults") return base;

  const kidsMap: Record<ConstructId, string[]> = {
    choices: [
      "Making good decisions",
      "Knowing right from wrong",
      "Thinking before acting",
      "Trying bravely",
    ],
    principles: [
      "Being honest",
      "Understanding others",
      "Fair play",
      "Keeping promises",
    ],
    mental: [
      "Curious thinking",
      "Solving puzzles",
      "Big ideas",
      "Learning new things",
    ],
    emotional: [
      "Naming feelings",
      "Kindness",
      "Friends & family",
      "Staying calm",
    ],
    physical: [
      "Moving your body",
      "Rest & energy",
      "Healthy food",
      "Feeling strong",
    ],
    spiritual: [
      "What matters to me",
      "Hope & wonder",
      "Belonging",
      "Helping others",
    ],
  };

  const teenMap: Record<ConstructId, string[]> = {
    choices: [
      "Decision-making under pressure",
      "Personal values",
      "Judgement online & offline",
      "Healthy risk-taking",
    ],
    principles: [
      "Integrity & trust",
      "Reading the room",
      "Situational judgement",
      "Accountability",
    ],
    mental: [
      "Strategic thinking",
      "Problem-solving",
      "Vision for your future",
      "Applying knowledge",
    ],
    emotional: [
      "Emotional intelligence",
      "Empathy",
      "Relationships & peer influence",
      "Motivation & confidence",
    ],
    physical: [
      "Health & energy",
      "Stress & recovery",
      "Fitness habits",
      "Resilience under load",
    ],
    spiritual: [
      "Purpose & identity",
      "Meaning",
      "Beliefs & belonging",
      "Transcendent goals",
    ],
  };

  if (programmeId === "kids") return kidsMap[constructId] ?? base;
  return teenMap[constructId] ?? base;
}

export function assessmentPrompt(
  programmeId: ProgrammeId,
  constructId: ConstructId,
  skill: string,
  _index: number
): string {
  if (programmeId === "kids") {
    return `I am good at: ${skill.toLowerCase()}.`;
  }
  if (programmeId === "adolescents") {
    return `In school, sport, or with friends, I demonstrate: ${skill.toLowerCase()}.`;
  }
  return `In my leadership practice, I consistently demonstrate: ${skill.toLowerCase()}.`;
}

export function courseId(programmeId: ProgrammeId, constructId: ConstructId) {
  return `${programmeId}-${constructId}`;
}
