"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

export default function AssessmentHubPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  const programmeId =
    state?.subscription?.programmeId || state?.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const pre = state?.attempts.find((a) => a.phase === "pre");
  const post = state?.attempts.find((a) => a.phase === "post");

  return (
    <LearnShell
      title="Assessment"
      subtitle="Measure your Super-Cube® profile before and after development. Same six constructs—language adapted to your programme."
    >
      {!programme && (
        <div className="mb-6 rounded-xl border border-black/[0.08] bg-white p-5 text-sm text-slate">
          Select a programme first.{" "}
          <Link href="/learn/programmes" className="font-semibold text-ink underline-offset-2 hover:underline">
            Choose programme
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-black/[0.08] bg-white p-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Phase 1
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Pre-assessment
          </h2>
          <p className="mt-2 text-sm text-slate">
            Baseline across all six faces
            {programme ? ` · ${programme.name}` : ""}.
          </p>
          {pre ? (
            <p className="mt-4 text-sm font-semibold text-ink">
              Completed · overall {pre.result.overall}/100
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">Not started</p>
          )}
          <Button
            href="/learn/assessment/pre"
            variant="primary"
            className="mt-6 w-full sm:w-auto"
          >
            {pre ? "Retake pre-assessment" : "Start pre-assessment"}
          </Button>
        </article>

        <article className="rounded-2xl border border-black/[0.08] bg-white p-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Phase 2
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Post-assessment
          </h2>
          <p className="mt-2 text-sm text-slate">
            Re-measure after courses to show growth.
          </p>
          {post ? (
            <p className="mt-4 text-sm font-semibold text-ink">
              Completed · overall {post.result.overall}/100
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              {pre
                ? "Available after learning progress"
                : "Complete pre-assessment first"}
            </p>
          )}
          <Button
            href="/learn/assessment/post"
            variant={pre ? "primary" : "ghost"}
            className="mt-6 w-full sm:w-auto"
          >
            {post ? "Retake post-assessment" : "Start post-assessment"}
          </Button>
        </article>
      </div>
    </LearnShell>
  );
}
