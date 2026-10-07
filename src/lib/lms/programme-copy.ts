/**
 * Programme-level lines inside /learn (page intros, journey steps, next actions).
 * Adults keep the original wording. Kids (about grade 3) and Adolescents (about
 * grade 7) versions reuse existing programme copy: programmes.ts, the Kids/Teens
 * session copy and the age-specific labels already used in sessions
 * ("a story", "Quick quiz", "one small try"). No new claims.
 *
 * Placeholders: {programme} = programme name, {n} = a number supplied by the page.
 */
import type { LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

export const PROGRAMME_COPY_ADULTS = {
  "journey.programme.description":
    "Kids, Adolescents, or Adults—same six faces, language matched to your season of life.",
  "journey.programme.promise": "Start with the pathway that fits you.",
  "journey.orient.description":
    "Map how you already think about leadership—philosophy, theory, and models.",
  "journey.orient.promise": "We meet you where you are—not where a textbook says you should be.",
  "journey.baseline.description":
    "A short self-report across all six Super-Cube® faces—your starting profile.",
  "journey.baseline.promise": "Clarity before change. You’ll see strengths and growth edges.",
  "journey.learn.description":
    "Work through each construct in short eight-step sessions: deliberate practice, not passive scrolling.",
  "journey.learn.promise": "Small sessions that compound into real leadership capacity.",
  "journey.remeasure.description":
    "Take the post-assessment once you’ve finished all construct courses—same six faces as your baseline.",
  "journey.remeasure.promise":
    "See how you have grown. Pre → post comparison makes development visible, not assumed.",
  "journey.report.description":
    "Your personal development report—baseline, post scores, deltas, and recommendations.",
  "journey.report.promise": "Evidence of progress you can feel proud of and act on.",

  "courses.subtitle":
    "{programme} · Short eight-step sessions: an idea, a real example, a practice, a plan and a quick check. Small sessions that compound into real capacity.",
  "courses.after":
    "Finish every construct session, take the post-assessment (same six faces as baseline), then open your growth report to see how you’ve developed.",
  "course.subtitle": "{programme} · {n} sessions · eight-step learning arc",

  "assessment.pre.subtitle":
    "{programme} · {n} statements across the six faces (rate each 1–5). Developmental self-report—not clinical. Save anytime.",
  "assessment.mid.subtitle":
    "{programme} · Short re-measure to refresh your weekly plan. Same faces, honest scores.",
  "assessment.post.subtitle":
    "{programme} · Same statements as your baseline. Opens after practice time and completed sessions.",
  "assessment.hub.subtitle":
    "Orientation (step 2 of 6) and your baseline (step 3) start the pathway. After the practice period, the after-test (step 5) measures your growth.",
  "orientation.subtitle":
    "Before the six-face baseline: map how you already think about leadership—philosophy, theory, and models. We meet you where you are.",
  "report.subtitle": "{programme} · Developmental profile (not a clinical diagnosis)",
  "report.subtitle.post": "—pre to post growth after your programme.",
  "report.subtitle.baseline":
    "—baseline view. The after-test opens after the practice period and enough completed sessions.",
  "practice.subtitle": "3–5 minutes. Guided by your face patterns and baseline. Streak counts.",
  "start.subtitle":
    "{programme} · Guided path. Skip anytime—this is the fastest route to a real baseline and first practice.",
  "feedback.locked.subtitle": "Complete the pre-assessment to unlock narrative feedback and your lit cube.",
  "feedback.subtitle": "Your strengths first, then one growth edge and one practice per face.",
  "account.subtitle":
    "Your identity, growth snapshot, cohort, and device tools—one place to know yourself in Super-Cube®.",

  "next.orient.detail": "Short knowledge check before your six-face baseline.",
  "next.baseline.detail": "Map all six Super-Cube® faces — your growth reference point.",
  "next.post.detail": "You’ve practised enough — take the post-assessment for pre→post proof.",
  "next.report.detail": "Pre→post radar, story, and shareable PDF.",
  "next.celebrate.detail": "Browse courses or open Progress when you want a deeper look.",
} as const;

export type ProgrammeCopyKey = keyof typeof PROGRAMME_COPY_ADULTS;

export const PROGRAMME_COPY_KIDS: Record<ProgrammeCopyKey, string> = {
  "journey.programme.description": "Super-Cube® Kids: simple language, stories and play for ages 5–12.",
  "journey.programme.promise": "Growing character, curiosity, and kindness.",
  "journey.orient.description": "A few questions about how you think about being a leader.",
  "journey.orient.promise": "We start where you are.",
  "journey.baseline.description": "Tap how true each sentence is for you, across all six faces.",
  "journey.baseline.promise": "See your strengths and what to grow next.",
  "journey.learn.description": "Short sessions for each face, with a story, a quick quiz and one small try.",
  "journey.learn.promise": "Every time you try something hard, you get a little smarter.",
  "journey.remeasure.description": "When you finish all six faces, answer the same sentences again.",
  "journey.remeasure.promise": "See how you have grown.",
  "journey.report.description": "Your report shows your strengths and how you have grown.",
  "journey.report.promise": "Something to feel proud of.",

  "courses.subtitle": "{programme} · Short sessions with a story, a quick quiz and one small try.",
  "courses.after": "Finish all six faces. Then answer the same sentences again and see how you have grown.",
  "course.subtitle": "{programme} · {n} short sessions",

  "assessment.pre.subtitle":
    "{programme} · {n} sentences about you. Tap how true each one is. It's OK to stop and come back.",
  "assessment.mid.subtitle": "{programme} · A short check-in. Same six faces. Be honest.",
  "assessment.post.subtitle": "{programme} · The same sentences as last time. This opens after you finish your sessions.",
  "assessment.hub.subtitle": "Steps 2 and 3 help you start. After you practise, step 5 shows how you have grown.",
  "orientation.subtitle": "A few questions about how you think about being a leader. We start where you are.",
  "report.subtitle": "{programme} · Your six faces (not a medical test)",
  "report.subtitle.post": " · See how you have grown.",
  "report.subtitle.baseline": " · Where you are now. The after-test opens after you practise and finish your sessions.",
  "practice.subtitle": "A few minutes. One small try for today.",
  "start.subtitle": "{programme} · Follow these steps with your grown-up. You can skip anytime.",
  "feedback.locked.subtitle": "Do your first check to see your feedback and light up your cube.",
  "feedback.subtitle": "Your strengths first. Then one thing to grow and one thing to try for each face.",
  "account.subtitle": "Your name, your progress and your settings, all in one place.",

  "next.orient.detail": "A few questions before your first check.",
  "next.baseline.detail": "Tap how true each sentence is for you, across all six faces.",
  "next.post.detail": "You have practised a lot. Answer the same sentences again to see how you have grown.",
  "next.report.detail": "See your strengths and how you have grown.",
  "next.celebrate.detail": "Pick a face and try a new session.",
};

export const PROGRAMME_COPY_ADOLESCENTS: Record<ProgrammeCopyKey, string> = {
  "journey.programme.description":
    "For teens and young adults: school, sport, first jobs and digital life. The same six faces as every programme.",
  "journey.programme.promise": "Identity, influence, and wise decisions.",
  "journey.orient.description": "Map how you already think about leadership before you start.",
  "journey.orient.promise": "We meet you where you are.",
  "journey.baseline.description": "A short check across all six Super-Cube® faces. This is your starting point.",
  "journey.baseline.promise": "See your strengths and your growth edges.",
  "journey.learn.description":
    "Short eight-step sessions for each face, with real-world scenarios and practice, not passive scrolling.",
  "journey.learn.promise": "Small sessions, practised often, build real skills.",
  "journey.remeasure.description":
    "When you've finished all six courses, take the after-test. Same six faces as your baseline.",
  "journey.remeasure.promise": "See how you have grown.",
  "journey.report.description": "Your growth report: your baseline, your after-test scores and what to practise next.",
  "journey.report.promise": "Progress you can feel proud of and act on.",

  "courses.subtitle":
    "{programme} · Short eight-step sessions: an idea, a real example, a practice, a plan and a quick check.",
  "courses.after":
    "Finish every session, take the after-test (same six faces as your baseline), then open your growth report to see how you've grown.",
  "course.subtitle": "{programme} · {n} sessions · eight steps each",

  "assessment.pre.subtitle":
    "{programme} · {n} statements across the six faces (rate each 1–5). Not a test and not a diagnosis. Your answers save as you go.",
  "assessment.mid.subtitle": "{programme} · A short check-in to refresh your weekly plan. Same faces, honest scores.",
  "assessment.post.subtitle":
    "{programme} · Same statements as your baseline. It opens once you've had time to practise and finished your sessions.",
  "assessment.hub.subtitle":
    "Orientation (step 2) and your baseline (step 3) get you started. After you practise, the after-test (step 5) shows how you've grown.",
  "orientation.subtitle": "Before your baseline: map how you already think about leadership. We meet you where you are.",
  "report.subtitle": "{programme} · Your development profile (not a clinical diagnosis)",
  "report.subtitle.post": "—before and after your programme.",
  "report.subtitle.baseline": "—baseline view. The after-test opens once you've practised and finished enough sessions.",
  "practice.subtitle": "3–5 minutes, picked from your baseline. Keep your streak going.",
  "start.subtitle": "{programme} · A guided start. Skip anytime: it's the fastest way to your baseline and first practice.",
  "feedback.locked.subtitle": "Complete your baseline to unlock your feedback and lit cube.",
  "feedback.subtitle": "Your strengths first, then one growth edge and one practice for each face.",
  "account.subtitle": "Your profile, growth snapshot, group and device tools, all in one place.",

  "next.orient.detail": "A short check before your six-face baseline.",
  "next.baseline.detail": "Rate yourself across all six Super-Cube® faces. This is your starting point.",
  "next.post.detail": "You've practised enough. Take the after-test to see how you've grown.",
  "next.report.detail": "Your before and after radar, story and PDF.",
  "next.celebrate.detail": "Browse courses, or open Progress when you want a deeper look.",
};

/** The learner's programme from local state (subscription → user → profile). */
export function learnerProgrammeId(state: LocalLmsState | null | undefined): ProgrammeId | undefined {
  return (state?.subscription?.programmeId || state?.user?.programmeId || state?.profile?.programmeId) as
    | ProgrammeId
    | undefined;
}

export function programmeCopy(
  key: ProgrammeCopyKey,
  programmeId?: ProgrammeId | string | null,
  vars: Record<string, string | number> = {},
): string {
  const table =
    programmeId === "kids"
      ? PROGRAMME_COPY_KIDS
      : programmeId === "adolescents"
        ? PROGRAMME_COPY_ADOLESCENTS
        : PROGRAMME_COPY_ADULTS;
  return table[key].replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
