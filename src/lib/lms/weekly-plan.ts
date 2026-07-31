import type { ConstructId } from "@/lib/content";
import { constructs } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import type { LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

export type WeeklyPlanItem = {
  constructId: ConstructId;
  constructName: string;
  color: string;
  score: number | null;
  reason: string;
  href: string;
  lessonTitle: string;
  status: "todo" | "done" | "in_progress";
};

export type WeeklyPlan = {
  weekLabel: string;
  focusConstructId: ConstructId | null;
  items: WeeklyPlanItem[];
  summary: string;
};

/**
 * Build a 3-session weekly practice plan prioritising weakest baseline faces.
 */
export function buildWeeklyPlan(state: LocalLmsState): WeeklyPlan | null {
  const programmeId = (state.subscription?.programmeId ||
    state.user?.programmeId) as ProgrammeId | undefined;
  if (!programmeId) return null;

  const courses = getCoursesForProgramme(programmeId);
  const pre = state.attempts.find((a) => a.phase === "pre");
  const progress = state.lessonProgress;

  type Ranked = {
    constructId: ConstructId;
    score: number | null;
    name: string;
    color: string;
  };

  let ranked: Ranked[];

  if (pre?.result.constructScores?.length) {
    ranked = constructs
      .map((c) => {
        const s = pre.result.constructScores.find(
          (x) => x.constructId === c.id
        );
        return {
          constructId: c.id,
          score: s?.score ?? null,
          name: c.name,
          color: c.color,
        };
      })
      .sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
  } else {
    // No baseline yet — curriculum order
    ranked = constructs.map((c) => ({
      constructId: c.id,
      score: null,
      name: c.name,
      color: c.color,
    }));
  }

  const items: WeeklyPlanItem[] = [];
  for (const face of ranked) {
    if (items.length >= 3) break;
    const course = courses.find((c) => c.constructId === face.constructId);
    if (!course) continue;
    const lesson =
      course.lessons.find((l) => progress[l.id] !== "completed") ||
      course.lessons[0];
    if (!lesson) continue;
    const status =
      progress[lesson.id] === "completed"
        ? "done"
        : progress[lesson.id] === "in_progress"
          ? "in_progress"
          : "todo";
    items.push({
      constructId: face.constructId,
      constructName: face.name,
      color: face.color,
      score: face.score,
      reason:
        face.score == null
          ? "Start here after orientation & baseline"
          : face.score < 50
            ? `Weakest face (baseline ${face.score}) — highest leverage`
            : face.score < 70
              ? `Growth opportunity (baseline ${face.score})`
              : `Maintain strength (baseline ${face.score})`,
      href: `/learn/courses/${face.constructId}/${lesson.id}`,
      lessonTitle: lesson.title,
      status,
    });
  }

  const focus = items[0]?.constructId ?? null;
  const weekLabel = isoWeekLabel();

  return {
    weekLabel,
    focusConstructId: focus,
    items,
    summary: pre
      ? "This week: deliberate practice on your lowest baseline faces first."
      : "Complete orientation + baseline so we can prioritise your weakest faces.",
  };
}

function isoWeekLabel(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `Week ${weekNo} · ${date.getUTCFullYear()}`;
}
