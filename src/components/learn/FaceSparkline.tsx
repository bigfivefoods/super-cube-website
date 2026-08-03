"use client";

/** Minimal SVG sparkline for overall face-pulse trend (nulls = gaps). */
export function FaceSparkline({
  values,
  width = 280,
  height = 48,
  stroke = "#0a0a0a",
}: {
  values: (number | null)[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  const pts = values
    .map((v, i) => ({ i, v }))
    .filter((p): p is { i: number; v: number } => typeof p.v === "number");

  if (pts.length < 2) {
    return (
      <p className="text-[0.75rem] text-muted">
        Log a few daily pulses to see your trend line.
      </p>
    );
  }

  const n = Math.max(values.length - 1, 1);
  const pad = 4;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const span = Math.max(max - min, 8);

  const coord = (i: number, v: number) => {
    const x = pad + (i / n) * (width - pad * 2);
    const y =
      height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  };

  const d = pts
    .map((p, idx) => {
      const [x, y] = coord(p.i, p.v);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = pts[pts.length - 1]!;
  const [lx, ly] = coord(last.i, last.v);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full max-w-sm"
      role="img"
      aria-label="Overall face capacity trend from recent pulses"
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="3.5" fill={stroke} />
    </svg>
  );
}
