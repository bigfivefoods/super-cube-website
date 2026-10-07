"use client";

import { useId, useState } from "react";
import type { ConstructId } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import type { ConstructScore } from "@/lib/lms/scoring";

/**
 * Radar axis order: Choices at top, Principles opposite (bottom),
 * remaining faces around the sides (matches Super-Cube® placement).
 * Clockwise from top: Choices → Mental → Emotional → Principles → Physical → Spiritual
 */
export const RADAR_ORDER: ConstructId[] = [
  "choices",
  "mental",
  "emotional",
  "principles",
  "physical",
  "spiritual",
];

export function orderScoresForRadar(scores: ConstructScore[]): ConstructScore[] {
  return RADAR_ORDER.map(
    (id) =>
      scores.find((s) => s.constructId === id) ?? {
        constructId: id,
        name: id,
        color: "#999",
        rawMean: 0,
        score: 0,
        itemCount: 0,
      },
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (n: number) => (Number.isInteger(r1(n)) ? String(r1(n)) : r1(n).toFixed(1));
export function formatDelta(d: number): string {
  const v = r1(d);
  if (v > 0) return `+${fmt(v)}`;
  if (v < 0) return `−${fmt(Math.abs(v))}`;
  return "±0";
}

/**
 * Premium six-face radar (vector SVG, crisp on retina and in print).
 *  - One series: face-coloured wedges with filled markers.
 *  - Two series: BEFORE as a dashed neutral outline with hollow markers, AFTER
 *    in face colours with filled markers. Meaning never relies on colour alone:
 *    line style, marker shape and the per-face delta text all carry it.
 *  - Draw-in animation that is switched off for prefers-reduced-motion and print.
 *  - role="img" with a full text description, plus an optional data table.
 */
export function RadarChart({
  scores,
  compareScores,
  size = 360,
  preLabel = "Before",
  postLabel = "After",
  table = "toggle",
  deltas = true,
  animate = true,
  className = "",
}: {
  /** Primary series: BEFORE when comparing, or the only series */
  scores: ConstructScore[];
  /** Optional AFTER series (face colours) */
  compareScores?: ConstructScore[] | null;
  /** viewBox size (the chart scales to its container) */
  size?: number;
  preLabel?: string;
  postLabel?: string;
  /** Data table alternative: shown, behind a toggle, or omitted (when the page already has one) */
  table?: "visible" | "toggle" | "none";
  /** Per-face delta chips under the chart (two series only) */
  deltas?: boolean;
  animate?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [showTable, setShowTable] = useState(table === "visible");
  const pre = orderScoresForRadar(scores);
  const post = compareScores ? orderScoresForRadar(compareScores) : null;
  const hasCompare = Boolean(post);
  const n = 6;
  // Room around the plot for labels
  const pad = size * 0.2;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = size * 0.42;

  const pt = (i: number, value: number, radius = R) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  const prePts = pre.map((s, i) => pt(i, s.score));
  const postPts = post?.map((s, i) => pt(i, s.score));
  const main = post ?? pre;
  const mainPts = postPts ?? prePts;

  const describe = hasCompare
    ? `Six-face growth radar. ${pre
        .map((s, i) => `${s.name}: ${preLabel.toLowerCase()} ${fmt(s.score)}, ${postLabel.toLowerCase()} ${fmt(post![i].score)} (${formatDelta(post![i].score - s.score)})`)
        .join("; ")}.`
    : `Six-face profile radar. ${pre.map((s) => `${s.name} ${fmt(s.score)}`).join("; ")}.`;

  const rings = [20, 40, 60, 80, 100];
  const anim = animate ? "sc-radar-anim" : "";

  return (
    <figure className={`sc-radar ${className}`} data-testid="radar">
      <svg
        viewBox={`0 0 ${vb} ${vb}`}
        className="mx-auto block h-auto w-full max-w-[420px]"
        role="img"
        aria-labelledby={`${uid}-t ${uid}-d`}
        shapeRendering="geometricPrecision"
      >
        <title id={`${uid}-t`}>{hasCompare ? "Growth radar: before and after" : "Six-face profile radar"}</title>
        <desc id={`${uid}-d`}>{describe}</desc>
        <defs>
          <radialGradient id={`${uid}-bg`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.035" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.075" />
          </radialGradient>
          <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.2" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Plot background and rings */}
        <g className="text-ink" aria-hidden>
          <polygon points={poly([100, 100, 100, 100, 100, 100])} fill={`url(#${uid}-bg)`} />
          {rings.map((g) => (
            <polygon
              key={g}
              points={poly(Array(6).fill(g))}
              fill="none"
              stroke="currentColor"
              strokeOpacity={g === 100 ? 0.16 : 0.08}
              strokeWidth={g === 100 ? 1.2 : 0.8}
            />
          ))}
          {[20, 40, 60, 80].map((g) => {
            // Sit on the edge midpoint between Choices and Spiritual, away from spokes and markers
            const [x0, y0] = pt(0, g);
            const [x5, y5] = pt(5, g);
            const x = (x0 + x5) / 2;
            const y = (y0 + y5) / 2;
            return (
              <text key={`rl-${g}`} x={x} y={y - 2} textAnchor="middle" fill="currentColor" fillOpacity={0.45} style={{ fontSize: size * 0.026, fontWeight: 500 }}>
                {g}
              </text>
            );
          })}
        </g>

        {/* Spokes in face colours */}
        <g aria-hidden>
          {main.map((s, i) => {
            const [x, y] = pt(i, 100);
            return (
              <g key={`spoke-${s.constructId}`}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke={s.color} strokeOpacity={0.28} strokeWidth={1.1} />
                <circle cx={x} cy={y} r={size * 0.009} fill={s.color} fillOpacity={0.55} />
              </g>
            );
          })}
        </g>

        {/* BEFORE (two-series mode): dashed neutral outline, hollow markers */}
        {hasCompare && (
          <g className={`text-ink ${anim}`} style={{ transformOrigin: `${cx}px ${cy}px` }} aria-hidden>
            <polygon
              points={prePts.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="currentColor"
              fillOpacity={0.05}
              stroke="currentColor"
              strokeOpacity={0.55}
              strokeWidth={1.6}
              strokeDasharray="5 4"
              strokeLinejoin="round"
            />
            {prePts.map(([x, y], i) => (
              <circle
                key={`pre-${pre[i].constructId}`}
                cx={x}
                cy={y}
                r={size * 0.011}
                fill="#fff"
                stroke="currentColor"
                strokeOpacity={0.7}
                strokeWidth={1.4}
              />
            ))}
          </g>
        )}

        {/* AFTER (or the only series): face-coloured wedges, stroke and filled markers */}
        <g className={`${anim} ${hasCompare ? "sc-radar-anim-late" : ""}`} style={{ transformOrigin: `${cx}px ${cy}px` }} aria-hidden>
          {main.map((s, i) => {
            const [x1, y1] = mainPts[i];
            const [x2, y2] = mainPts[(i + 1) % n];
            return (
              <polygon
                key={`w-${s.constructId}`}
                points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
                fill={s.color}
                fillOpacity={hasCompare ? 0.16 : 0.2}
              />
            );
          })}
          <g filter={`url(#${uid}-glow)`}>
            {main.map((s, i) => {
              const [x1, y1] = mainPts[i];
              const [x2, y2] = mainPts[(i + 1) % n];
              const next = main[(i + 1) % n];
              const gid = `${uid}-e${i}`;
              return (
                <g key={`e-${s.constructId}`}>
                  <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                    <stop offset="0%" stopColor={s.color} />
                    <stop offset="100%" stopColor={next.color} />
                  </linearGradient>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${gid})`} strokeWidth={2.6} strokeLinecap="round" />
                </g>
              );
            })}
          </g>
          {mainPts.map(([x, y], i) => (
            <g key={`m-${main[i].constructId}`}>
              <circle cx={x} cy={y} r={size * 0.017} fill="#fff" stroke={main[i].color} strokeWidth={2.2} />
              <circle cx={x} cy={y} r={size * 0.008} fill={main[i].color} />
            </g>
          ))}
        </g>

        {/* Labels: face name + score (and before → after) */}
        {main.map((s, i) => {
          const [lx, ly] = pt(i, 100, R + size * 0.1);
          const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
          const dy = i === 0 ? -size * 0.03 : i === 3 ? size * 0.035 : 0;
          const valueLine = hasCompare ? `${fmt(pre[i].score)} → ${fmt(s.score)}` : fmt(s.score);
          return (
            <g key={`l-${s.constructId}`} className="face-ink" style={faceInkStyle(s.color)}>
              <text
                x={lx}
                y={ly + dy}
                textAnchor={anchor}
                fill="currentColor"
                style={{ fontSize: size * 0.042, fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                {s.name}
              </text>
              <text
                x={lx}
                y={ly + dy + size * 0.05}
                textAnchor={anchor}
                className="text-ink"
                fill="currentColor"
                fillOpacity={0.75}
                style={{ fontSize: size * 0.034, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
              >
                {valueLine}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend: line style + marker shape, not colour alone */}
      {hasCompare && (
        <figcaption className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.75rem] font-medium text-slate">
          <span className="inline-flex items-center gap-1.5">
            <svg width="30" height="10" aria-hidden className="text-ink">
              <line x1="1" y1="5" x2="22" y2="5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.6" strokeDasharray="5 4" />
              <circle cx="25" cy="5" r="3.2" fill="#fff" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" />
            </svg>
            {preLabel} (dashed, hollow dots)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="30" height="10" aria-hidden>
              <defs>
                <linearGradient id={`${uid}-lg`} x1="0" x2="1">
                  {main.map((s, i) => (
                    <stop key={s.constructId} offset={`${(i / 5) * 100}%`} stopColor={s.color} />
                  ))}
                </linearGradient>
              </defs>
              <line x1="1" y1="5" x2="22" y2="5" stroke={`url(#${uid}-lg)`} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="25" cy="5" r="3.4" fill={main[0].color} />
            </svg>
            {postLabel} (solid, filled dots)
          </span>
        </figcaption>
      )}

      {/* Per-face growth deltas */}
      {hasCompare && deltas && post && (
        <ul className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3" aria-label="Change per face">
          {pre.map((s, i) => {
            const d = post[i].score - s.score;
            const arrow = r1(d) > 0 ? "▲" : r1(d) < 0 ? "▼" : "●";
            return (
              <li
                key={`d-${s.constructId}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-2.5 py-2"
                style={{ boxShadow: `inset 3px 0 0 ${s.color}` }}
              >
                <span className="min-w-0">
                  <span className="face-ink block truncate text-[0.75rem] font-semibold" style={faceInkStyle(s.color)}>
                    {s.name}
                  </span>
                  <span className="block text-[0.6875rem] tabular-nums text-muted">
                    {fmt(s.score)} → {fmt(post[i].score)}
                  </span>
                </span>
                <span className="shrink-0 text-[0.8125rem] font-bold tabular-nums text-ink">
                  <span aria-hidden className="mr-0.5 text-[0.625rem]">{arrow}</span>
                  {formatDelta(d)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {table !== "none" && (
        <div className="mt-2 print:hidden">
          {table === "toggle" && (
            <button
              type="button"
              className="mx-auto block text-[0.75rem] font-semibold text-ink underline underline-offset-2"
              aria-expanded={showTable}
              aria-controls={`${uid}-table`}
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? "Hide data table" : "Show data table"}
            </button>
          )}
          <div id={`${uid}-table`} hidden={!showTable} className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[15rem] text-left text-[0.8125rem]">
              <caption className="sr-only">Scores per face (0–100)</caption>
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="py-1.5 pr-2 font-semibold">Face</th>
                  <th scope="col" className="px-1 py-1.5 text-right font-semibold">{hasCompare ? preLabel : "Score"}</th>
                  {hasCompare && <th scope="col" className="px-1 py-1.5 text-right font-semibold">{postLabel}</th>}
                  {hasCompare && <th scope="col" className="py-1.5 pl-1 text-right font-semibold">Change</th>}
                </tr>
              </thead>
              <tbody>
                {pre.map((s, i) => (
                  <tr key={`t-${s.constructId}`} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1.5 pr-2 font-semibold text-ink">{s.name}</th>
                    <td className="px-1 py-1.5 text-right tabular-nums">{fmt(s.score)}</td>
                    {post && <td className="px-1 py-1.5 text-right tabular-nums">{fmt(post[i].score)}</td>}
                    {post && <td className="py-1.5 pl-1 text-right font-semibold tabular-nums">{formatDelta(post[i].score - s.score)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </figure>
  );
}
