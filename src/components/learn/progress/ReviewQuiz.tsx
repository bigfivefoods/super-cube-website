"use client";

import { useEffect, useMemo, useState } from "react";
import { RetrievalCheck } from "@/components/learn/session/RetrievalCheck";
import { track } from "@/lib/analytics";
import { constructs } from "@/lib/content";
import type { Lesson } from "@/lib/lms/curriculum";
import type { SessionReviewItem } from "@/lib/lms/progression";
import { saveSessionReview } from "@/lib/lms/store";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A Day 3, 7 or 21 review of one session, using that session's own questions
 * (in a fresh order). Loaded on demand so the Today page stays light.
 */
export default function ReviewQuiz({ item, kids, onDone }: { item: SessionReviewItem; kids: boolean; onDone?: () => void }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);
  useEffect(() => {
    let live = true;
    void import("@/lib/lms/curriculum").then((m) => {
      const courseId = item.lessonId.replace(/-(overview|skill-\d+|practice|quiz)$/, "");
      const found = m.getLesson(courseId, item.lessonId);
      if (live) setLesson(found?.lesson ?? null);
    });
    return () => {
      live = false;
    };
  }, [item.lessonId]);

  const questions = useMemo(() => {
    const qs = lesson?.arc?.check ?? lesson?.faceCheck ?? [];
    const seed = `${item.lessonId}:${item.days[0]}`;
    return [...qs].sort((a, b) => hash(`${seed}:${a.q}`) - hash(`${seed}:${b.q}`));
  }, [lesson, item.lessonId, item.days]);
  const color = constructs.find((c) => c.id === item.constructId)?.color ?? "#26408C";

  if (!lesson) {
    return <div className="h-40 animate-pulse rounded-xl bg-black/[0.04] motion-reduce:animate-none" aria-busy="true" aria-label="Loading review" />;
  }
  return (
    <div data-testid="review-quiz">
      <RetrievalCheck
        questions={questions}
        color={color}
        kids={kids}
        hideSummary
        context={{ lessonId: item.lessonId, surface: "session_review", day: String(item.days[0]) }}
        onComplete={(_, correct) => {
          setResult({ correct, total: questions.length });
          saveSessionReview(item.lessonId, item.days, correct, questions.length);
          track("session_review_complete", { lessonId: item.lessonId, day: String(item.days[0]), correct: String(correct) });
        }}
      />
      {result && (
        <div className="sc-rise mt-3 rounded-xl border border-line bg-surface p-3" role="status" data-testid="review-result">
          <p className="text-[0.9375rem] font-semibold text-ink">
            {result.correct} of {result.total} remembered · +{result.correct * 2} points
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">
            {result.correct === result.total
              ? kids
                ? "You remembered everything! Super!"
                : "Everything came back. That memory is getting stronger with each spaced review."
              : kids
                ? "Great remembering! Read the notes above, they help it stick."
                : "Read the explanations above once more. Pulling an idea back after a gap, even imperfectly, is what makes it last."}
          </p>
          {onDone && (
            <button type="button" className="learn-btn learn-btn-secondary mt-2" onClick={onDone}>
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
