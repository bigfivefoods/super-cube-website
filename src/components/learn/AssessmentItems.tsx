"use client";

import type { AssessmentOption } from "@/lib/lms/curriculum";
import { LIKERT_LABELS } from "@/lib/lms/curriculum";

/**
 * One rating-scale statement (v1 agreement or v2 frequency labels).
 * Keys 1–5 answer the statement that has focus.
 */
export function LikertQuestion({
  id,
  prompt,
  value,
  onChange,
  labels = LIKERT_LABELS,
  compactLabels = false,
}: {
  id: string;
  prompt: string;
  value: number | undefined;
  onChange: (v: number) => void;
  labels?: readonly string[];
  /** v1 shows numbers with end labels; v2 shows every label */
  compactLabels?: boolean;
}) {
  const showWords = !compactLabels && labels !== LIKERT_LABELS;
  return (
    <fieldset
      className="border-b border-line pb-5 last:border-0 last:pb-0"
      aria-describedby={`${id}-scale`}
      data-item-type="likert"
      onKeyDown={(e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const n = Number(e.key);
        if (!Number.isInteger(n) || n < 1 || n > 5) return;
        e.preventDefault();
        onChange(n);
        e.currentTarget.querySelector<HTMLButtonElement>(`button[data-value="${n}"]`)?.focus();
      }}
    >
      <legend className="text-[0.8125rem] font-medium leading-relaxed text-ink sm:text-[0.875rem]">{prompt}</legend>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex min-h-11 flex-col items-center justify-center rounded-lg border px-0.5 py-2 text-center font-semibold transition ${
                selected
                  ? "border-ink bg-void text-void-fg"
                  : "border-line-strong bg-surface text-slate hover:border-ink/40"
              }`}
              title={labels[v - 1]}
              aria-label={`${v}, ${labels[v - 1]}`}
              aria-pressed={selected}
              data-value={v}
            >
              <span className="text-[0.8125rem]">{v}</span>
              {showWords && (
                <span className="mt-0.5 hidden text-[0.625rem] font-medium leading-tight sm:block">{labels[v - 1]}</span>
              )}
            </button>
          );
        })}
      </div>
      <div id={`${id}-scale`} className="learn-meta mt-1.5 flex justify-between">
        <span>
          {labels[0]}
          <span className="sr-only"> is 1, </span>
        </span>
        <span>
          <span className="sr-only">and </span>
          {labels[4]}
          <span className="sr-only"> is 5. Keys 1 to 5 answer.</span>
        </span>
      </div>
    </fieldset>
  );
}

/** One situational judgement item: a scenario and one chosen response. */
export function SjtQuestion({
  id,
  scenario,
  options,
  value,
  onChange,
  instruction,
  reveal = false,
  color = "#0a0a0a",
}: {
  id: string;
  scenario: string;
  options: AssessmentOption[];
  value: number | undefined;
  onChange: (v: number) => void;
  instruction: string;
  /** Show the key and feedback (results/preview only, never while answering live) */
  reveal?: boolean;
  color?: string;
}) {
  const best = Math.max(...options.map((o) => o.key));
  return (
    <fieldset
      className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4"
      data-item-type="sjt"
      onKeyDown={(e) => {
        if (reveal || e.altKey || e.ctrlKey || e.metaKey) return;
        const n = Number(e.key);
        if (!Number.isInteger(n) || n < 1 || n > options.length) return;
        e.preventDefault();
        onChange(n);
      }}
    >
      <legend className="sr-only">Situation</legend>
      <p className="learn-eyebrow" style={{ color }}>
        Situation
      </p>
      <p className="mt-1 text-[0.875rem] font-medium leading-relaxed text-ink">{scenario}</p>
      <p className="learn-meta mt-2" id={`${id}-instr`}>
        {instruction}
      </p>
      <div className="mt-3 space-y-2" role="radiogroup" aria-describedby={`${id}-instr`}>
        {options.map((opt, i) => {
          const selected = value === opt.value;
          const letter = String.fromCharCode(65 + i);
          const isBest = reveal && opt.key === best;
          return (
            <div key={opt.value}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={reveal}
                onClick={() => onChange(opt.value)}
                className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[0.8125rem] leading-snug transition disabled:cursor-default ${
                  selected
                    ? "border-ink bg-elevated text-ink shadow-[inset_3px_0_0_currentColor]"
                    : "border-line-strong bg-elevated text-slate hover:border-ink/40"
                }`}
                data-value={opt.value}
              >
                <span
                  aria-hidden
                  className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-bold ${
                    selected ? "border-ink bg-void text-void-fg" : "border-line-strong text-muted"
                  }`}
                >
                  {letter}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">Option {letter}: </span>
                  {opt.text}
                  {reveal && (
                    <span className="mt-1 block text-[0.75rem] text-muted">
                      <strong className={isBest ? "text-emerald-800 dark:text-emerald-300" : "text-ink"}>
                        {isBest ? "Most effective" : `Effectiveness ${opt.key} of 4`}
                      </strong>
                      {opt.why ? ` · ${opt.why}` : ""}
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
