import type { ConstructId } from "@/lib/content";

/**
 * Caption file paths. Phase 0: no transcript-matched WebVTT files exist yet, so
 * these return null and players render without a captions track (the old shared
 * sample-en.vtt did not match any video and was removed).
 * Convention for future files:
 *   /videos/captions/courses/{programme}/{construct}.vtt
 *   /videos/captions/sessions/{lessonId}.vtt
 */
export function courseCaptionsPath(
  _programmeId: string,
  _constructId: ConstructId
): string | null {
  return null;
}

export function sessionCaptionsPath(_lessonId: string): string | null {
  return null;
}
