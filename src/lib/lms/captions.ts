import type { ConstructId } from "@/lib/content";

/**
 * Caption file paths. Use sample-en.vtt until per-asset WebVTT is produced.
 * Convention for future files:
 *   /videos/captions/courses/{programme}/{construct}.vtt
 *   /videos/captions/sessions/{lessonId}.vtt
 */
export function courseCaptionsPath(
  _programmeId: string,
  _constructId: ConstructId
): string {
  return "/videos/captions/sample-en.vtt";
}

export function sessionCaptionsPath(_lessonId: string): string {
  return "/videos/captions/sample-en.vtt";
}
