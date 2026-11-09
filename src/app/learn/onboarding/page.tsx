"use client";

import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

function OnboardingInner() {
  const { t } = useLmsT();

  const params = useSearchParams();
  const mode = params.get("mode") === "purchase" ? "purchase" : "demo";
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
    track("page_view", { path: "/learn/onboarding", mode });
  }, [mode]);

  const programmeId = (params.get("programme") ||
    state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);

  return (
    <LearnShell
      title={mode === "purchase" ? "You're in" : t("Welcome to your demo")}
      subtitle={
        mode === "purchase"
          ? t("Payment confirmed (or access activated). Here’s the clearest path to real growth—not a content binge.")
          : t("Free on this device. Five steps. Deliberate practice. You’ll see pre → post change on your report.")
      }
    >
      <div className="mb-5 rounded-2xl border border-ink bg-elevated p-5 sm:p-6">
        <p className="learn-eyebrow">
          {programme?.name ?? t("Super-Cube®")} · {programme?.ageLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">{t("Your next 30 minutes")}</h2>
        <ol className="mt-4 space-y-3">
          {[
            {
              n: "1",
              t: t("Orient"),
              d: t("Pre-pre assessment — how you see leadership levels"),
              href: "/learn/assessment/orientation",
            },
            {
              n: "2",
              t: t("Baseline"),
              d: t("Six-face self-assessment so growth is measurable"),
              href: "/learn/assessment/pre",
            },
            {
              n: "3",
              t: t("First session"),
              d: t("Start your weakest face (we’ll plan your week after baseline)"),
              href: "/learn/courses",
            },
            {
              n: "4",
              t: t("First face pulse"),
              d: t("30 seconds — rate 3 faces so continuous patterns can start"),
              href: "/learn/pulse",
            },
            {
              n: "5",
              t: t("Reflect"),
              d: t("2–5 sentences in the journal — transfer is the product"),
              href: "/learn",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full sc-btn-primary text-xs font-bold ">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink">{step.t}</p>
                <p className="text-[0.8125rem] text-slate">{step.d}</p>
                <Link
                  href={step.href}
                  className="mt-1 inline-block text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
                >{t("Open →")}</Link>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/learn/assessment/orientation"
          className="learn-btn learn-btn-primary mt-6 w-full sm:w-auto"
        >{t("Start orientation →")}</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="learn-card-muted">
          <p className="learn-label">{t("Tips")}</p>
          <ul className="learn-body mt-2 space-y-1">
            <li>{t("· Short sessions beat marathons")}</li>
            <li>{t("· Turn on practice reminders on the dashboard")}</li>
            <li>{t("· Sign in to sync across devices")}</li>
          </ul>
        </div>
        <div className="learn-card-muted">
          <p className="learn-label">{t("For schools & teams")}</p>
          <p className="learn-body mt-2">{t("Join a cohort code so coaches can see progress (not journals).")}</p>
          <Link
            href="/learn/org"
            className="mt-2 inline-block text-[0.8125rem] font-semibold text-ink"
          >{t("Join cohort →")}</Link>
        </div>
      </div>
    </LearnShell>
  );
}

export default function OnboardingPage() {
  const { t } = useLmsT();

  return (
    <Suspense
      fallback={
        <LearnShell title={t("Welcome")}>
          <p className="learn-meta">{t("Loading…")}</p>
        </LearnShell>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
