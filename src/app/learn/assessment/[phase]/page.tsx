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
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title={`${phase === "pre" ? "Pre" : "Post"}-assessment`}
      subtitle={`${programme?.name ?? "Programme"} · ${items.length} items across six constructs. Rate each statement from 1–5.`}
    >
      {/* Progress */}
      <div className="mb-6 flex flex-wrap gap-2">
        {constructs.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              i === step
                ? "bg-ink text-white"
                : "border border-black/[0.08] bg-white text-slate hover:text-ink"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: constructMeta?.color }}
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {constructMeta?.name}
            </h2>
            <p className="text-sm text-muted">{constructMeta?.tagline}</p>
          </div>
        </div>

        <div className="space-y-8">
          {stepItems.map((item) => (
            <fieldset key={item.id} className="border-b border-black/[0.06] pb-6 last:border-0">
              <legend className="text-sm font-medium leading-relaxed text-ink sm:text-base">
                {item.prompt}
              </legend>
              <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((v) => {
                  const selected = responses[item.id] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue(item.id, v)}
                      className={`rounded-lg border px-1 py-3 text-center text-xs font-semibold transition sm:text-sm ${
                        selected
                          ? "border-ink bg-ink text-white"
                          : "border-black/[0.1] bg-[#fafafa] text-slate hover:border-ink/40"
                      }`}
                      title={LIKERT_LABELS[v - 1]}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[0.65rem] text-muted">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-full border border-black/[0.12] px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Back
          </button>
          {step < constructs.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next construct
            </button>
          ) : (
            <button
              type="button"
              disabled={!canContinue() || Object.keys(responses).length < items.length}
              onClick={submit}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Submit & view report
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          Step {step + 1} of {constructs.length} · Answer all items on this face
          to continue.
        </p>
      </div>
    </LearnShell>
  );
}
