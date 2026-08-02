"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { SuperCube } from "@/components/SuperCube";
import { buildAssessmentNarrative } from "@/lib/lms/narrative";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { type ConstructId } from "@/lib/content";
import { track } from "@/lib/analytics";

/** Post-baseline narrative + score-lit cube */
export default function AssessmentFeedbackPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
    track("page_view", { path: "/learn/feedback" });
  }, []);

  const pre = state?.attempts.find((a) => a.phase === "pre");
  const narrative = useMemo(
    () => (pre ? buildAssessmentNarrative(pre.result) : null),
    [pre]
  );

  const scoreMap = useMemo(() => {
    if (!pre) return undefined;
    const m: Partial<Record<ConstructId, number>> = {};
    pre.result.constructScores.forEach((s) => {
      m[s.constructId] = s.score;
    });
    return m;
  }, [pre]);

  if (!state) {
    return (
      <LearnShell title="Your baseline">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  if (!pre || !narrative) {
    return (
      <LearnShell
        title="Your baseline"
        subtitle="Complete the pre-assessment to unlock narrative feedback and your lit cube."
      >
        <Link href="/learn/assessment/pre" className="learn-btn learn-btn-primary">
          Start baseline
        </Link>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title="Your baseline narrative"
      subtitle="Strengths, stretch faces, and first practices—not just numbers."
    >
      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="rounded-2xl border border-ink bg-white p-5 sm:p-6">
          <p className="learn-eyebrow">Overall · {narrative.overall}/100</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            {narrative.overallHeadline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            {narrative.overallBody}
          </p>
          <p className="mt-3 rounded-xl bg-[#f4f4f4] px-3 py-2 text-[0.8125rem] font-medium text-ink">
            {narrative.weekFocus}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/learn" className="learn-btn learn-btn-primary">
              Open weekly plan
            </Link>
            <Link href="/learn/practice" className="learn-btn learn-btn-ghost">
              Today’s micro-practice
            </Link>
            <Link href="/learn/report" className="learn-btn learn-btn-ghost">
              Full report
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-black/[0.07] bg-[#fafafa] p-4">
          <p className="mb-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Your cube · lit by baseline scores
          </p>
          <SuperCube
            size="md"
            showSkills={false}
            showScores
            scores={scoreMap}
            autoSpin
          />
        </div>
      </div>

      <ul className="space-y-3">
        {narrative.faces.map((f) => (
          <li
            key={f.constructId}
            className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5"
            style={{ boxShadow: `inset 3px 0 0 ${f.color}` }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-ink">{f.headline}</h3>
              <span className="text-sm font-bold tabular-nums text-ink">
                {Math.round(f.score)}
                <span className="font-medium text-muted"> / 100</span>
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate">{f.insight}</p>
            <p className="mt-2 text-[0.8125rem] text-ink">
              <span className="font-semibold">First practice: </span>
              {f.firstPractice}
            </p>
          </li>
        ))}
      </ul>
    </LearnShell>
  );
}
