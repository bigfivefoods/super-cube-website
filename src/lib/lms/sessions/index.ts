/**
 * Session content v2: resolves the eight-step learning arc for a programme,
 * face and lesson. Lesson ids and counts are unchanged (the after-test gate
 * counts them), so this only changes what each session teaches.
 */
import type { ConstructId } from "@/lib/content";
import { skillsForProgramme, type ProgrammeId } from "@/lib/programmes";
import { CHOICES } from "./choices";
import { EMOTIONAL } from "./emotional";
import { MENTAL } from "./mental";
import { PHYSICAL } from "./physical";
import { PRINCIPLES } from "./principles";
import { SPIRITUAL } from "./spiritual";
import { pick, type Arc, type Example, type FaceContent, type FacilitatorGuide, type RetrievalQ } from "./types";

export type { Arc, Example, FaceContent, FacilitatorGuide, RetrievalQ } from "./types";

export const SESSION_CONTENT_VERSION = "2026-10-v2";

export const FACE_CONTENT: Record<ConstructId, FaceContent> = {
  choices: CHOICES,
  principles: PRINCIPLES,
  mental: MENTAL,
  emotional: EMOTIONAL,
  physical: PHYSICAL,
  spiritual: SPIRITUAL,
};

/** One session's arc with every field resolved for a programme. */
export type ResolvedArc = {
  hook: string;
  core: string;
  example: Example;
  reflect: string;
  practice: string;
  ifThen: string;
  check: RetrievalQ[];
  journal: string;
  guide: FacilitatorGuide;
};

/** The eight steps, in order, as shown on the session rail. */
export const ARC_STEPS = [
  { id: "hook", label: "Hook" },
  { id: "core", label: "Core idea" },
  { id: "example", label: "Example" },
  { id: "reflect", label: "Reflect" },
  { id: "practice", label: "Micro-practice" },
  { id: "ifthen", label: "If–then plan" },
  { id: "check", label: "Check" },
  { id: "journal", label: "Journal" },
] as const;

function need<T>(v: T | undefined, what: string): T {
  if (v === undefined) throw new Error(`Session content missing: ${what}`);
  return v;
}

function resolve(arc: Arc, p: ProgrammeId, label: string): ResolvedArc {
  const kids = p === "kids";
  return {
    hook: need(pick(arc.hook, p), `${label} hook`),
    core: kids ? need(arc.coreKids, `${label} coreKids`) : arc.core,
    example: kids ? need(arc.exampleKids, `${label} exampleKids`) : arc.example,
    reflect: need(pick(arc.reflect, p), `${label} reflect`),
    practice: need(pick(arc.practice, p), `${label} practice`),
    ifThen: need(pick(arc.ifThen, p), `${label} ifThen`),
    check: kids ? need(arc.checkKids, `${label} checkKids`) : arc.check,
    journal: need(pick(arc.journal, p), `${label} journal`),
    guide: need(pick(arc.guide, p), `${label} guide`),
  };
}

/** The slot (adult element) that teaches a programme's skill. */
export function slotFor(p: ProgrammeId, c: ConstructId, skill: string): Arc | undefined {
  return FACE_CONTENT[c].slots.find((s) => s.skills?.[p] === skill);
}

export function overviewArc(p: ProgrammeId, c: ConstructId): ResolvedArc {
  return resolve(FACE_CONTENT[c].overview, p, `${c} overview (${p})`);
}

export function skillArc(p: ProgrammeId, c: ConstructId, skill: string): ResolvedArc {
  const slot = need(slotFor(p, c, skill), `${c} slot for "${skill}" (${p})`);
  return resolve(slot, p, `${c} "${skill}" (${p})`);
}

/**
 * The end-of-module "Face check": the first retrieval question from each of
 * the programme's skill sessions, so learners retrieve every skill once more.
 */
export function faceCheck(p: ProgrammeId, c: ConstructId): RetrievalQ[] {
  return skillsForProgramme(p, c).map((s) => skillArc(p, c, s).check[0]);
}

/** Notes shown on every session of a face (safety, inclusion, age). */
export function sessionNotes(p: ProgrammeId, c: ConstructId): { tone: "safety" | "inclusive" | "kids"; text: string }[] {
  const notes: { tone: "safety" | "inclusive" | "kids"; text: string }[] = [];
  if (c === "physical") {
    notes.push({
      tone: "safety",
      text:
        p === "kids"
          ? "Grown-ups: this session shares general wellbeing ideas only. Please check with a doctor or clinic about any health, food or allergy questions."
          : "General wellbeing only, not medical advice. If you have a health condition, an injury or concerns about eating, sleep or exercise, speak to a doctor or another qualified health professional before making changes.",
    });
  }
  if (c === "spiritual") {
    notes.push({
      tone: "inclusive",
      text:
        "This session is faith-inclusive. Whether your beliefs are religious or not, bring your own tradition, values and culture to it. Sharing is always optional.",
    });
  }
  if (p === "kids") {
    notes.push({
      tone: "kids",
      text: "Best done with a parent, carer or teacher. Read it together, talk about the questions and let the child draw or say their answers.",
    });
  }
  return notes;
}

/** Markdown version of an arc (exports, search and the plain renderer). */
export function arcToMarkdown(a: ResolvedArc): { read: string; engage: string; apply: string } {
  const checks = a.check
    .map((q, i) => `${i + 1}. ${q.q}\n${q.options.map((o, j) => `   - ${j === q.answer ? "**" + o + "**" : o}`).join("\n")}`)
    .join("\n");
  return {
    read: `### Hook\n${a.hook}\n\n### Core idea\n${a.core}\n\n### Example: ${a.example.title}\n${a.example.body}${a.example.source ? `\n\nSource: ${a.example.source}` : ""}`,
    engage: `### Reflect\n${a.reflect}\n\n### Check your understanding\n${checks}`,
    apply: `### Micro-practice\n${a.practice}\n\n### If–then plan\n${a.ifThen}\n\n### Journal\n${a.journal}`,
  };
}
