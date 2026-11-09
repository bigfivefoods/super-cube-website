/**
 * Courses an LMS administrator can place with Deep Linking 2.0.
 * Built from the programme and face names already on the site. No lesson text.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { programmes, type ProgrammeId } from "@/lib/programmes";

export type LtiCourse = {
  id: string;
  programmeId: ProgrammeId;
  constructId: ConstructId | null;
  title: string;
  description: string;
  kind: "programme" | "face";
};

const IDS = new Set(programmes.map((p) => p.id));

export function ltiCatalog(): LtiCourse[] {
  const courses: LtiCourse[] = [];
  for (const programme of programmes) {
    courses.push({
      id: programme.id,
      programmeId: programme.id,
      constructId: null,
      title: programme.name,
      description: programme.tagline,
      kind: "programme",
    });
    for (const face of constructs) {
      courses.push({
        id: `${programme.id}-${face.id}`,
        programmeId: programme.id,
        constructId: face.id,
        title: `${face.name} · ${programme.name}`,
        description: face.tagline,
        kind: "face",
      });
    }
  }
  return courses;
}

export function findLtiCourse(id: string | null | undefined): LtiCourse | undefined {
  if (!id) return undefined;
  return ltiCatalog().find((course) => course.id === id);
}

export function courseFromClaims(programmeId: string | null, courseId: string | null): LtiCourse {
  const course = findLtiCourse(courseId) || findLtiCourse(programmeId);
  if (course) return course;
  const programme = IDS.has(programmeId as ProgrammeId) ? (programmeId as ProgrammeId) : "adults";
  return findLtiCourse(programme) as LtiCourse;
}

export function launchPath(course: LtiCourse): string {
  if (course.constructId) return `/learn/courses/${course.constructId}`;
  return "/learn/courses";
}
