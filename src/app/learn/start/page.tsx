"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { getProfile, profileComplete } from "@/lib/lms/profile";
import {
  loadLmsState,
  unlockDemo,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

/**
 * Guided 10-minute first run — never dump users on full dashboard.
 */
export default function GuidedStartPage() {
  const router = useRouter();
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!profileComplete(p)) {
      router.replace("/learn/welcome");
      return;
    }
    const s = loadLmsState();
    if (!s.demoUnlocked && !s.subscription) {
      unlockDemo(
        (p?.programmeId || s.user?.programmeId || "adults") as ProgrammeId
      );
    }
    setState(loadLmsState());
    setReady(true);
    track("page_view", { path: "/learn/start" });
    track("guided_start_open", {});
  }, [router]);

  if (!ready || !state) {
    return (
      <LearnShell title="Your first 10 minutes">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    state?.profile?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const fr = state?.firstRun ?? {};
  const orientDone = Boolean(state?.orientation || fr.orient);
  const preDone = Boolean(
    state?.attempts.some((a) => a.phase === "pre") || fr.pre
  );
  const lessonDone =
    Boolean(fr.firstLesson) ||
    Object.values(state?.lessonProgress ?? {}).some((s) => s === "completed");

  const name = state.profile?.displayName || state.user?.fullName;

  const steps = [
    {
      n: 1,
      min: "2 min",
      t: "Orient",
      d: "How you see leadership levels—quick pre-pre check.",
      href: "/learn/assessment/orientation",
      done: orientDone,
    },
    {
      n: 2,
      min: "3–5 min",
      t: "Baseline (start)",
      d: "Six faces, honest ratings. You can save mid-way and resume.",
      href: "/learn/assessment/pre",
      done: preDone,
    },
    {
      n: 3,
      min: "4 min",
      t: "One session",
      d: "After baseline, open your weekly plan’s first face—or start any course.",
      href: preDone ? "/learn" : "/learn/courses",
      done: lessonDone,
    },
    {
      n: 4,
      min: "1 min",
      t: "First win",
      d: "Complete a session to unlock win-of-the-day and streak.",
      href: "/learn",
      done: lessonDone,
    },
  ];

  const next = steps.find((s) => !s.done) ?? steps[steps.length - 1]!;

  return (
    <LearnShell
      title={name ? `${name.split(" ")[0]}, your first 10 minutes` : "Your first 10 minutes"}
      subtitle={`${programme?.name ?? "Super-Cube®"} · Guided path. Skip anytime—this is the fastest route to a real baseline and first practice.`}
      hideJourneyRail
    >
      <div className="mb-5 rounded-2xl border border-ink bg-ink p-5 text-white sm:p-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/50">
          Recommended next
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          {next.t}
          <span className="ml-2 text-sm font-medium text-white/55">
            · {next.min}
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/70">{next.d}</p>
        <Link
          href={next.href}
          onClick={() => track("guided_start_cta", { step: next.n })}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink"
        >
          Continue →
        </Link>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className={`flex gap-3 rounded-2xl border p-4 ${
              step.done
                ? "border-black/[0.06] bg-[#fafafa]"
                : step.n === next.n
                  ? "border-ink bg-white"
                  : "border-black/[0.08] bg-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-emerald-600 text-white"
                  : "bg-ink text-white"
              }`}
            >
              {step.done ? "✓" : step.n}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-semibold text-ink">{step.t}</p>
                <span className="text-[0.7rem] font-medium text-muted">
                  {step.min}
                </span>
              </div>
              <p className="mt-0.5 text-[0.8125rem] text-slate">{step.d}</p>
              {!step.done && (
                <Link
                  href={step.href}
                  className="mt-2 inline-block text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Open step →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-center text-sm text-muted">
        Prefer the full dashboard?{" "}
        <Link href="/learn" className="font-semibold text-ink underline-offset-2 hover:underline">
          Go to Learn
        </Link>
        {" · "}
        <Link href="/learn/account" className="font-semibold text-ink underline-offset-2 hover:underline">
          You / profile
        </Link>
        {" · "}
        <Link href="/learn/welcome" className="font-semibold text-ink underline-offset-2 hover:underline">
          Edit profile
        </Link>
      </p>
    </LearnShell>
  );
}
