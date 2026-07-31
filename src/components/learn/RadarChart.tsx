"use client";

import type { ConstructId } from "@/lib/content";
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
      }
  );
}

/**
 * Lightweight SVG radar.
 * - Single series: construct-coloured edges (baseline or post alone).
 * - With compareScores (post): pre drawn in grey; post in construct colours.
 */
export function RadarChart({
  scores,
  compareScores,
  size = 300,
  preLabel = "Pre",
  postLabel = "Post",
}: {
  /** Primary series — pre when comparing, or the only series */
  scores: ConstructScore[];
  /** Optional post series (coloured). When set, `scores` is drawn as grey pre. */
  compareScores?: ConstructScore[] | null;
  size?: number;
  preLabel?: string;
  postLabel?: string;
}) {
  const orderedPre = orderScoresForRadar(scores);
  const orderedPost = compareScores
    ? orderScoresForRadar(compareScores)
    : null;
  const n = orderedPre.length || 6;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const hasCompare = Boolean(orderedPost);

  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (Math.min(100, Math.max(0, value)) / 100) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)] as const;
  };

  const grid = [25, 50, 75, 100];
  const prePts = orderedPre.map((s, i) => point(i, s.score));
  const postPts = orderedPost?.map((s, i) => point(i, s.score));
  const labelMeta = orderedPost ?? orderedPre;

  const preGrey = "rgba(120,120,120,0.85)";
  const preGreySoft = "rgba(120,120,120,0.12)";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[320px]"
      role="img"
      aria-label={
        hasCompare
          ? "Growth radar: pre-assessment in grey, post-assessment in construct colours. Choices at top, Principles at bottom."
          : "Construct scores radar chart. Choices at top, Principles at bottom."
      }
    >
      {/* Grid rings */}
      {grid.map((g) => {
        const pts = Array.from({ length: n }, (_, i) =>
          point(i, g).join(",")
        ).join(" ");
        return (
          <polygon
            key={g}
            points={pts}
            fill="none"
            stroke="rgba(0,0,0,0.07)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {labelMeta.map((s, i) => {
        const [x, y] = point(i, 100);
        return (
          <g key={`axis-${s.constructId}`}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={hasCompare ? "rgba(0,0,0,0.08)" : s.color}
              strokeWidth="1.25"
              opacity={hasCompare ? 1 : 0.22}
            />
            <circle
              cx={x}
              cy={y}
              r={3}
              fill={s.color}
              opacity={hasCompare ? 0.5 : 0.4}
            />
          </g>
        );
      })}

      {/* Pre series — grey when comparing, else primary colour wedges */}
      {!hasCompare &&
        orderedPre.map((s, i) => {
          const [x1, y1] = prePts[i];
          const [x2, y2] = prePts[(i + 1) % n];
          return (
            <polygon
              key={`wedge-${s.constructId}`}
              points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
              fill={s.color}
              opacity={0.12}
              stroke="none"
            />
          );
        })}

      {hasCompare && (
        <polygon
          points={prePts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill={preGreySoft}
          stroke="none"
        />
      )}

      {/* Pre edges */}
      {orderedPre.map((s, i) => {
        const [x1, y1] = prePts[i];
        const [x2, y2] = prePts[(i + 1) % n];
        return (
          <line
            key={`pre-edge-${s.constructId}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={hasCompare ? preGrey : s.color}
            strokeWidth={hasCompare ? 2 : 2.5}
            strokeLinecap="round"
            strokeDasharray={hasCompare ? "4 3" : undefined}
            opacity={hasCompare ? 0.95 : 0.92}
          />
        );
      })}

      {/* Pre vertices */}
      {orderedPre.map((s, i) => {
        const [px, py] = prePts[i];
        return (
          <circle
            key={`pre-pt-${s.constructId}`}
            cx={px}
            cy={py}
            r={hasCompare ? 3.5 : 5}
            fill={hasCompare ? "#fff" : "#fff"}
            stroke={hasCompare ? preGrey : s.color}
            strokeWidth={hasCompare ? 1.75 : 2.5}
          />
        );
      })}
      {!hasCompare &&
        orderedPre.map((s, i) => {
          const [px, py] = prePts[i];
          return (
            <circle
              key={`pre-dot-${s.constructId}`}
              cx={px}
              cy={py}
              r={2.25}
              fill={s.color}
            />
          );
        })}

      {/* Post series — construct colours */}
      {hasCompare &&
        orderedPost &&
        postPts &&
        orderedPost.map((s, i) => {
          const [x1, y1] = postPts[i];
          const [x2, y2] = postPts[(i + 1) % n];
          return (
            <g key={`post-${s.constructId}`}>
              <polygon
                points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
                fill={s.color}
                opacity={0.1}
                stroke="none"
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={s.color}
                strokeWidth="2.75"
                strokeLinecap="round"
                opacity={0.95}
              />
            </g>
          );
        })}

      {hasCompare &&
        orderedPost &&
        postPts &&
        orderedPost.map((s, i) => {
          const [px, py] = postPts[i];
          return (
            <g key={`post-pt-${s.constructId}`}>
              <circle
                cx={px}
                cy={py}
                r={5.5}
                fill="#fff"
                stroke={s.color}
                strokeWidth="2.5"
              />
              <circle cx={px} cy={py} r={2.5} fill={s.color} />
            </g>
          );
        })}

      {/* Labels */}
      {labelMeta.map((s, i) => {
        const [lx, ly] = point(i, 120);
        return (
          <text
            key={`label-${s.constructId}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={s.color}
            style={{ fontSize: 11, fontWeight: 700 }}
          >
            {s.name}
          </text>
        );
      })}

      {/* Legend */}
      {hasCompare && (
        <g transform={`translate(${size / 2 - 70}, ${size - 22})`}>
          <line
            x1={0}
            y1={4}
            x2={16}
            y2={4}
            stroke={preGrey}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text x={20} y={7} fill="#666" style={{ fontSize: 10, fontWeight: 600 }}>
            {preLabel}
          </text>
          <line
            x1={58}
            y1={4}
            x2={74}
            y2={4}
            stroke="#0a0a0a"
            strokeWidth="2.5"
          />
          <text x={78} y={7} fill="#0a0a0a" style={{ fontSize: 10, fontWeight: 600 }}>
            {postLabel}
          </text>
        </g>
      )}
    </svg>
  );
}
