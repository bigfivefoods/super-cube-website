import type { BadgeView } from "@/lib/lms/progression";

/** Earned badges in colour, the rest as gentle outlines with how to earn them. */
export function BadgeWall({ badges, title = "Badges" }: { badges: BadgeView[]; title?: string }) {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="badges-h" data-testid="badge-wall">
      <div className="flex items-baseline justify-between">
        <h2 id="badges-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
          {title}
        </h2>
        <p className="text-[0.75rem] font-semibold tabular-nums text-ink">
          {earned} of {badges.length}
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex items-start gap-2.5 rounded-xl border p-2.5 ${b.earned ? "border-line bg-surface" : "border-dashed border-line"}`}
            data-earned={b.earned ? "true" : "false"}
          >
            <span
              aria-hidden
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-bold ${
                b.earned ? (b.kind === "progress" ? "bg-[#0f6f71] text-white" : "bg-void text-void-fg") : "border border-line text-slate"
              }`}
            >
              {b.mark}
            </span>
            <span className="min-w-0">
              <span className={`block text-[0.8125rem] font-semibold leading-tight ${b.earned ? "text-ink" : "text-slate"}`}>
                {b.name}
                {b.kind === "progress" && b.earned && <span className="sr-only"> (earned)</span>}
              </span>
              <span className="mt-0.5 block text-[0.6875rem] leading-snug text-slate">{b.criteria}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
