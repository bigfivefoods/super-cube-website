/**
 * When the Day 3, 7 and 21 spaced reviews fall (from the baseline date).
 * No question content here, so the Today page stays light.
 */
export const REVIEW_DAYS = [3, 7, 21] as const;
export type ReviewDay = (typeof REVIEW_DAYS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewSchedule(startIso: string | null | undefined): { day: ReviewDay; due: Date | null }[] {
  const start = startIso ? Date.parse(startIso) : NaN;
  return REVIEW_DAYS.map((day) => ({ day, due: Number.isFinite(start) ? new Date(start + day * DAY_MS) : null }));
}

const REVIEW_NAMES: Record<ReviewDay, string> = {
  3: "First recall",
  7: "Mix it up",
  21: "Lock it in",
};

export type SpacedReviewNext = {
  day: ReviewDay | null;
  due: Date | null;
  status: "needs-baseline" | "upcoming" | "due" | "finished";
  href: string;
  title: string;
};

/**
 * True when a review day is done. Reviews used to fall on Day 14; a Day 14
 * review already done on this device counts for the new Day 21 slot.
 */
export function isReviewDone(done: Readonly<Record<string, string>>, day: ReviewDay): boolean {
  return Boolean(done[String(day)] || (day === 21 && done["14"]));
}

/** The next Day 3, 7 or 21 review, skipping days already marked done on this device. */
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
  const open = schedule.find(({ day }) => !isReviewDone(done, day));
  if (!open) {
    return {
      day: 21,
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
