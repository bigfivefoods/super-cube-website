import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

/**
 * 15s animated course intro clips per programme × construct.
 * Files live under public/videos/courses/{programme}/{construct}.mp4
 */
export function courseVideoPath(
  programmeId: ProgrammeId,
  constructId: ConstructId
): string {
  return `/videos/courses/${programmeId}/${constructId}.mp4`;
}

/**
 * 15s session intro clips (construct visual + lesson-specific voice-over).
 * Files live under public/videos/sessions/{lessonId}.mp4
 */
export function sessionVideoPath(lessonId: string): string {
  return `/videos/sessions/${lessonId}.mp4`;
}

export const COURSE_VIDEO_CONSTRUCTS: ConstructId[] = [
  "choices",
  "principles",
  "mental",
  "emotional",
  "physical",
  "spiritual",
];

export const COURSE_VIDEO_PROGRAMMES: ProgrammeId[] = [
  "kids",
  "adolescents",
  "adults",
];
