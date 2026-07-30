"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import { depthLabel } from "@/lib/lms/orientation";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

export default function AssessmentHubPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  const programmeId =
    state?.subscription?.programmeId || state?.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const orientation = state?.orientation;
  const pre = state?.attempts.find((a) => a.phase === "pre");
  const post = state?.attempts.find((a) => a.phase === "post");

  return (
    <LearnShell
      title="Assessment"
      subtitle="Start with orientation (philosophy · theory · model), then measure your Super-Cube® profile before and after development."
    >
      {!programme && (
        <div className="mb-6 rounded-xl border border-black/[0.08] bg-white p-5 text-sm text-slate">
          Select a programme first.{" "}
          <Link
            href="/learn/programmes"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Choose programme
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Phase 0 — pre-pre */}
        <article className="rounded-2xl border border-black/[0.08] bg-white p-6 lg:col-span-1">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Phase 0 · Pre-pre
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Orientation
          </h2>
          <p className="mt-2 text-sm text-slate">
            Do you know or use leadership models? We assess whether you hold a{" "}
            <strong className="font-semibold text-ink">philosophy</strong>{" "}
            (high-level),{" "}
            <strong className="font-semibold text-ink">theory</strong>{" "}
            (middle-level), or{" "}
            <strong className="font-semibold text-ink">model</strong>{" "}
            (concrete / absolute) perspective.
          </p>
          {orientation ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-ink">
                {orientation.result.label}
              </p>
              <p className="text-sm text-slate">{orientation.result.summary}</p>
              <ul className="text-xs text-muted">
                <li>
                  Philosophy: {depthLabel(orientation.result.depth.philosophy)}
                </li>
                <li>Theory: {depthLabel(orientation.result.depth.theory)}</li>
                <li>Model: {depthLabel(orientation.result.depth.model)}</li>
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Not started · recommended first</p>
          )}
          <Button
            href="/learn/assessment/orientation"
            variant="primary"
            className="mt-6 w-full sm:w-auto"
          >
            {orientation ? "Retake orientation" : "Start pre-pre assessment"}
          </Button>
        </article>

        {/* Phase 1 — pre */}
        <article className="rounded-2xl border border-black/[0.08] bg-white p-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Phase 1
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Pre-assessment
          </h2>
          <p className="mt-2 text-sm text-slate">
            Baseline across all six Super-Cube® faces
            {programme ? ` · ${programme.name}` : ""}.
          </p>
          {pre ? (
            <p className="mt-4 text-sm font-semibold text-ink">
              Completed · overall {pre.result.overall}/100
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              {orientation
                ? "Ready after orientation"
                : "Complete orientation first (recommended)"}
            </p>
          )}
          <Button
            href="/learn/assessment/pre"
            variant={orientation || pre ? "primary" : "ghost"}
            className="mt-6 w-full sm:w-auto"
          >
            {pre ? "Retake pre-assessment" : "Start pre-assessment"}
          </Button>
        </article>

        {/* Phase 2 — post */}
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

      {orientation && (
        <section className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Your orientation result
          </h3>
          <p className="mt-2 text-sm text-slate">{orientation.result.guidance}</p>
          <p className="mt-3 text-xs text-muted">
            Knows models: {orientation.result.knowsModels} · Uses models:{" "}
            {orientation.result.usesModels}
            {orientation.result.knownExamples
              ? ` · Named: ${orientation.result.knownExamples}`
              : ""}
          </p>
        </section>
      )}
    </LearnShell>
  );
}
