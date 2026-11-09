import { constructs } from "@/lib/content";
import { curriculumMeta } from "@/lib/lms/curriculum-meta";
import {
  LEARN_JOURNAL_PRACTICE,
  LEARN_PRIMARY_NAV,
  LEARN_PROCESS_ACCENT,
  LEARN_SECONDARY_LINKS,
  ORG_RESULTS_LINK,
  SECONDARY_GROUP_LABELS,
} from "@/lib/lms/nav";
import {
  PROGRAMME_COPY_ADULTS,
  PROGRAMME_COPY_ADOLESCENTS,
  PROGRAMME_COPY_KIDS,
} from "@/lib/lms/programme-copy";
import { programmes } from "@/lib/programmes";

/**
 * Chrome the Learn shell, bottom nav and course tree can ask for on any screen.
 * Lesson bodies and questionnaire items are added per screen (screen-keys.ts).
 */
const CHROME_LITERALS = [
  "Skip to page content",
  "Learn navigation",
  "Learn app navigation",
  "Today",
  "Learning",
  "Journaling",
  "You",
  "Your pathway",
  "Step {n} of {total}",
  "Step {n}",
  "{done} of {total} steps done",
  "{done} of {total} pathway steps done",
  "Continue",
  "Continue pathway →",
  "More tools",
  "Collapse courses",
  "Expand courses",
  "All courses →",
  "YOU ARE HERE",
  "COMPLETE",
  "Choose",
  "Orient",
  "Baseline",
  "Learn",
  "Re-measure",
  "Report",
  "Welcome: tell us about you",
  "A 60-second profile so Learn, Report, and your cohort fit who you are. Private on this device until you sign in.",
] as const;

/** Copy the guided start screen itself can show, plus its document title. */
const START_LITERALS = [
  "Start your free baseline",
  "Start your free Super-Cube® leadership baseline in about 5 minutes, no payment needed.",
  "Recommended next",
  "Continue →",
  "Open step →",
  "Orient",
  "Baseline (start)",
  "One session",
  "First win",
  "How you see leadership levels—quick pre-pre check.",
  "Six faces, honest ratings. You can save mid-way and resume.",
  "After baseline, open your weekly plan’s first face—or start any course.",
  "Complete a session to unlock win-of-the-day and streak.",
  "Prefer the full dashboard?",
  "Go to Learn",
  "You / profile",
  "Edit profile",
  "Loading…",
  PROGRAMME_COPY_ADULTS["start.subtitle"],
  PROGRAMME_COPY_KIDS["start.subtitle"],
  PROGRAMME_COPY_ADOLESCENTS["start.subtitle"],
] as const;

function collect(extra: readonly string[]): string[] {
  const keys = new Set<string>(extra);
  for (const item of LEARN_PRIMARY_NAV) {
    keys.add(item.label);
    keys.add(item.hint);
  }
  keys.add(LEARN_JOURNAL_PRACTICE.label);
  keys.add(LEARN_JOURNAL_PRACTICE.hint);
  for (const link of LEARN_SECONDARY_LINKS) keys.add(link.label);
  keys.add(ORG_RESULTS_LINK.label);
  for (const label of Object.values(SECONDARY_GROUP_LABELS)) keys.add(label);
  for (const accent of Object.values(LEARN_PROCESS_ACCENT)) keys.add(accent.label);
  for (const programme of programmes) keys.add(programme.name);
  for (const face of constructs) {
    keys.add(face.name);
    keys.add(face.shortName);
  }
  for (const course of curriculumMeta) {
    keys.add(course.title);
    for (const lesson of course.lessons) keys.add(lesson.title);
  }
  return [...keys];
}

/** Strings for /learn/welcome (shell plus the profile intro). */
export const LEARN_CHROME_KEYS: readonly string[] = collect(CHROME_LITERALS);

/** Strings for /learn/start: chrome, the four steps, and the document title. */
export const LEARN_START_KEYS: readonly string[] = collect([...CHROME_LITERALS, ...START_LITERALS]);
