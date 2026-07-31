"use client";

import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import {
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { programmes, type ProgrammeId } from "@/lib/programmes";

export default function LearnProgrammesPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
  }, []);

  function selectProgramme(id: ProgrammeId) {
    const next = loadLmsState();
    next.user = {
      email: next.user?.email || "learner@demo.local",
      fullName: next.user?.fullName || "Demo Learner",
      programmeId: id,
    };
    saveLmsState(next);
    setState(next);
  }

  const selected = state?.user?.programmeId || state?.subscription?.programmeId;

  return (
    <LearnShell
      title="Step 1 · Choose your programme"
      subtitle="One model for life. Pick the pathway that matches this season—Kids, Adolescents, or Adults. Same six faces; language and practice that fit you."
    >
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {programmes.map((p) => {
          const active = selected === p.id;
          return (
            <article
              key={p.id}
              className={`flex flex-col rounded-2xl border p-4 sm:p-5 ${
                active
                  ? "border-ink bg-ink text-white shadow-sm"
                  : "border-black/[0.07] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              }`}
            >
              <p
                className={`learn-eyebrow ${
                  active ? "!text-white/50" : ""
                }`}
              >
                {p.ageLabel}
              </p>
              <h2 className="learn-card-title mt-1.5">{p.name}</h2>
              <p
                className={`mt-1.5 text-[0.8125rem] font-medium leading-snug ${
                  active ? "text-white/80" : "text-slate"
                }`}
              >
                {p.tagline}
              </p>
              <p
                className={`mt-3 flex-1 text-[0.8125rem] leading-relaxed ${
                  active ? "text-white/65" : "text-slate"
                }`}
              >
                {p.description}
              </p>
              <p
                className={`mt-2.5 text-[0.7rem] ${
                  active ? "text-white/45" : "text-muted"
                }`}
              >
                {p.audienceNote}
              </p>
              <p
                className={`mt-3 text-[0.8125rem] font-semibold ${
                  active ? "text-white" : "text-ink"
                }`}
              >
                ${p.priceUsd} USD once
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => selectProgramme(p.id)}
                  className={`learn-btn w-full ${
                    active
                      ? "bg-white text-ink hover:bg-white/95"
                      : "learn-btn-primary"
                  }`}
                >
                  {active ? "Selected" : "Select programme"}
                </button>
                <Button
                  href={`/pricing#${p.id}`}
                  variant={active ? "light" : "ghost"}
                  className="!min-h-9 w-full !py-1.5 !text-[0.8125rem]"
                >
                  Subscribe
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="learn-eyebrow">Step 1 complete</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              Next: Orient your mind (Step 2)
            </p>
            <p className="learn-meta mt-0.5">
              Map philosophy · theory · model—then you’ll measure your baseline.
            </p>
          </div>
          <Button
            href="/learn/assessment/orientation"
            variant="primary"
            className="!min-h-10 shrink-0 !text-[0.8125rem]"
          >
            Continue to Step 2 →
          </Button>
        </div>
      )}
    </LearnShell>
  );
}
