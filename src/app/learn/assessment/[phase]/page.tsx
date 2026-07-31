"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import {
  buildAssessmentItems,
  LIKERT_LABELS,
} from "@/lib/lms/curriculum";
import { scoreAttempt } from "@/lib/lms/scoring";
import {
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { constructs } from "@/lib/content";

export default function AssessmentRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const phase = (params.phase === "post" ? "post" : "pre") as "pre" | "post";

  const [state, setState] = useState<LocalLmsState | null>(null);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  useEffect(() => {
    setState(loadLmsState());
  }, []);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const items = useMemo(
    () => buildAssessmentItems(programmeId),
    [programmeId]
  );

  const constructIds = constructs.map((c) => c.id);
  const currentConstruct = constructIds[step];
  const stepItems = items.filter((i) => i.constructId === currentConstruct);
  const constructMeta = constructs.find((c) => c.id === currentConstruct);

  function setValue(itemId: string, value: number) {
    setResponses((r) => ({ ...r, [itemId]: value }));
  }

  function canContinue() {
    return stepItems.every((i) => responses[i.id] >= 1 && responses[i.id] <= 5);
  }

  function submit() {
    const result = scoreAttempt(items, responses);
    const next = loadLmsState();
    next.attempts = next.attempts.filter((a) => a.phase !== phase);
    next.attempts.push({
      phase,
      programmeId,
      responses,
      result,
      completedAt: new Date().toISOString(),
    });
    saveLmsState(next);
    setState(next);
    router.push("/learn/report");
  }

  if (!state) {
    return (
      <LearnShell title="Assessment">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title={
        phase === "pre"
          ? "Step 3 · Measure your baseline"
          : "Step 5 · Re-measure after the programme"
      }
      subtitle={
        phase === "pre"
          ? `${programme?.name ?? "Programme"} · ${items.length} items across six constructs. Rate each statement from 1–5—your honest starting profile.`
          : `${programme?.name ?? "Programme"} · Same ${items.length} items as your baseline. Take this after finishing all courses so you can see real growth.`
      }
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {constructs.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition ${
              i === step
                ? "bg-ink text-white"
                : "border border-black/[0.08] bg-white text-slate hover:text-ink"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="learn-card !p-4 sm:!p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: constructMeta?.color }}
          />
          <div>
            <h2 className="learn-card-title">{constructMeta?.name}</h2>
            <p className="learn-meta mt-0.5">{constructMeta?.tagline}</p>
          </div>
        </div>

        <div className="space-y-6">
          {stepItems.map((item) => (
            <fieldset
              key={item.id}
              className="border-b border-black/[0.05] pb-5 last:border-0 last:pb-0"
            >
              <legend className="text-[0.8125rem] font-medium leading-relaxed text-ink">
                {item.prompt}
              </legend>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => {
                  const selected = responses[item.id] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue(item.id, v)}
                      className={`rounded-lg border px-1 py-2.5 text-center text-[0.75rem] font-semibold transition sm:text-[0.8125rem] ${
                        selected
                          ? "border-ink bg-ink text-white"
                          : "border-black/[0.09] bg-[#f8f9fb] text-slate hover:border-ink/40"
                      }`}
                      title={LIKERT_LABELS[v - 1]}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div className="learn-meta mt-1.5 flex justify-between">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="learn-btn learn-btn-ghost disabled:opacity-40"
          >
            Back
          </button>
          {step < constructs.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStep((s) => s + 1)}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              Next construct
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !canContinue() || Object.keys(responses).length < items.length
              }
              onClick={submit}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              Submit & view report
            </button>
          )}
        </div>
        <p className="learn-meta mt-3">
          Step {step + 1} of {constructs.length} · Answer all items on this face
          to continue.
        </p>
      </div>
    </LearnShell>
  );
}
