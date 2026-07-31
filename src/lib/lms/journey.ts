import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import {
  hasLocalAccess,
  type LocalLmsState,
} from "@/lib/lms/store";
import {
  getProgramme,
  type ProgrammeId,
} from "@/lib/programmes";

export type JourneyStepId =
  | "programme"
  | "orient"
  | "baseline"
  | "learn"
  | "remeasure"
  | "report";

export type JourneyStepStatus = "done" | "current" | "upcoming" | "locked";

export interface JourneyStep {
  id: JourneyStepId;
  n: number;
  title: string;
  short: string;
  description: string;
  /** Outcome promise — why this step feels good */
  promise: string;
  href: string;
  status: JourneyStepStatus;
  /** Compact status line under the title */
  detail: string;
  cta: string;
}

export interface JourneySnapshot {
  steps: JourneyStep[];
  current: JourneyStep;
  next: JourneyStep;
  doneCount: number;
  total: number;
  pct: number;
  programmeId?: ProgrammeId;
  programmeName?: string;
  programmeAge?: string;
  access: boolean;
  orientationDone: boolean;
  preDone: boolean;
  postDone: boolean;
  learnDone: boolean;
  preOverall?: number;
  postOverall?: number;
  growthDelta?: number | null;
  completedLessons: number;
  totalLessons: number;
  coursePct: number;
}

/**
 * Single linear Super-Cube® pathway used everywhere in the LMS.
 * Only one step is "current" — the first incomplete, unlocked step.
 *
 * 1 Choose → 2 Orient → 3 Baseline → 4 Learn → 5 Re-measure (post) → 6 Report
 */
export function getJourney(state: LocalLmsState): JourneySnapshot {
  const access = hasLocalAccess(state);
  const programmeId = (state.subscription?.programmeId ||
    state.user?.programmeId) as ProgrammeId | undefined;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const courses = programmeId ? getCoursesForProgramme(programmeId) : [];
  const completedLessons = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;
  const totalLessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  const coursePct =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  const orientation = state.orientation;
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");

  const programmeDone = Boolean(programmeId);
  const orientDone = Boolean(orientation);
  const preDone = Boolean(pre);
  const learnDone = preDone && totalLessons > 0 && coursePct >= 100;
  const postDone = Boolean(post);
  const reportDone = postDone; // full growth report complete after post

  const growthDelta =
    pre && post
      ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
      : null;

  const defs: Omit<JourneyStep, "status" | "detail" | "cta">[] = [
    {
      id: "programme",
      n: 1,
      title: "Choose your programme",
      short: "Choose",
      description:
        "Kids, Adolescents, or Adults—same six faces, language matched to your season of life.",
      promise: "Start with the pathway that fits you.",
      href: "/learn/programmes",
    },
    {
      id: "orient",
      n: 2,
      title: "Orient your mind",
      short: "Orient",
      description:
        "Map how you already think about leadership—philosophy, theory, and models.",
      promise: "We meet you where you are—not where a textbook says you should be.",
      href: "/learn/assessment/orientation",
    },
    {
      id: "baseline",
      n: 3,
      title: "Measure your baseline",
      short: "Baseline",
      description:
        "A short self-report across all six Super-Cube® faces—your starting profile.",
      promise: "Clarity before change. You’ll see strengths and growth edges.",
      href: "/learn/assessment/pre",
    },
    {
      id: "learn",
      n: 4,
      title: "Develop the six faces",
      short: "Learn",
      description:
        "Work through each construct with Read · Engage · Apply—deliberate practice, not passive scrolling.",
      promise: "Small sessions that compound into real leadership capacity.",
      href: "/learn/courses",
    },
    {
      id: "remeasure",
      n: 5,
      title: "Re-measure after the programme",
      short: "Re-measure",
      description:
        "Take the post-assessment once you’ve finished all construct courses—same six faces as your baseline.",
      promise:
        "See how you have grown. Pre → post comparison makes development visible, not assumed.",
      href: "/learn/assessment/post",
    },
    {
      id: "report",
      n: 6,
      title: "See your growth report",
      short: "Report",
      description:
        "Your personal development report—baseline, post scores, deltas, and recommendations.",
      promise: "Evidence of progress you can feel proud of and act on.",
      href: pre ? "/learn/report" : "/learn/assessment/pre",
    },
  ];

  const raw = defs.map((d) => {
    let status: JourneyStepStatus = "upcoming";
    let detail = "";
    let cta = "Continue";

    switch (d.id) {
      case "programme":
        if (programmeDone) {
          status = "done";
          detail = programme
            ? `${programme.name.replace("Super-Cube® ", "")} · ${programme.ageLabel}`
            : "Selected";
          cta = "Change programme";
        } else {
          status = "current";
          detail = "Pick Kids, Adolescents, or Adults";
          cta = "Choose programme";
        }
        break;
      case "orient":
        if (!programmeDone) {
          status = "locked";
          detail = "Choose a programme first";
          cta = "Locked";
        } else if (orientDone) {
          status = "done";
          detail = orientation!.result.label;
          cta = "Review orientation";
        } else {
          status = "upcoming";
          detail = "Philosophy · theory · model";
          cta = "Start orientation";
        }
        break;
      case "baseline":
        if (!orientDone) {
          status = "locked";
          detail = "Complete orientation first";
          cta = "Locked";
        } else if (preDone) {
          status = "done";
          detail = `Overall ${pre!.result.overall}/100`;
          cta = "Retake baseline";
        } else {
          status = "upcoming";
          detail = "Six-face pre-assessment";
          cta = "Start baseline";
        }
        break;
      case "learn":
        if (!preDone) {
          status = "locked";
          detail = "Complete baseline first";
          cta = "Locked";
        } else if (learnDone) {
          status = "done";
          detail = `${completedLessons}/${totalLessons} sessions · 100%`;
          cta = "Review courses";
        } else {
          status = "upcoming";
          detail =
            totalLessons > 0
              ? `${coursePct}% · ${completedLessons}/${totalLessons} sessions`
              : "Six construct modules";
          cta = coursePct > 0 ? "Continue learning" : "Start learning";
        }
        break;
      case "remeasure":
        if (!learnDone) {
          status = "locked";
          detail = learnDone
            ? "Ready"
            : preDone
              ? `Finish all courses first · ${coursePct}%`
              : "Complete the programme first";
          cta = "Locked";
        } else if (postDone) {
          status = "done";
          detail = `Post overall ${post!.result.overall}/100`;
          cta = "Retake post-assessment";
        } else {
          status = "upcoming";
          detail = "Same instrument as baseline · after full programme";
          cta = "Start post-assessment";
        }
        break;
      case "report":
        if (!preDone) {
          status = "locked";
          detail = "Available after baseline";
          cta = "Locked";
        } else if (reportDone) {
          status = "done";
          detail =
            growthDelta !== null
              ? `Growth ${growthDelta > 0 ? "+" : ""}${growthDelta} overall`
              : `Post ${post!.result.overall}/100`;
          cta = "View growth report";
        } else if (!learnDone) {
          // Interim: can peek at baseline report while learning
          status = "upcoming";
          detail = `Baseline ${pre!.result.overall} · finish learning, then re-measure`;
          cta = "View baseline report";
        } else if (!postDone) {
          status = "upcoming";
          detail = "Unlock full growth view after post-assessment";
          cta = "View interim report";
        } else {
          status = "upcoming";
          detail = "Your growth profile is ready";
          cta = "Open growth report";
        }
        break;
    }

    return { ...d, status, detail, cta };
  });

  // Exactly one current: first incomplete unlocked step
  let currentAssigned = false;
  const steps: JourneyStep[] = raw.map((s) => {
    if (s.status === "done" || s.status === "locked") return s;
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...s, status: "current" as const };
    }
    return { ...s, status: "upcoming" as const };
  });

  if (!currentAssigned) {
    const last = steps[steps.length - 1];
    steps[steps.length - 1] = { ...last, status: "current" };
  }

  const current = steps.find((s) => s.status === "current") ?? steps[0];
  const next = current;
  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const pct = Math.round((doneCount / total) * 100);

  return {
    steps,
    current,
    next,
    doneCount,
    total,
    pct,
    programmeId,
    programmeName: programme?.name,
    programmeAge: programme?.ageLabel,
    access,
    orientationDone: orientDone,
    preDone,
    postDone,
    learnDone,
    preOverall: pre?.result.overall,
    postOverall: post?.result.overall,
    growthDelta,
    completedLessons,
    totalLessons,
    coursePct,
  };
}

/** Which journey step a pathname belongs to (for highlighting). */
export function journeyStepFromPath(pathname: string): JourneyStepId | null {
  if (pathname.startsWith("/learn/programmes")) return "programme";
  if (pathname.startsWith("/learn/assessment/orientation")) return "orient";
  if (pathname.startsWith("/learn/assessment/pre")) return "baseline";
  if (pathname.startsWith("/learn/assessment/post")) return "remeasure";
  if (pathname.startsWith("/learn/assessment")) return "orient";
  if (pathname.startsWith("/learn/courses")) return "learn";
  if (pathname.startsWith("/learn/report")) return "report";
  if (pathname === "/learn") return null;
  return null;
}
