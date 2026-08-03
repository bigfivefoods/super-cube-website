"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

function OnboardingInner() {
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
      title={mode === "purchase" ? "You're in" : "Welcome to your demo"}
      subtitle={
        mode === "purchase"
          ? "Payment confirmed (or access activated). Here’s the clearest path to real growth—not a content binge."
          : "Free on this device. Five steps. Deliberate practice. You’ll see pre → post change on your report."
      }
    >
      <div className="mb-5 rounded-2xl border border-ink bg-white p-5 sm:p-6">
        <p className="learn-eyebrow">
          {programme?.name ?? "Super-Cube®"} · {programme?.ageLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          Your next 30 minutes
        </h2>
        <ol className="mt-4 space-y-3">
          {[{
              n: "1",
              t: "Orient",
              d: "Pre-pre assessment — how you see leadership levels",
              href: "/learn/assessment/orientation",
            },
            {
              n: "2",
              t: "Baseline",
              d: "Six-face self-assessment so growth is measurable",
              href: "/learn/assessment/pre",
            },
            {
              n: "3",
              t: "First session",
              d: "Start your weakest face (we’ll plan your week after baseline)",
              href: "/learn/courses",
            },
            {
              n: "4",
              t: "First face pulse",
              d: "30 seconds — rate 3 faces so continuous patterns can start",
              href: "/learn/pulse",
            },
            {
              n: "5",
              t: "Reflect",
              d: "2–5 sentences in the journal — transfer is the product",
              href: "/learn",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink">{step.t}</p>
                <p className="text-[0.8125rem] text-slate">{step.d}</p>
                <Link
                  href={step.href}
                  className="mt-1 inline-block text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Open →
                </Link>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/learn/assessment/orientation"
          className="learn-btn learn-btn-primary mt-6 w-full sm:w-auto"
        >
          Start orientation →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="learn-card-muted">
          <p className="learn-label">Tips</p>
          <ul className="learn-body mt-2 space-y-1">
            <li>· Short sessions beat marathons</li>
            <li>· Turn on practice reminders on the dashboard</li>
            <li>· Sign in to sync across devices</li>
          </ul>
        </div>
        <div className="learn-card-muted">
          <p className="learn-label">For schools & teams</p>
          <p className="learn-body mt-2">
            Join a cohort code so coaches can see progress (not journals).
          </p>
          <Link
            href="/learn/org"
            className="mt-2 inline-block text-[0.8125rem] font-semibold text-ink"
          >
            Join cohort →
          </Link>
        </div>
      </div>
    </LearnShell>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <LearnShell title="Welcome">
          <p className="learn-meta">Loading…</p>
        </LearnShell>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
