"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import {
  isOrientationComplete,
  LEVEL_LADDER,
  LEVEL_RELATIONSHIP,
  ORIENTATION_EMPTY,
  scoreOrientation,
  type LeadershipLevel,
  type OrientationResponses,
  type YesEmergingNo,
  type YesSomeNo,
} from "@/lib/lms/orientation";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";

function ChoiceGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              selected
                ? "border-ink bg-ink text-white"
                : "border-black/[0.1] bg-[#fafafa] text-ink hover:border-ink/40"
            }`}
          >
            <span className="block text-sm font-semibold">{opt.label}</span>
            {opt.hint && (
              <span
                className={`mt-1 block text-xs ${
                  selected ? "text-white/75" : "text-muted"
                }`}
              >
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function OrientationAssessmentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [responses, setResponses] =
    useState<OrientationResponses>(ORIENTATION_EMPTY);

  useEffect(() => {
    const state = loadLmsState();
    if (state.orientation?.responses) {
      setResponses({ ...ORIENTATION_EMPTY, ...state.orientation.responses });
    }
    setReady(true);
  }, []);

  function patch<K extends keyof OrientationResponses>(
    key: K,
    value: OrientationResponses[K]
  ) {
    setResponses((r) => ({ ...r, [key]: value }));
  }

  function submit() {
    if (!isOrientationComplete(responses)) return;
    const result = scoreOrientation(responses);
    const next = loadLmsState();
    next.orientation = {
      responses,
      result,
      completedAt: new Date().toISOString(),
    };
    saveLmsState(next);
    router.push("/learn/assessment?from=orientation");
  }

  if (!ready) {
    return (
      <LearnShell title="Pre-pre assessment">
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  const complete = isOrientationComplete(responses);

  return (
    <LearnShell
      title="Pre-pre assessment"
      subtitle="Before the Super-Cube® construct baseline: map how you already think about leadership—philosophy, theory, and models."
    >
      {/* Teaching block */}
      <section className="mb-8 rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
          How leadership knowledge is layered
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Philosophy → theory → model
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate sm:text-base">
          {LEVEL_RELATIONSHIP}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {LEVEL_LADDER.map((level, i) => (
            <article
              key={level.id}
              className="relative overflow-hidden rounded-xl border border-black/[0.08] bg-[#fafafa] p-4 sm:p-5"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                {i + 1}. {level.tier}
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">
                {level.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate">{level.short}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {level.description}
              </p>
              <p className="mt-3 text-xs text-muted">{level.examples}</p>
            </article>
          ))}
        </div>

        <p className="mt-5 rounded-xl border border-black/[0.06] bg-[#f5f7fa] px-4 py-3 text-sm text-slate">
          <strong className="font-semibold text-ink">Why this matters:</strong>{" "}
          Super-Cube® is a leadership <em>model</em> grounded in theory and
          philosophy. We first need to know whether you already hold a
          philosophy, draw on theories, use models—or are just beginning—so we
          can meet you at the right level.
        </p>
      </section>

      <div className="space-y-6">
        {/* Q1 knowledge */}
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            1. Do you know anything about leadership models?
          </h3>
          <p className="mt-1 text-sm text-muted">
            Named frameworks people use to lead (for example Super-Cube®, GROW,
            situational grids).
          </p>
          <div className="mt-4">
            <ChoiceGroup<YesSomeNo>
              name="knowsModels"
              value={responses.knowsModels}
              onChange={(v) => patch("knowsModels", v)}
              options={[
                { value: "yes", label: "Yes", hint: "I can name or describe models" },
                { value: "some", label: "A little", hint: "I’ve heard of some" },
                { value: "no", label: "Not really", hint: "This is new to me" },
              ]}
            />
          </div>
        </section>

        {/* Q2 use */}
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            2. Do you use leadership models?
          </h3>
          <p className="mt-1 text-sm text-muted">
            In work, school, sport, family, or community—do you apply a model on
            purpose?
          </p>
          <div className="mt-4">
            <ChoiceGroup<YesSomeNo>
              name="usesModels"
              value={responses.usesModels}
              onChange={(v) => patch("usesModels", v)}
              options={[
                { value: "yes", label: "Yes", hint: "I use models regularly" },
                {
                  value: "some",
                  label: "Sometimes",
                  hint: "Occasionally or informally",
                },
                { value: "no", label: "No", hint: "I don’t use named models yet" },
              ]}
            />
          </div>
        </section>

        {/* Q3 primary perspective */}
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            3. Which best describes your current perspective?
          </h3>
          <p className="mt-1 text-sm text-muted">
            Choose the layer you most often think from when you lead or talk
            about leadership.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  value: "philosophy" as LeadershipLevel,
                  label: "Philosophy perspective",
                  hint: "High-level concepts & values — what leadership means to me",
                },
                {
                  value: "theory" as LeadershipLevel,
                  label: "Theory perspective",
                  hint: "Middle-level theories — how and why leadership works",
                },
                {
                  value: "model" as LeadershipLevel,
                  label: "Model perspective",
                  hint: "Concrete, absolute models — frameworks I can apply step by step",
                },
                {
                  value: "none" as LeadershipLevel,
                  label: "Not yet framed",
                  hint: "I don’t yet have a clear philosophy, theory, or model",
                },
              ] as const
            ).map((opt) => {
              const selected = responses.primaryPerspective === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => patch("primaryPerspective", opt.value)}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-ink bg-ink text-white"
                      : "border-black/[0.1] bg-[#fafafa] text-ink hover:border-ink/40"
                  }`}
                >
                  <span className="block text-sm font-semibold">{opt.label}</span>
                  <span
                    className={`mt-1 block text-xs leading-relaxed ${
                      selected ? "text-white/75" : "text-muted"
                    }`}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Q4 depth checks */}
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            4. Assess your depth at each level
          </h3>
          <p className="mt-1 text-sm text-muted">
            Be honest—this is not a test. It tells us whether you hold a
            philosophy, a theory view, a model view, or are still forming one.
          </p>

          <div className="mt-6 space-y-6">
            {(
              [
                {
                  key: "hasPhilosophy" as const,
                  title: "Leadership philosophy (high level)",
                  prompt:
                    "Do you have a personal leadership philosophy—core beliefs about what good leadership is?",
                },
                {
                  key: "hasTheory" as const,
                  title: "Leadership theory (middle level)",
                  prompt:
                    "Do you draw on leadership theories that explain how leadership works?",
                },
                {
                  key: "hasModel" as const,
                  title: "Leadership model (applied / absolute)",
                  prompt:
                    "Do you use one or more concrete leadership models with clear parts you can practise?",
                },
              ] as const
            ).map((row) => (
              <div key={row.key}>
                <p className="text-sm font-semibold text-ink">{row.title}</p>
                <p className="mt-1 text-sm text-slate">{row.prompt}</p>
                <div className="mt-3">
                  <ChoiceGroup<YesEmergingNo>
                    name={row.key}
                    value={responses[row.key]}
                    onChange={(v) => patch(row.key, v)}
                    options={[
                      { value: "yes", label: "Yes — clear" },
                      { value: "emerging", label: "Emerging" },
                      { value: "no", label: "Not yet" },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Optional examples */}
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            5. Optional — name any you know
          </h3>
          <p className="mt-1 text-sm text-muted">
            Philosophies, theories, or models you already use or have heard of
            (comma-separated is fine).
          </p>
          <textarea
            value={responses.knownExamples}
            onChange={(e) => patch("knownExamples", e.target.value)}
            rows={3}
            placeholder="e.g. servant leadership, transformational theory, Super-Cube…"
            className="mt-4 w-full resize-y rounded-xl border border-black/[0.1] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none ring-ink/20 placeholder:text-muted focus:ring-2"
          />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {complete
              ? "Ready to save. You’ll see your perspective, then continue to the construct pre-assessment."
              : "Answer questions 1–4 to continue."}
          </p>
          <button
            type="button"
            disabled={!complete}
            onClick={submit}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save orientation & continue
          </button>
        </div>
      </div>
    </LearnShell>
  );
}
