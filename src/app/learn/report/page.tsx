"use client";

import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { RadarChart } from "@/components/learn/RadarChart";
import { Button } from "@/components/ui";
import {
  compareAttempts,
  recommendations,
} from "@/lib/lms/scoring";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

export default function ReportPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  const pre = state?.attempts.find((a) => a.phase === "pre");
  const post = state?.attempts.find((a) => a.phase === "post");
  const programmeId =
    pre?.programmeId ||
    state?.subscription?.programmeId ||
    state?.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;

  const comparison = useMemo(() => {
    if (!pre) return null;
    return compareAttempts(pre.result, post?.result);
  }, [pre, post]);

  const recs = pre ? recommendations(pre.result) : [];

  if (!state) {
    return (
      <LearnShell title="Report">
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  if (!pre) {
    return (
      <LearnShell
        title="Personal report"
        subtitle="Complete your pre-assessment to generate a Super-Cube® profile."
      >
        <Button href="/learn/assessment/pre" variant="primary">
          Start pre-assessment
        </Button>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title="Personal development report"
      subtitle={`${programme?.name ?? "Super-Cube®"} · developmental profile (not a clinical diagnosis).`}
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-ink px-3 py-1 font-semibold text-white">
          Pre overall {pre.result.overall}
        </span>
        {post && (
          <span className="rounded-full border border-black/[0.1] bg-white px-3 py-1 font-semibold text-ink">
            Post overall {post.result.overall}
          </span>
        )}
        <span className="rounded-full border border-black/[0.08] px-3 py-1 text-muted">
          Generated {new Date(pre.completedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Profile radar
          </h2>
          <div className="mt-4">
            <RadarChart scores={pre.result.constructScores} />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Construct scores
          </h2>
          <ul className="mt-4 space-y-3">
            {comparison?.map((row) => (
              <li key={row.constructId}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: row.color }}
                    />
                    {row.name}
                  </span>
                  <span className="text-muted">
                    {row.pre}
                    {row.post !== null ? ` → ${row.post}` : ""}
                    {row.delta !== null && row.delta !== 0
                      ? ` (${row.delta > 0 ? "+" : ""}${row.delta})`
                      : ""}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${row.pre}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Recommendations
        </h2>
        <ul className="mt-4 space-y-3">
          {recs.map((r) => (
            <li
              key={r}
              className="text-sm leading-relaxed text-slate"
              dangerouslySetInnerHTML={{
                __html: r.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/learn/courses" variant="primary">
            Go to courses
          </Button>
          {!post && (
            <Button href="/learn/assessment/post" variant="ghost">
              Take post-assessment
            </Button>
          )}
        </div>
      </section>

      <p className="mt-6 text-xs text-muted">
        This report is for developmental use within the Super-Cube® model. Scores
        reflect self-report on this instrument only.
      </p>
    </LearnShell>
  );
}
