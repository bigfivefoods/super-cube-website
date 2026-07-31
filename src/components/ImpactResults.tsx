import {
  interventionGainScaleMax,
  interventionGains,
  overallInterventionGain,
} from "@/lib/impact";

export function ImpactResults({
  eyebrow = "Intervention outcomes",
  title = "Measurable growth across every face.",
  description = "Average improvement following Super-Cube® development interventions—pre- to post-assessment gains by construct.",
  light = false,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Dark background variant */
  light?: boolean;
}) {
  const max = interventionGainScaleMax;

  return (
    <section
      className={
        light
          ? "section-pad border-y border-white/10 bg-ink text-cream"
          : "section-pad border-b border-black/[0.06] bg-[#fafafa]"
      }
    >
      <div className="container-site">
        <div className="max-w-2xl">
          <p
            className={`text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${
              light ? "text-cream/50" : "text-muted"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
              light ? "text-cream" : "text-ink"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-3 text-sm leading-relaxed sm:text-base ${
              light ? "text-cream/60" : "text-slate"
            }`}
          >
            {description}
          </p>
        </div>

        {/* Overall hero number */}
        <div
          className={`mt-8 flex flex-col items-start gap-1 rounded-2xl border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 ${
            light
              ? "border-white/10 bg-white/5"
              : "border-black/[0.07] bg-white"
          }`}
        >
          <div>
            <p
              className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
                light ? "text-cream/50" : "text-muted"
              }`}
            >
              Overall improvement
            </p>
            <p
              className={`mt-1 text-sm ${light ? "text-cream/70" : "text-slate"}`}
            >
              Across all six Super-Cube® constructs
            </p>
          </div>
          <p
            className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${
              light ? "text-gold-bright" : "text-ink"
            }`}
          >
            +{overallInterventionGain}%
          </p>
        </div>

        {/* Per-construct bars */}
        <div
          className={`mt-6 space-y-3 rounded-2xl border p-5 sm:p-6 ${
            light
              ? "border-white/10 bg-white/5"
              : "border-black/[0.07] bg-white"
          }`}
        >
          {interventionGains.map((g) => {
            const width = Math.min(100, (g.gainPct / max) * 100);
            return (
              <div
                key={g.constructId}
                className="grid grid-cols-[5.5rem_1fr_3.75rem] items-center gap-3 sm:grid-cols-[7rem_1fr_4.5rem] sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: g.color }}
                  />
                  <span
                    className={`truncate text-sm font-semibold ${
                      light ? "text-cream" : "text-ink"
                    }`}
                  >
                    {g.label}
                  </span>
                </div>
                <div
                  className={`h-2.5 overflow-hidden rounded-full ${
                    light ? "bg-white/10" : "bg-black/[0.06]"
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${width}%`,
                      background: g.color,
                    }}
                  />
                </div>
                <p
                  className={`text-right text-sm font-semibold tabular-nums ${
                    light ? "text-cream" : "text-ink"
                  }`}
                >
                  +{g.gainPct}%
                </p>
              </div>
            );
          })}
        </div>

        <p
          className={`mt-5 max-w-2xl text-xs leading-relaxed ${
            light ? "text-cream/45" : "text-muted"
          }`}
        >
          Gains reflect average percentage improvement following Super-Cube®
          development interventions (pre- to post-assessment). Highest gains:
          Principles (+45.1%) and Emotional (+39.5%).
        </p>
      </div>
    </section>
  );
}
