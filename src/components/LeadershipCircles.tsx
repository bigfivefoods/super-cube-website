/**
 * Expanding leadership circles — soft pastel radial diagram.
 * You at the centre → family → friends → colleagues → society.
 */

const RINGS = [
  {
    id: "you",
    label: "You",
    short: "Centre",
    description:
      "You stand at the centre of the cube. Personal leadership—agency, character, and deliberate practice—is the non-negotiable starting point.",
    r: 22,
    fill: "#FDF2F8",
    stroke: "#F9A8D4",
    accent: "#BE185D",
    soft: "#FDF2F8",
  },
  {
    id: "family",
    label: "Family",
    short: "Closest circle",
    description:
      "Leadership first shows up at home: trust, care, boundaries, and example. Those who know you best feel your six faces daily.",
    r: 38,
    fill: "#FFF1F2",
    stroke: "#FECDD3",
    accent: "#E11D48",
    soft: "#FFF1F2",
  },
  {
    id: "friends",
    label: "Friends",
    short: "Chosen bonds",
    description:
      "Peers and friends are where influence, loyalty, and courage are practised—without a job title. Your leadership circle expands through relationship.",
    r: 52,
    fill: "#FAF5FF",
    stroke: "#E9D5FF",
    accent: "#9333EA",
    soft: "#FAF5FF",
  },
  {
    id: "colleagues",
    label: "Colleagues",
    short: "Work & teams",
    description:
      "Teams, organisations, and professional networks: decisions, principles, energy, and purpose scale into shared performance.",
    r: 66,
    fill: "#FFFBEB",
    stroke: "#FDE68A",
    accent: "#D97706",
    soft: "#FFFBEB",
  },
  {
    id: "society",
    label: "Society",
    short: "Wider world",
    description:
      "Community, industry, and the common good. Leadership that began with you becomes culture—networks, institutions, and impact beyond the self.",
    r: 80,
    fill: "#F0F9FF",
    stroke: "#BAE6FD",
    accent: "#0284C7",
    soft: "#F0F9FF",
  },
] as const;

const ringsOuterFirst = [...RINGS].reverse();

/** Angle for each outer ring label (degrees; 0 = right, -90 = top) */
const LABEL_POS: Record<string, number> = {
  family: -40,
  friends: 20,
  colleagues: 85,
  society: 150,
};

export function LeadershipCircles({
  className = "",
  showLegend = true,
}: {
  className?: string;
  showLegend?: boolean;
}) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size / 2 - 36) / 80;

  return (
    <div className={`mx-auto w-full max-w-5xl ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-gradient-to-b from-white via-[#fafbff] to-[#f8f5ff] shadow-[0_12px_32px_-20px_rgba(15,23,42,0.16)]">
        <div
          className={`grid items-center gap-0 ${
            showLegend ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : ""
          }`}
        >
        <div
          className="relative px-3 pb-3 pt-4 sm:px-5 sm:pb-5 sm:pt-5"
          role="img"
          aria-label="Soft pastel diagram of leadership circles expanding from you at the centre to family, friends, colleagues, and society"
        >
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto h-auto w-full max-w-[220px] sm:max-w-[250px]"
            aria-hidden
          >
            <defs>
              <filter
                id="soft-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="8"
                  floodColor="#94a3b8"
                  floodOpacity="0.16"
                />
              </filter>
              <filter
                id="chip-shadow"
                x="-25%"
                y="-40%"
                width="150%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#0f172a"
                  floodOpacity="0.07"
                />
              </filter>
              <radialGradient id="disc-bg" cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.55" />
              </radialGradient>
            </defs>

            <circle
              cx={cx}
              cy={cy}
              r={RINGS[RINGS.length - 1].r * scale + 18}
              fill="url(#disc-bg)"
              filter="url(#soft-glow)"
            />

            {ringsOuterFirst.map((ring) => (
              <circle
                key={ring.id}
                cx={cx}
                cy={cy}
                r={ring.r * scale}
                fill={ring.fill}
                stroke={ring.stroke}
                strokeWidth={ring.id === "you" ? 0 : 1.75}
              />
            ))}

            <circle
              cx={cx}
              cy={cy}
              r={RINGS[RINGS.length - 1].r * scale + 8}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="3 7"
              opacity={0.65}
            />

            {/* Centre */}
            <circle
              cx={cx}
              cy={cy}
              r={RINGS[0].r * scale - 1}
              fill="#FDF2F8"
              stroke="#F9A8D4"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#9D174D"
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              You
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#DB2777"
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
              }}
            >
              CENTRE
            </text>

            {/* Soft chips on ring bands */}
            {RINGS.map((ring, index) => {
              if (ring.id === "you") return null;
              const prevR = RINGS[index - 1].r * scale;
              const thisR = ring.r * scale;
              const midR = (prevR + thisR) / 2;
              const deg = LABEL_POS[ring.id] ?? 0;
              const rad = (deg * Math.PI) / 180;
              const lx = cx + Math.cos(rad) * midR;
              const ly = cy + Math.sin(rad) * midR;
              const chipW = ring.label.length > 8 ? 100 : 86;
              const chipH = 30;
              const num = index + 1;

              return (
                <g key={`chip-${ring.id}`} filter="url(#chip-shadow)">
                  <rect
                    x={lx - chipW / 2}
                    y={ly - chipH / 2}
                    width={chipW}
                    height={chipH}
                    rx={chipH / 2}
                    fill="rgba(255,255,255,0.94)"
                    stroke={ring.stroke}
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={lx - chipW / 2 + 15}
                    cy={ly}
                    r={9}
                    fill={ring.fill}
                    stroke={ring.stroke}
                    strokeWidth={1.25}
                  />
                  <text
                    x={lx - chipW / 2 + 15}
                    y={ly + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={ring.accent}
                    style={{ fontSize: 10, fontWeight: 700 }}
                  >
                    {num}
                  </text>
                  <text
                    x={lx - chipW / 2 + 15 + (chipW - 15) / 2}
                    y={ly + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#0f172a"
                    style={{ fontSize: 12.5, fontWeight: 700 }}
                  >
                    {ring.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Pastel path ribbon */}
          <div className="mx-auto mt-2 flex max-w-[16rem] flex-wrap items-center justify-center gap-1 px-1">
            {RINGS.map((ring, i) => (
              <div key={ring.id} className="flex items-center gap-1">
                {i > 0 && (
                  <span
                    className="select-none text-[0.65rem] text-slate-300"
                    aria-hidden
                  >
                    →
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold sm:text-[0.7rem]"
                  style={{
                    background: ring.soft,
                    borderColor: ring.stroke,
                    color: ring.accent,
                  }}
                >
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[0.55rem] font-bold text-white"
                    style={{ background: ring.accent }}
                  >
                    {i + 1}
                  </span>
                  {ring.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showLegend && (
          <div className="border-t border-black/[0.04] bg-white/70 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-5 lg:border-l lg:border-t-0">
            <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:text-left">
              How leadership radiates
            </p>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {RINGS.map((ring, i) => (
                <li
                  key={ring.id}
                  className="flex gap-2.5 rounded-xl border p-2.5 sm:p-3"
                  style={{
                    background: ring.soft,
                    borderColor: ring.stroke,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                    style={{ background: ring.accent }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-xs font-bold tracking-tight text-slate-800 sm:text-sm">
                        {ring.label}
                      </h3>
                      <p
                        className="text-[0.55rem] font-semibold uppercase tracking-wider"
                        style={{ color: ring.accent }}
                      >
                        {ring.short}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[0.7rem] leading-snug text-slate-600 sm:text-[0.75rem]">
                      {ring.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
