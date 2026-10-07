/**
 * Super-Cube® session learning arc (content v2, October 2026).
 * Every session follows the same eight steps so learners always know where they are:
 *   1 Hook → 2 Core idea → 3 Real-world example → 4 Reflect → 5 Micro-practice
 *   → 6 If–then plan → 7 Retrieval check (with feedback) → 8 Journal
 * plus a facilitator/coach guide for schools and organisations.
 * Examples come from the public record; no statistics are invented.
 */
import type { ProgrammeId } from "@/lib/programmes";

export type ByProgramme<T = string> = Partial<Record<ProgrammeId, T>>;

export type RetrievalQ = {
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  /** Why the answer is right; shown after any choice */
  why: string;
};

export type Example = { title: string; body: string; source?: string };

export type FacilitatorGuide = {
  /** Discussion questions for a group */
  discussion: string[];
  /** A short group activity */
  activity: string;
  minutes: number;
};

export type Arc = {
  /** Skill names (must match programmes.ts); null when a programme has no session for this slot */
  skills?: { adults: string; adolescents: string | null; kids: string | null };
  hook: ByProgramme;
  /** Core idea for Adults and Teens (plain language) */
  core: string;
  /** Core idea for Kids (short sentences) */
  coreKids?: string;
  /** Real-world example for Adults and Teens, preferably African */
  example: Example;
  exampleKids?: Example;
  reflect: ByProgramme;
  practice: ByProgramme;
  /** "If …, then I will …" */
  ifThen: ByProgramme;
  check: RetrievalQ[];
  checkKids?: RetrievalQ[];
  journal: ByProgramme;
  guide: ByProgramme<FacilitatorGuide>;
};

export type FaceContent = { overview: Arc; slots: Arc[] };

/** Fill a by-programme field, falling back Teens → Adults and Kids → Teens → Adults. */
export function pick<T>(v: ByProgramme<T>, p: ProgrammeId): T | undefined {
  if (p === "kids") return v.kids ?? v.adolescents ?? v.adults;
  if (p === "adolescents") return v.adolescents ?? v.adults;
  return v.adults;
}
