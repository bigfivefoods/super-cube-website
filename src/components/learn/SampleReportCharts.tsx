"use client";

import { constructs, type ConstructId } from "@/lib/content";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import { RadarChart } from "@/components/learn/RadarChart";
import type { ConstructScore } from "@/lib/lms/scoring";

export type SampleFaceRow = {
  id: ConstructId;
  pre: number;
  post: number;
};

type AdviceItem = {
  id: ConstructId;
  name: string;
  color: string;
  text: string;
};

function toScores(
  faces: SampleFaceRow[],
  key: "pre" | "post",
): ConstructScore[] {
  return faces.map((row) => {
    const c = constructs.find((x) => x.id === row.id)!;
    return {
      constructId: row.id,
      name: c.name,
      color: c.color,
      rawMean: 0,
      score: row[key],
      itemCount: 1,
    };
  });
}

/**
 * Polished sample tips from pre→post faces: celebrate top growth,
 * prioritise faces still lowest post (or thinner gains).
 */
function buildSampleAdvice(faces: SampleFaceRow[]): AdviceItem[] {
  const rows = faces.map((row) => {
    const c = constructs.find((x) => x.id === row.id)!;
    return {
      id: row.id,
      name: c.name,
      color: c.color,
      pre: row.pre,
      post: row.post,
      delta: Math.round((row.post - row.pre) * 10) / 10,
    };
  });

  const byGrowth = [...rows].sort((a, b) => b.delta - a.delta);
  const byPost = [...rows].sort((a, b) => a.post - b.post);
  const topGrowth = byGrowth[0];
  const secondGrowth = byGrowth[1];
  const lowestPost = byPost[0];
  const secondLowest = byPost[1];
  const highestPost = byPost[byPost.length - 1];

  const tips: AdviceItem[] = [];
  const used = new Set<string>();

  const push = (item: AdviceItem) => {
    const key = `${item.id}:${item.text.slice(0, 24)}`;
    if (used.has(key)) return;
    used.add(key);
    tips.push(item);
  };

  // Celebrate top movers
  push({
    id: topGrowth.id,
    name: topGrowth.name,
    color: topGrowth.color,
    text: `Grew most (+${topGrowth.delta}). Keep deliberate practice—short daily reps beat occasional long sessions.`,
  });

  if (highestPost.id !== topGrowth.id) {
    push({
      id: highestPost.id,
      name: highestPost.name,
      color: highestPost.color,
      text: `Now strongest at ${highestPost.post}. Protect the habits that got you here so it stays a leadership advantage.`,
    });
  } else {
    push({
      id: secondGrowth.id,
      name: secondGrowth.name,
      color: secondGrowth.color,
      text: `Also lifted strongly (+${secondGrowth.delta}). Keep that momentum with one scheduled practice this week.`,
    });
  }

  // Prioritise still-lowest post scores
  push({
    id: lowestPost.id,
    name: lowestPost.name,
    color: lowestPost.color,
    text: `Still among the lowest post scores (${lowestPost.post}). Open that course module and complete the practice lab this week.`,
  });

  if (secondLowest.id !== lowestPost.id) {
    // If second-lowest is already top growth (e.g. Emotional), frame as consolidate
    const consolidating = secondLowest.id === topGrowth.id;
    push({
      id: secondLowest.id,
      name: secondLowest.name,
      color: secondLowest.color,
      text: consolidating
        ? `Post is still ${secondLowest.post} despite top growth. Double down with micro-practices for presence under stress.`
        : `Sits close behind at ${secondLowest.post} (+${secondLowest.delta}). Add one structured practice from that face this week.`,
    });
  }

  // Thin-growth nudge if distinct from above
  const thin = [...rows].sort((a, b) => a.delta - b.delta)[0];
  if (thin && !tips.some((t) => t.id === thin.id) && tips.length < 5) {
    push({
      id: thin.id,
      name: thin.name,
      color: thin.color,
      text: `Smaller growth (+${thin.delta}). Stack a 5-minute check-in after existing routines so it compounds with the rest of the cube.`,
    });
  }

  return tips.slice(0, 5);
}

/**
 * Illustrative 14-day overall capacity trend from near-baseline toward post.
 * Mirrors continuous face-tracking sparklines in /learn/pulse.
 */
function buildSampleSeries(
  preOverall: number,
  postOverall: number,
): (number | null)[] {
  const days = 14;
  const out: (number | null)[] = [];
  for (let i = 0; i < days; i++) {
    // Gentle S-curve from pre → post with small day-to-day variation
    const t = i / (days - 1);
    const eased = t * t * (3 - 2 * t);
    const base = preOverall + (postOverall - preOverall) * eased;
    // Skip one mid-window day to show a realistic gap
    if (i === 6) {
      out.push(null);
      continue;
    }
    const wobble = Math.sin(i * 1.3) * 1.4;
    out.push(Math.round(Math.min(100, Math.max(0, base + wobble))));
  }
  return out;
}

export function SampleReportCharts({
  faces,
  preOverall,
  postOverall,
}: {
  faces: SampleFaceRow[];
  preOverall: number;
  postOverall: number;
}) {
  const preScores = toScores(faces, "pre");
  const postScores = toScores(faces, "post");
  const series = buildSampleSeries(preOverall, postOverall);
  const advice = buildSampleAdvice(faces);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Growth radar · pre → post
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate">
          Baseline in grey; post in construct colours. Choices at top,
          Principles at bottom—matching the Super-Cube® face layout.
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,240px)_1fr] md:items-start">
          <div className="flex justify-center rounded-2xl border border-line bg-surface px-2 py-4 sm:px-3">
            <RadarChart
              scores={preScores}
              compareScores={postScores}
              size={220}
              preLabel="Pre"
              postLabel="Post"
            />
          </div>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5">
            <h4 className="text-sm font-semibold tracking-tight text-ink">
              Where to focus next
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate">
              Sample guidance from this composite&apos;s pre → post pattern—same
              style of improvement advice learners see after a real report.
            </p>
            <ul className="mt-3 space-y-2.5">
              {advice.map((item, i) => (
                <li key={`${item.id}-${i}`} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: item.color }}
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-ink">
                    <span className="font-semibold">{item.name}.</span>{" "}
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Longitudinal trend · continuous tracking
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate">
          Illustrative 14-day overall capacity path from daily/weekly face
          pulses—the same continuous tracking available in Learn after baseline.
          Gaps show days without a log.
        </p>
        <div className="mt-3 rounded-2xl border border-line bg-surface px-4 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                Overall capacity
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                {preOverall} → {postOverall}
              </p>
            </div>
            <p className="text-[0.65rem] text-muted">14-day sample</p>
          </div>
          <div className="mt-3">
            <FaceSparkline
              values={series}
              width={320}
              height={56}
              stroke="#0a0a0a"
            />
          </div>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
            In live Learn, pulses feed adaptive micro-practices and coach
            heatmaps (with consent). This sample is illustrative only.
          </p>
        </div>
      </div>
    </div>
  );
}
