/** A small SVG progress ring (weekly goal). */
export function GoalRing({
  done,
  target,
  size = 96,
  stroke = 9,
  color = "currentColor",
  label,
}: {
  done: number;
  target: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, done / target) : 0;
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }} data-testid="goal-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${done} of ${target} this week`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} />
        <circle
          className="sc-ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-ink" aria-hidden>
        <span className="text-lg font-semibold tabular-nums leading-none">
          {Math.min(done, 99)}
          <span className="text-[0.75rem] font-medium text-slate">/{target}</span>
        </span>
        <span className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-slate">this week</span>
      </span>
    </div>
  );
}
