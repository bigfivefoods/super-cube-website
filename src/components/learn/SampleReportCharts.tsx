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

function toScores(
  faces: SampleFaceRow[],
  key: "pre" | "post"
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
 * Illustrative 14-day overall capacity trend from near-baseline toward post.
 * Mirrors continuous face-tracking sparklines in /learn/pulse.
 */
function buildSampleSeries(preOverall: number, postOverall: number): (number | null)[] {
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

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Growth radar · pre → post
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate">
          Baseline in grey; post in construct colours. Choices at top, Principles
          at bottom—matching the Super-Cube® face layout.
        </p>
        <div className="mt-4 flex justify-center rounded-2xl border border-black/[0.06] bg-[#fafafa] px-2 py-4 sm:px-4">
          <RadarChart
            scores={preScores}
            compareScores={postScores}
            size={300}
            preLabel="Pre"
            postLabel="Post"
          />
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
        <div className="mt-3 rounded-2xl border border-black/[0.06] bg-[#fafafa] px-4 py-4">
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
            <FaceSparkline values={series} width={320} height={56} stroke="#0a0a0a" />
          </div>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
            In live Learn, pulses feed adaptive micro-practices and coach heatmaps
            (with consent). This sample is illustrative only.
          </p>
        </div>
      </div>
    </div>
  );
}
