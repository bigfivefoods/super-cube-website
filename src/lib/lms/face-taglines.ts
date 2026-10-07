/**
 * Age-appropriate one-line face taglines for the learner app (assessment, previews).
 * Adults keep the site taglines from content.ts. Kids and Adolescents lines reuse
 * the wording of the Super-Cube® session core ideas (src/lib/lms/sessions/*):
 * no new claims, only shorter forms of copy learners already see in their sessions.
 */
import { constructs, type ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

/** From each face's `coreKids` session copy. */
export const KIDS_FACE_TAGLINES: Record<ConstructId, string> = {
  choices: "Choosing well: stop, think, check, go.",
  principles: "The rules you live by, like being honest, being fair and keeping promises.",
  mental: "Your thinking brain: being curious, solving puzzles and learning new things.",
  emotional: "Your feelings and other people's feelings.",
  physical: "Looking after your body.",
  spiritual: "The things that matter most deep inside you: love, hope, belonging and helping others.",
};

/** From each face's `core` session copy (shared by Adults and Teens). */
export const ADOLESCENT_FACE_TAGLINES: Record<ConstructId, string> = {
  choices: "How you decide when things are unclear.",
  principles: "The bedrock of trustworthy leadership.",
  mental: "The thinking face: strategic thinking, problem-solving and vision.",
  emotional: "The heart face: empathy, relationships and motivation.",
  physical: "Your body is part of your leadership.",
  spiritual: "Connect what you do with what matters most to you.",
};

export function faceTagline(constructId: ConstructId, programmeId: ProgrammeId): string {
  if (programmeId === "kids") return KIDS_FACE_TAGLINES[constructId];
  if (programmeId === "adolescents") return ADOLESCENT_FACE_TAGLINES[constructId];
  return constructs.find((c) => c.id === constructId)?.tagline ?? "";
}
