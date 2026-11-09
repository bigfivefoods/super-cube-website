import { constructs } from "@/lib/content";
import { curriculumMeta } from "@/lib/lms/curriculum-meta";
import {
  LEARN_JOURNAL_PRACTICE,
  LEARN_PRIMARY_NAV,
  LEARN_PROCESS_ACCENT,
  LEARN_SECONDARY_LINKS,
  ORG_LTI_LINK,
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

/** Profile step on /learn/welcome. The shell title is already in the chrome list. */
const WELCOME_LITERALS = [
  "Profile steps",
  "Continue →",
  "Who are you?",
  "Preferred name",
  "e.g. Craig",
  "Email (optional — for sync later)",
  "Age & programme",
  "We match Kids, Adolescents, or Adults content to your age band.",
  "Matched programme:",
  "Back",
  "Role & context",
  "I am a…",
  "Learning mainly for…",
  "Country",
  "City (optional)",
  "Primary growth goal (optional)",
  "e.g. Lead my team with more presence and clarity",
  "How will you learn?",
  "Family code (optional)",
  "Cohort / school / company code (optional)",
  "e.g. DEMO2026 or FAMILY-ABC",
  "You can join later from You → Cohort. Try DEMO2026 for pilots.",
  "After profile: optional first face pulse so charts start with real data.",
  "Sign up",
  "Sign in",
  "Save profile & start →",
  "Profile already saved.",
  "Skip to guided start",
  "Under 13",
  "13–17",
  "18–21",
  "22–24",
  "25–34",
  "35–44",
  "45–54",
  "55+",
  "Student",
  "Educator / teacher",
  "Manager / team lead",
  "Executive / senior leader",
  "Entrepreneur",
  "Parent / caregiver",
  "Professional",
  "Other",
  "School",
  "University / college",
  "Company / workplace",
  "NPO / NGO",
  "Family",
  "Faith community",
  "Personal growth",
  "Just me",
  "Learn at your own pace",
  "Parents, kids, household",
  "School / class",
  "Teacher or school code",
  "Company / team",
  "Work cohort or pilot",
  "Friends / peers",
  "Study circle",
  "Ages 5–12",
  "Ages 13–21",
  "Ages 22+",
  "Super-Cube® Kids",
  "Super-Cube® Adolescents",
  "Super-Cube® Adults",
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
  "Your first {total} minutes",
  "{name}, your first {total} minutes",
  "{n} min",
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
  keys.add(ORG_LTI_LINK.label);
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
export const LEARN_CHROME_KEYS: readonly string[] = collect([...CHROME_LITERALS, ...WELCOME_LITERALS]);

/** Strings for /learn/start: chrome, the four steps, and the document title. */
export const LEARN_START_KEYS: readonly string[] = collect([...CHROME_LITERALS, ...START_LITERALS]);
