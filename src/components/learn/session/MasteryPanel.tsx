"use client";

import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

import type { RetrievalQ } from "@/lib/lms/sessions";
import { retryCopy, type MasteryVerdict } from "@/lib/lms/mastery";
import type { ProgrammeId } from "@/lib/programmes";

export type MasteryPrompt =
  | { kind: "answer-first"; missing: number }
  | { kind: "retry"; verdict: MasteryVerdict; missed: RetrievalQ[] };

/**
 * Shown when "Mark complete" is pressed before the knowledge check is
 * mastered: a kind nudge to answer, or the explanations plus one retry.
 */
export function MasteryPanel({
  prompt,
  programmeId,
  color,
  checkAnchor,
  onRetry,
}: {
  prompt: MasteryPrompt;
  programmeId: ProgrammeId;
  color: string;
  checkAnchor: string;
  onRetry: () => void;
}) {
  const { t } = useLmsT();

  const kids = programmeId === "kids";
  if (prompt.kind === "answer-first") {
    return (
      <div className="mt-5 rounded-2xl border border-line bg-elevated p-4 sm:p-5" role="status" data-testid="mastery-answer-first" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
        <p className="text-[0.9375rem] font-semibold text-ink">
          {kids ? t("One more thing before you finish!") : t("Almost done: the quick check comes first")}
        </p>
        <p className="learn-body mt-1">
          {kids
            ? `Answer the ${prompt.missing === 1 ? "last question" : `${prompt.missing} quiz questions`} first. It’s fine to get them wrong!`
            : `Answer the ${prompt.missing === 1 ? "last question" : `${prompt.missing} remaining questions`} in the check. It takes a minute and is what makes the session stick.`}
        </p>
        <a href={`#${checkAnchor}`} className="learn-btn learn-btn-primary mt-3 text-white" style={{ background: color }}>
          {kids ? t("Go to the quiz") : t("Go to the check")}
        </a>
      </div>
    );
  }
  const copy = retryCopy(prompt.verdict, programmeId);
  return (
    <section
      className="mt-5 rounded-2xl border border-line bg-elevated p-4 sm:p-5 sc-rise"
      aria-labelledby="mastery-retry-h"
      data-testid="mastery-retry"
      style={{ boxShadow: `inset 3px 0 0 ${color}` }}
    >
      <p className="learn-eyebrow" style={{ color }}>
        {kids ? t("Practice makes it stick") : t("Mastery check")}
      </p>
      <h2 id="mastery-retry-h" className="mt-1 text-[1.0625rem] font-semibold tracking-tight text-ink">
        {copy.title}
      </h2>
      <p className="learn-body mt-1">{copy.body}</p>
      <ul className="mt-3 space-y-2.5">
        {prompt.missed.map((q) => (
          <li key={q.q} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-[0.8125rem] font-semibold text-ink">{q.q}</p>
            <p className="mt-1 text-[0.8125rem] text-ink">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">{t("Answer:")}</span>
              {q.options[q.answer]}
            </p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-slate">
              <span className="font-semibold text-ink">{t("Why:")}</span>
              {q.why}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onRetry} className="learn-btn learn-btn-primary text-white" style={{ background: color }}>
          {copy.button}
        </button>
        <span className="learn-meta">{kids ? t("Your first answers are still saved for your review.") : t("Missed questions also come back in your Day 3 review.")}</span>
      </div>
    </section>
  );
}
