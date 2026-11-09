"use client";

import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import { depthLabel } from "@/lib/lms/orientation";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";
import { programmeCopy } from "@/lib/lms/programme-copy";

export default function AssessmentHubPage() {
  const { t } = useLmsT();

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
      title={t("Assessment hub")}
      subtitle={programmeCopy("assessment.hub.subtitle", programmeId)}
    >
      {!programme && (
        <div className="learn-card mb-4 learn-body">
          Select a programme first.{" "}
          <Link
            href="/learn/programmes"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >{t("Choose programme")}</Link>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <article className="learn-card">
          <p className="learn-eyebrow">{t("Step 2 of 6 · Orientation")}</p>
          <h2 className="learn-card-title mt-1.5">{t("Orientation")}</h2>
          <p className="learn-body mt-2">
            Do you know or use leadership models? We assess whether you hold a{" "}
            <strong className="font-semibold text-ink">philosophy</strong>{" "}
            (high-level),{" "}
            <strong className="font-semibold text-ink">theory</strong>{" "}
            (middle-level), or{" "}
            <strong className="font-semibold text-ink">model</strong>{t("(concrete) perspective.")}</p>
          {orientation ? (
            <div className="mt-3 space-y-1.5">
              <p className="learn-label">{orientation.result.label}</p>
              <p className="learn-body-sm">{orientation.result.summary}</p>
              <ul className="learn-meta space-y-0.5">
                <li>
                  Philosophy: {depthLabel(orientation.result.depth.philosophy)}
                </li>
                <li>Theory: {depthLabel(orientation.result.depth.theory)}</li>
                <li>Model: {depthLabel(orientation.result.depth.model)}</li>
              </ul>
            </div>
          ) : (
            <p className="learn-meta mt-3">{t("Not started · recommended first")}</p>
          )}
          <Button
            href="/learn/assessment/orientation"
            variant="primary"
            className="mt-4 !min-h-9 !py-1.5 !text-[0.8125rem] w-full sm:w-auto"
          >
            {orientation ? t("Retake orientation") : t("Start pre-pre assessment")}
          </Button>
        </article>

        <article className="learn-card">
          <p className="learn-eyebrow">{t("Step 3 of 6 · Baseline")}</p>
          <h2 className="learn-card-title mt-1.5">{t("Pre-assessment")}</h2>
          <p className="learn-body mt-2">
            Baseline across all six Super-Cube® faces
            {programme ? ` · ${programme.name}` : ""}.
          </p>
          {pre ? (
            <p className="learn-label mt-3">
              Completed · overall {pre.result.overall}/100
            </p>
          ) : (
            <p className="learn-meta mt-3">
              {orientation
                ? t("Ready after orientation")
                : t("Complete orientation first (recommended)")}
            </p>
          )}
          <Button
            href={pre ? "/learn/feedback" : "/learn/assessment/pre"}
            variant={orientation || pre ? "primary" : "ghost"}
            className="mt-4 !min-h-9 !py-1.5 !text-[0.8125rem] w-full sm:w-auto"
          >
            {pre ? t("Baseline locked · view narrative") : t("Start pre-assessment")}
          </Button>
        </article>

        <article className="learn-card">
          <p className="learn-eyebrow">{t("Step 5 of 6 · After the programme")}</p>
          <h2 className="learn-card-title mt-1.5">{t("Post-assessment")}</h2>
          <p className="learn-body mt-2">{t("Same six-face instrument as baseline. It opens after a minimum practice period and completed sessions, so the comparison is fair. One after-test per programme.")}</p>
          {post ? (
            <p className="learn-label mt-3">
              Completed · overall {post.result.overall}/100
              {pre
                ? ` · Δ ${
                    post.result.overall - pre.result.overall > 0 ? "+" : ""
                  }${Math.round((post.result.overall - pre.result.overall) * 10) / 10}`
                : ""}
            </p>
          ) : (
            <p className="learn-meta mt-3">
              {pre
                ? t("Opens after the practice period and enough completed sessions")
                : t("Complete pre-assessment first")}
            </p>
          )}
          {!post && (
            <Button
              href="/learn/assessment/post"
              variant={pre ? "primary" : "ghost"}
              className="mt-4 !min-h-9 !py-1.5 !text-[0.8125rem] w-full sm:w-auto"
            >{t("Check after-test status")}</Button>
          )}
          {post && (
            <Button
              href="/learn/report"
              variant="ghost"
              className="mt-2 !min-h-9 !py-1.5 !text-[0.8125rem] w-full sm:w-auto"
            >{t("View growth report →")}</Button>
          )}
        </article>
      </div>

      {orientation && (
        <section className="learn-card mt-4">
          <h3 className="learn-card-title">{t("Your orientation result")}</h3>
          <p className="learn-body mt-2">{orientation.result.guidance}</p>
          <p className="learn-meta mt-2.5">
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
