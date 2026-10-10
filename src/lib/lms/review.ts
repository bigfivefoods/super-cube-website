/**
 * Spaced review across the 21-day journey (Day 3, 7 and 21 after the
 * baseline). Each review mixes retrieval questions across faces (interleaving)
 * and puts the questions a learner missed first.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { skillsForProgramme, type ProgrammeId } from "@/lib/programmes";
import { courseId } from "@/lib/programmes";
import { skillArc, overviewArc, type RetrievalQ } from "@/lib/lms/sessions";

export {
  REVIEW_DAYS,
  isReviewDone,
  nextSpacedReview,
  reviewSchedule,
  type ReviewDay,
  type SpacedReviewNext,
} from "@/lib/lms/review-schedule";

export type ReviewQ = RetrievalQ & { constructId: ConstructId; lessonId: string };

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
