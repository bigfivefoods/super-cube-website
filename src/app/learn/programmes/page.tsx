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
      title="Choose your programme"
      subtitle="Three Super-Cube® pathways—same six faces of leadership, different age-appropriate language, scenarios, and practice."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {programmes.map((p) => {
          const active = selected === p.id;
          return (
            <article
              key={p.id}
              className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-black/[0.08] bg-white"
              }`}
            >
              <p
                className={`text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${
                  active ? "text-white/50" : "text-muted"
                }`}
              >
                {p.ageLabel}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {p.name}
              </h2>
              <p
                className={`mt-2 text-sm font-medium ${
                  active ? "text-white/80" : "text-slate"
                }`}
              >
                {p.tagline}
              </p>
              <p
                className={`mt-4 flex-1 text-sm leading-relaxed ${
                  active ? "text-white/65" : "text-slate"
                }`}
              >
                {p.description}
              </p>
              <p
                className={`mt-3 text-xs ${
                  active ? "text-white/45" : "text-muted"
                }`}
              >
                {p.audienceNote}
              </p>
              <p
                className={`mt-4 text-sm font-semibold ${
                  active ? "text-white" : "text-ink"
                }`}
              >
                ${p.priceUsd} USD once
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => selectProgramme(p.id)}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-ink"
                      : "bg-ink text-white hover:bg-ink-soft"
                  }`}
                >
                  {active ? "Selected" : "Select programme"}
                </button>
                <Button
                  href={`/pricing#${p.id}`}
                  variant={active ? "light" : "ghost"}
                  className="w-full"
                >
                  Subscribe
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </LearnShell>
  );
}
