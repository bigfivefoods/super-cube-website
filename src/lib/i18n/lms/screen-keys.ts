import { constructs, type ConstructId } from "@/lib/content";
import { LIKERT_LABELS } from "@/lib/lms/assessment-items";
import { buildInstrumentItems, honestyItem, type InstrumentVersion } from "@/lib/lms/instruments";
import { attentionItem } from "@/lib/lms/integrity";
import { getLesson } from "@/lib/lms/curriculum";
import {
  ADOLESCENT_FACE_TAGLINES,
  KIDS_FACE_TAGLINES,
} from "@/lib/lms/face-taglines";
import {
  PROGRAMME_COPY_ADULTS,
  PROGRAMME_COPY_ADOLESCENTS,
  PROGRAMME_COPY_KIDS,
} from "@/lib/lms/programme-copy";
import { courseId, programmes, type ProgrammeId } from "@/lib/programmes";
import { LEARN_CHROME_KEYS } from "./page-keys";
import { messageKey } from "./text";

const PROGRAMMES: ProgrammeId[] = ["kids", "adolescents", "adults"];
const VERSIONS: InstrumentVersion[] = ["v1", "v2"];

const SKIP_KEY =
  /^(id|href|color|colorSoft|accent|coverPath|instrumentId|constructId|courseId|lessonId|programmeId|itemType|lessonType|block|phase|tone|sessionHref|key|answer|value|score|sortOrder|reverse|durationMinutes|kind|process|urgency|status|serverId|completedAt)$/;

/**
 * English strings inside a lesson or questionnaire value. Ids, hrefs and enum
 * fields are skipped, matching localizeDeep, so the slice only holds copy.
 */
export function collectLmsKeys(value: unknown, into: Set<string> = new Set(), key?: string): Set<string> {
  if (typeof value === "string") {
    if (key && SKIP_KEY.test(key)) return into;
    if (!value || value.startsWith("/") || value.startsWith("http") || value.startsWith("#") || value.startsWith("mailto:")) {
      return into;
    }
    if (/\p{L}/u.test(value)) into.add(messageKey(value));
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectLmsKeys(item, into);
    return into;
  }
  if (value && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return into;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      collectLmsKeys(v, into, k);
    }
  }
  return into;
}

/** Shell titles the lesson player passes through t(). */
const LESSON_UI = ["Session not found"] as const;

/**
 * Strings one lesson screen can show: shell chrome plus that lesson's copy.
 * Other lessons' bodies stay out of the page.
 */
export function lessonScreenKeys(constructId: string, lessonId: string): string[] {
  const keys = new Set<string>(LEARN_CHROME_KEYS);
  for (const extra of LESSON_UI) keys.add(extra);
  if (!constructs.some((face) => face.id === constructId)) return [...keys];
  const face = constructId as ConstructId;
  for (const programmeId of PROGRAMMES) {
    const data = getLesson(courseId(programmeId, face), lessonId);
    if (data) collectLmsKeys(data, keys);
  }
  return [...keys];
}

/** Chrome the questionnaire shells pass through t(), plus the instrument bank. */
const ASSESSMENT_UI = [
  "Assessment",
  "Loading…",
  "Your baseline is locked",
  "After-test recorded",
  "After-test not open yet",
  "Step 3 of 6 · Measure your baseline",
  "Mid-pathway check-in",
  "Step 5 of 6 · Re-measure after the programme",
  "Pre-pre assessment",
  "Step 2 of 6 · Orient your mind",
  "Assessment hub",
  "See your baseline narrative",
  "Continue sessions",
  "View your report",
  "Save & resume later",
  "Back",
  "Next construct",
  "Saving…",
  "Submit & see your narrative",
  "Submit mid check-in",
  "Submit & view report",
  "two quick checks",
  "one quick check",
  "Programme",
] as const;

let assessmentKeys: string[] | null = null;

/**
 * Strings the baseline, mid check-in, after-test, hub and orientation screens
 * can look up. Lesson bodies are not included.
 */
export function assessmentScreenKeys(): readonly string[] {
  if (assessmentKeys) return assessmentKeys;
  const keys = new Set<string>(LEARN_CHROME_KEYS);
  for (const extra of ASSESSMENT_UI) keys.add(extra);
  for (const label of LIKERT_LABELS) keys.add(label);
  for (const programme of programmes) keys.add(programme.name);
  for (const face of constructs) {
    keys.add(face.name);
    keys.add(face.shortName);
    if (face.tagline) keys.add(face.tagline);
  }
  collectLmsKeys(KIDS_FACE_TAGLINES, keys);
  collectLmsKeys(ADOLESCENT_FACE_TAGLINES, keys);
  collectLmsKeys(PROGRAMME_COPY_ADULTS, keys);
  collectLmsKeys(PROGRAMME_COPY_KIDS, keys);
  collectLmsKeys(PROGRAMME_COPY_ADOLESCENTS, keys);
  for (const programmeId of PROGRAMMES) {
    for (const version of VERSIONS) {
      collectLmsKeys(buildInstrumentItems(programmeId, version), keys);
      collectLmsKeys(attentionItem(programmeId, version), keys);
    }
    collectLmsKeys(honestyItem(programmeId), keys);
  }
  assessmentKeys = [...keys];
  return assessmentKeys;
}
