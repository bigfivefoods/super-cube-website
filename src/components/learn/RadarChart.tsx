"use client";

import type { ConstructScore } from "@/lib/lms/scoring";

/** Lightweight SVG radar (no chart library) */
export function RadarChart({
  scores,
  size = 280,
}: {
  scores: ConstructScore[];
  size?: number;
}) {
  const n = scores.length || 6;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  const point = (i: number, value: number) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
    const rr = (Math.min(100, Math.max(0, value)) / 100) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)] as const;
  };

  const grid = [25, 50, 75, 100];
  const poly = scores
    .map((s, i) => point(i, s.score).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[320px]"
      role="img"
      aria-label="Construct scores radar chart"
    >
      {grid.map((g) => {
        const pts = Array.from({ length: n }, (_, i) =>
          point(i, g).join(",")
        ).join(" ");
        return (
          <polygon
            key={g}
            points={pts}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
        );
      })}
      {scores.map((s, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={s.constructId}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1"
          />
        );
      })}
      {poly && (
        <polygon
          points={poly}
          fill="rgba(10,10,10,0.12)"
          stroke="#0a0a0a"
          strokeWidth="2"
        />
      )}
      {scores.map((s, i) => {
        const [x, y] = point(i, 112);
        return (
          <text
            key={s.constructId}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}
