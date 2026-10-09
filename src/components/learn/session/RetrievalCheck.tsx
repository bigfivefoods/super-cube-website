"use client";

import { useId, useState } from "react";
import { track } from "@/lib/analytics";
import { faceInkStyle } from "@/lib/contrast";
import type { RetrievalQ } from "@/lib/lms/sessions";
import { setCheckAnswers, useCheckRound } from "./check-store";
import { saveMisses } from "./useLocalField";

/**
 * Retrieval practice with immediate, explanatory feedback. Learners can change
 * their answer; the first choice is what counts towards the score and the
 * spaced-review queue (misses come back in the Day 3/7/21 reviews).
 */
type Props = {
  questions: RetrievalQ[];
  color: string;
  /** Lesson id (or review id) for the spaced-review queue; omit to skip saving */
  storageKey?: string;
  kids?: boolean;
  context?: Record<string, string>;
  /** Called once every question has a first answer */
  onComplete?: (firstAnswers: number[], correct: number) => void;
  /** Hide the closing summary line (the caller shows its own) */
  hideSummary?: boolean;
};

export function RetrievalCheck(props: Props) {
  // A retry (from the mastery panel) bumps the round and remounts the check empty.
  const round = useCheckRound(props.storageKey);
  return <RetrievalCheckRound key={round} round={round} {...props} />;
}

function RetrievalCheckRound({
  questions,
  color,
  storageKey,
  kids = false,
  context,
  onComplete,
  hideSummary = false,
  round,
}: Props & { round: number }) {
  const uid = useId();
  const [chosen, setChosen] = useState<(number | null)[]>(() => questions.map(() => null));
  const [first, setFirst] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = first.filter((f) => f !== null).length;
  const correctFirst = first.filter((f, i) => f === questions[i].answer).length;
  const allDone = answered === questions.length;

  function choose(qi: number, oi: number) {
    const nextChosen = chosen.slice();
    nextChosen[qi] = oi;
    setChosen(nextChosen);
    if (first[qi] === null) {
      const nextFirst = first.slice();
      nextFirst[qi] = oi;
      setFirst(nextFirst);
      if (storageKey) setCheckAnswers(storageKey, nextFirst);
      if (nextFirst.every((f) => f !== null)) {
        const missed = questions.filter((q, i) => nextFirst[i] !== q.answer).map((q) => q.q);
        if (storageKey && round === 0) saveMisses(storageKey, missed);
        onComplete?.(nextFirst as number[], questions.length - missed.length);
        track("retrieval_check", {
          ...context,
          correct: String(questions.length - missed.length),
          total: String(questions.length),
        });
      }
    }
  }

  return (
    <div className="space-y-4" style={faceInkStyle(color)} data-testid="retrieval-check" data-round={round}>
      {round > 0 && (
        <p className="rounded-xl border border-line bg-elevated px-3 py-2 text-[0.8125rem] text-ink" role="status">
          {kids ? "Second go! Take your time." : "Second go. Take your time; the explanations you just read are the key."}
        </p>
      )}
      {questions.map((q, qi) => {
        const name = `${uid}-q${qi}`;
        const pickIdx = chosen[qi];
        const isRight = pickIdx === q.answer;
        return (
          <fieldset key={qi} className="rounded-xl border border-line p-3 sm:p-4">
            <legend className="px-1 text-[0.8125rem] font-semibold text-ink">
              <span className="face-ink mr-1 tabular-nums">{qi + 1}.</span>
              {q.q}
            </legend>
            <div className="mt-1 grid gap-1.5" role="radiogroup" aria-label={q.q}>
              {q.options.map((o, oi) => {
                const selected = pickIdx === oi;
                const showRight = pickIdx !== null && oi === q.answer;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition ${
                      kids ? "text-[0.9375rem]" : "text-[0.8125rem]"
                    } ${
                      showRight
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                        : selected
                          ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40"
                          : "border-line hover:border-ink/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={name}
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ accentColor: color }}
                      checked={selected}
                      onChange={() => choose(qi, oi)}
                    />
                    <span className="leading-snug text-ink">
                      {o}
                      {showRight && <span className="ml-1.5 font-semibold text-emerald-800 dark:text-emerald-300">✓ Correct answer</span>}
                      {selected && !showRight && <span className="ml-1.5 font-semibold text-amber-900 dark:text-amber-300">✗ Not this one</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 min-h-[1.25rem] text-[0.8125rem] leading-snug text-slate" aria-live="polite">
              {pickIdx !== null && (
                <>
                  <strong className="font-semibold text-ink">{isRight ? "Yes. " : "Not quite. "}</strong>
                  {q.why}
                </>
              )}
            </p>
          </fieldset>
        );
      })}
      {allDone && !hideSummary && (
        <p className="rounded-xl border border-line bg-elevated px-3 py-2.5 text-[0.8125rem] text-ink" role="status">
          <strong className="font-semibold">
            {correctFirst} of {questions.length} right first time.
          </strong>{" "}
          {correctFirst === questions.length
            ? kids
              ? "Brilliant remembering!"
              : "Strong recall. These ideas will come back once more in your spaced review."
            : kids
              ? "Great trying! We'll practise these again soon."
              : "Good effort. The ones you missed will come back in your Day 3, 7 and 21 reviews, which is exactly how memory gets stronger."}
        </p>
      )}
    </div>
  );
}
