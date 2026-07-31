import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

/**
 * Optional CDN / blob base (no trailing slash), e.g.
 * NEXT_PUBLIC_VIDEO_CDN=https://cdn.example.com/super-cube
 * Falls back to same-origin /public paths.
 */
function videoBase(): string {
  const raw = process.env.NEXT_PUBLIC_VIDEO_CDN?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

function withBase(path: string): string {
  const base = videoBase();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * 15s animated course intro clips per programme × construct.
 * Local: public/videos/courses/{programme}/{construct}.mp4
 * CDN:   {NEXT_PUBLIC_VIDEO_CDN}/videos/courses/...
 */
export function courseVideoPath(
  programmeId: ProgrammeId,
  constructId: ConstructId
): string {
  return withBase(`/videos/courses/${programmeId}/${constructId}.mp4`);
}

/**
 * 15s session intro clips (construct visual + lesson-specific voice-over).
 * Local: public/videos/sessions/{lessonId}.mp4
 * CDN:   {NEXT_PUBLIC_VIDEO_CDN}/videos/sessions/{lessonId}.mp4
 */
export function sessionVideoPath(lessonId: string): string {
  return withBase(`/videos/sessions/${lessonId}.mp4`);
}

/** Whether videos are expected from an external CDN */
export function usesVideoCdn(): boolean {
  return Boolean(videoBase());
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
