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
    <div className="grid gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`learn-choice ${
              selected ? "learn-choice-active" : ""
            }`}
          >
            <span className="block text-[0.8125rem] font-semibold">
              {opt.label}
            </span>
            {opt.hint && (
              <span
                className={`mt-0.5 block text-[0.7rem] leading-snug ${
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
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  const complete = isOrientationComplete(responses);

  return (
    <LearnShell
      title="Step 2 · Orient your mind"
      subtitle="Before the six-face baseline: map how you already think about leadership—philosophy, theory, and models. We meet you where you are."
    >
      <section className="learn-card mb-5 sm:mb-6">
        <p className="learn-eyebrow">How leadership knowledge is layered</p>
        <h2 className="learn-card-title mt-1.5 sm:text-base">
          Philosophy → theory → model
        </h2>
        <p className="learn-body mt-2 max-w-3xl">{LEVEL_RELATIONSHIP}</p>

        <div className="mt-4 grid gap-2.5 md:grid-cols-3">
          {LEVEL_LADDER.map((level, i) => (
            <article key={level.id} className="learn-card-muted !p-3.5">
              <p className="learn-eyebrow">
                {i + 1}. {level.tier}
              </p>
              <h3 className="learn-label mt-1">{level.title}</h3>
              <p className="mt-0.5 text-[0.7rem] font-medium text-slate">
                {level.short}
              </p>
              <p className="learn-body-sm mt-2">{level.description}</p>
              <p className="learn-meta mt-2">{level.examples}</p>
            </article>
          ))}
        </div>

        <p className="learn-body mt-4 rounded-xl border border-black/[0.06] bg-[#f5f7fa] px-3.5 py-2.5">
          <strong className="font-semibold text-ink">Why this matters:</strong>{" "}
          Super-Cube® is a leadership <em>model</em> grounded in theory and
          philosophy. We first need to know whether you already hold a
          philosophy, draw on theories, use models—or are just beginning—so we
          can meet you at the right level.
        </p>
      </section>

      <div className="space-y-3.5">
        <section className="learn-card">
          <h3 className="learn-card-title">
            1. Do you know anything about leadership models?
          </h3>
          <p className="learn-meta mt-1">
            Named frameworks people use to lead (for example Super-Cube®, GROW,
            situational grids).
          </p>
          <div className="mt-3">
            <ChoiceGroup<YesSomeNo>
              name="knowsModels"
              value={responses.knowsModels}
              onChange={(v) => patch("knowsModels", v)}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  hint: "I can name or describe models",
                },
                { value: "some", label: "A little", hint: "I’ve heard of some" },
                {
                  value: "no",
                  label: "Not really",
                  hint: "This is new to me",
                },
              ]}
            />
          </div>
        </section>

        <section className="learn-card">
          <h3 className="learn-card-title">
            2. Do you use leadership models?
          </h3>
          <p className="learn-meta mt-1">
            In work, school, sport, family, or community—do you apply a model on
            purpose?
          </p>
          <div className="mt-3">
            <ChoiceGroup<YesSomeNo>
              name="usesModels"
              value={responses.usesModels}
              onChange={(v) => patch("usesModels", v)}
              options={[
                {
                  value: "yes",
                  label: "Yes",
                  hint: "I use models regularly",
                },
                {
                  value: "some",
                  label: "Sometimes",
                  hint: "Occasionally or informally",
                },
                {
                  value: "no",
                  label: "No",
                  hint: "I don’t use named models yet",
                },
              ]}
            />
          </div>
        </section>

        <section className="learn-card">
          <h3 className="learn-card-title">
            3. Which best describes your current perspective?
          </h3>
          <p className="learn-meta mt-1">
            Choose the layer you most often think from when you lead or talk
            about leadership.
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
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
                  className={`learn-choice ${
                    selected ? "learn-choice-active" : ""
                  }`}
                >
                  <span className="block text-[0.8125rem] font-semibold">
                    {opt.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[0.7rem] leading-snug ${
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

        <section className="learn-card">
          <h3 className="learn-card-title">
            4. Assess your depth at each level
          </h3>
          <p className="learn-meta mt-1">
            Be honest—this is not a test. It tells us whether you hold a
            philosophy, a theory view, a model view, or are still forming one.
          </p>

          <div className="mt-4 space-y-5">
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
                <p className="learn-label">{row.title}</p>
                <p className="learn-body mt-0.5">{row.prompt}</p>
                <div className="mt-2.5">
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

        <section className="learn-card">
          <h3 className="learn-card-title">
            5. Optional — name any you know
          </h3>
          <p className="learn-meta mt-1">
            Philosophies, theories, or models you already use or have heard of
            (comma-separated is fine).
          </p>
          <textarea
            value={responses.knownExamples}
            onChange={(e) => patch("knownExamples", e.target.value)}
            rows={3}
            placeholder="e.g. servant leadership, transformational theory, Super-Cube…"
            className="learn-input mt-3 resize-y"
          />
        </section>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="learn-meta">
            {complete
              ? "Ready to save. You’ll see your perspective, then continue to the construct pre-assessment."
              : "Answer questions 1–4 to continue."}
          </p>
          <button
            type="button"
            disabled={!complete}
            onClick={submit}
            className="learn-btn learn-btn-primary disabled:opacity-40"
          >
            Save orientation & continue
          </button>
        </div>
      </div>
    </LearnShell>
  );
}
