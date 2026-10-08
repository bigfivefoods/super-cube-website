/**
 * Spaced review across the 21-day journey (Day 3, 7 and 14 after the
 * baseline). Each review mixes retrieval questions across faces (interleaving)
 * and puts the questions a learner missed first.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { skillsForProgramme, type ProgrammeId } from "@/lib/programmes";
import { courseId } from "@/lib/programmes";
import { skillArc, overviewArc, type RetrievalQ } from "@/lib/lms/sessions";

export const REVIEW_DAYS = [3, 7, 14] as const;
export type ReviewDay = (typeof REVIEW_DAYS)[number];

export type ReviewQ = RetrievalQ & { constructId: ConstructId; lessonId: string };

const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewSchedule(startIso: string | null | undefined): { day: ReviewDay; due: Date | null }[] {
  const start = startIso ? Date.parse(startIso) : NaN;
  return REVIEW_DAYS.map((day) => ({ day, due: Number.isFinite(start) ? new Date(start + day * DAY_MS) : null }));
}

const REVIEW_NAMES: Record<ReviewDay, string> = {
  3: "First recall",
  7: "Mix it up",
  14: "Lock it in",
};

export type SpacedReviewNext = {
  day: ReviewDay | null;
  due: Date | null;
  status: "needs-baseline" | "upcoming" | "due" | "finished";
  href: string;
  title: string;
};

/** The next Day 3, 7 or 14 review, skipping days already marked done on this device. */
export function nextSpacedReview(
  startIso: string | null | undefined,
  done: Readonly<Record<string, string>> = {},
  now = new Date(),
): SpacedReviewNext {
  if (!startIso || !Number.isFinite(Date.parse(startIso))) {
    return {
      day: null,
      due: null,
      status: "needs-baseline",
      href: "/learn/assessment/pre",
      title: "Spaced review",
    };
  }
  const schedule = reviewSchedule(startIso);
  const open = schedule.find(({ day }) => !done[String(day)]);
  if (!open) {
    return {
      day: 14,
      due: schedule[2]?.due ?? null,
      status: "finished",
      href: "/learn/review",
      title: "Spaced review complete",
    };
  }
  const due = open.due;
  const isDue = due ? due.getTime() <= now.getTime() : false;
  return {
    day: open.day,
    due,
    status: isDue ? "due" : "upcoming",
    href: `/learn/review?day=${open.day}`,
    title: `Day ${open.day} · ${REVIEW_NAMES[open.day]}`,
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Every skill-session retrieval question for a programme, tagged with its face and lesson. */
export function reviewPool(p: ProgrammeId): ReviewQ[] {
  const out: ReviewQ[] = [];
  for (const c of constructs) {
    skillsForProgramme(p, c.id).forEach((s, i) => {
      const lessonId = `${courseId(p, c.id)}-skill-${i + 1}`;
      for (const q of skillArc(p, c.id, s).check) out.push({ ...q, constructId: c.id, lessonId });
    });
  }
  return out;
}

/**
 * Questions for one review: missed questions first, then an interleaved,
 * day-seeded pick that rotates through the six faces.
 */
export function buildReview(
  p: ProgrammeId,
  day: number,
  missed: string[] = [],
  n = p === "kids" ? 4 : 6,
): ReviewQ[] {
  const pool = reviewPool(p);
  const picked: ReviewQ[] = [];
  const seen = new Set<string>();
  for (const m of missed) {
    const q = pool.find((x) => x.q === m);
    if (q && !seen.has(q.q) && picked.length < Math.ceil(n / 2)) {
      picked.push(q);
      seen.add(q.q);
    }
  }
  const byFace = constructs.map((c) =>
    pool
      .filter((q) => q.constructId === c.id && !seen.has(q.q))
      .sort((a, b) => hash(`${day}:${a.q}`) - hash(`${day}:${b.q}`)),
  );
  const startFace = day % constructs.length;
  let round = 0;
  while (picked.length < n && round < 20) {
    for (let k = 0; k < constructs.length && picked.length < n; k++) {
      const list = byFace[(startFace + k) % constructs.length];
      const q = list[round];
      if (q && !seen.has(q.q)) {
        picked.push(q);
        seen.add(q.q);
      }
    }
    round++;
  }
  return picked;
}

/** Capstone warm-up: one overview question per face. */
export function capstoneCheck(p: ProgrammeId): ReviewQ[] {
  return constructs.map((c) => {
    const q = overviewArc(p, c.id).check[0];
    return { ...q, constructId: c.id, lessonId: `${courseId(p, c.id)}-overview` };
  });
}
