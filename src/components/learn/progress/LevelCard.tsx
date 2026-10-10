import type { ProgressionView } from "@/lib/lms/progression";
import { LEVELS } from "@/lib/lms/progression";

/** Level, points and the next level. */
export function LevelCard({ view }: { view: ProgressionView }) {
  const { level, next, pct, toNext } = view.level;
  return (
    <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="level-h" data-testid="level-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="level-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
          Level {level.n} of {LEVELS.length}
        </h2>
        <p className="text-[0.8125rem] font-semibold tabular-nums text-ink">{view.total} points</p>
      </div>
      <p className="mt-1 text-[1.25rem] font-semibold tracking-tight text-ink">{level.name}</p>
      <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">{level.line}</p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10"
        role="progressbar"
        aria-label={next ? `Progress to ${next.name}` : "Top level reached"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="sc-ring-arc h-full rounded-full bg-ink" style={{ width: `${Math.max(pct, 3)}%`, transition: "width 700ms ease" }} />
      </div>
      <p className="mt-1.5 text-[0.75rem] text-slate">
        {next ? `${toNext} points to ${next.name}` : "You’ve reached the top level. Keep the whole cube lit."}
      </p>
      <ol className="mt-3 flex flex-wrap gap-1" aria-label="All levels">
        {LEVELS.map((l) => (
          <li
            key={l.n}
            className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
              l.n <= level.n ? "bg-void text-void-fg" : "border border-line text-slate"
            }`}
          >
            {l.name}
          </li>
        ))}
      </ol>
    </section>
  );
}
