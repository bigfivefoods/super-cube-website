"use client";

import { useEffect, useMemo, useState } from "react";
import { LikertQuestion, SjtQuestion } from "@/components/learn/AssessmentItems";
import { RadarChart } from "@/components/learn/RadarChart";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import {
  buildInstrumentItems,
  honestyItem,
  INSTRUMENT_LABELS,
  instrumentSummary,
  observerItems,
  scaleLabelsFor,
} from "@/lib/lms/instruments";
import { OBSERVER_DONT_KNOW, SJT_INSTRUCTIONS, SJT_WEIGHT, V2_SCALE } from "@/lib/lms/instruments/v2-bank";
import { attentionItem, itemsForFace, qualityFlags, QUALITY_FLAG_LABELS } from "@/lib/lms/integrity";
import { scoreAttempt } from "@/lib/lms/scoring";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

const FORMS: { id: ProgrammeId; label: string }[] = [
  { id: "adults", label: "Adults" },
  { id: "adolescents", label: "Teens (Adolescents)" },
  { id: "kids", label: "Kids" },
];
type Tab = "take" | "bank" | "observer";
const SEED = 20261007;

/**
 * Admin-only sandbox for instrument v2. Everything stays in this browser tab:
 * nothing is written to lms_attempts, so taking it never creates or changes a
 * baseline.
 */
export function InstrumentV2Preview() {
  const [tab, setTab] = useState<Tab>("take");
  const [form, setForm] = useState<ProgrammeId>("adults");
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [startedAt] = useState(() => Date.now());

  // Deep links for review and screenshots: ?form=kids&tab=bank&step=1&sample=1
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get("form");
    if (f === "adults" || f === "adolescents" || f === "kids") setForm(f);
    const t = q.get("tab");
    if (t === "bank" || t === "observer" || t === "take") setTab(t);
    const st = Number(q.get("step"));
    if (Number.isInteger(st) && st >= 0 && st < 6) setStep(st);
  }, []);

  const items = useMemo(() => buildInstrumentItems(form, "v2"), [form]);
  const attention = attentionItem(form, "v2");
  const honesty = honestyItem(form);
  const faceIds = constructs.map((c) => c.id);
  const face = constructs[step];
  const shown = useMemo(() => itemsForFace(items, faceIds, face.id, SEED, attention), [items, face.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = items.length + 2;
  const answered = Object.keys(responses).length;
  const summary = instrumentSummary(form, "v2");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("sample") === "1") fillSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  function reset(next: ProgrammeId) {
    setForm(next);
    setStep(0);
    setResponses({});
    setDone(false);
  }

  function fillSample() {
    // A plausible, varied pattern so the results view can be reviewed quickly
    const r: Record<string, number> = {};
    items.forEach((i, k) => {
      if (i.itemType === "sjt") r[i.id] = (i.options?.findIndex((o) => o.key === 4) ?? 0) + 1 - (k % 3 === 0 ? 1 : 0) || 1;
      else r[i.id] = i.reverse ? 2 + (k % 2) : 3 + (k % 3 === 0 ? 0 : 1);
    });
    r[attention.id] = 4;
    r[honesty.id] = 4;
    setResponses(r);
    setDone(true);
  }

  const faceComplete = shown.every((i) => responses[i.id] != null) && (step < 5 || responses[honesty.id] != null);
  const result = useMemo(() => scoreAttempt(items, responses), [items, responses]);
  const flags = qualityFlags({
    scoredValues: items.filter((i) => i.itemType !== "sjt").map((i) => responses[i.id]),
    attentionValue: responses[attention.id],
    durationMs: Date.now() - startedAt,
    honestyValue: responses[honesty.id],
  });

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Preview sections">
        {(
          [
            ["take", "Take v2"],
            ["bank", "Item bank"],
            ["observer", "Observer (360) form"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold ${
              tab === id ? "bg-void text-void-fg" : "border border-line bg-elevated text-slate"
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-[0.8125rem] font-medium text-ink" htmlFor="v2-form">
          Form
        </label>
        <select
          id="v2-form"
          value={form}
          onChange={(e) => reset(e.target.value as ProgrammeId)}
          className="min-h-10 rounded-xl border border-line-strong bg-elevated px-3 text-[0.8125rem] text-ink"
        >
          {FORMS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <span className="learn-meta">
          {summary.likert} statements ({summary.reverse} reverse-keyed) · {summary.sjt} situations · attention + honesty checks
        </span>
      </div>

      {tab === "take" && !done && (
        <section className="mt-4 rounded-2xl border border-line bg-elevated p-4 sm:p-6" aria-labelledby="v2-face-h">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.75rem] font-semibold text-ink">
              Face {step + 1} of 6 · {answered}/{total} answered
            </p>
            <button type="button" className="text-[0.75rem] font-semibold text-ink underline" onClick={fillSample}>
              Skip to a sample result
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${Math.round((answered / total) * 100)}%` }} />
          </div>
          <div className="mt-5 flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: face.color }} aria-hidden />
            <div>
              <h2 id="v2-face-h" className="text-[1rem] font-semibold tracking-tight text-ink">
                {face.name}
              </h2>
              <p className="learn-meta">{face.tagline}</p>
            </div>
          </div>
          <p className="learn-meta mt-3">
            How often is each statement true of you? ({V2_SCALE[form].join(" · ")})
          </p>
          <div className="mt-4 space-y-6">
            {shown.map((item) =>
              item.itemType === "sjt" && item.options ? (
                <SjtQuestion
                  key={item.id}
                  id={item.id}
                  scenario={item.prompt}
                  options={item.options}
                  value={responses[item.id]}
                  onChange={(v) => setResponses((r) => ({ ...r, [item.id]: v }))}
                  instruction={SJT_INSTRUCTIONS[form]}
                  color={face.color}
                />
              ) : (
                <LikertQuestion
                  key={item.id}
                  id={item.id}
                  prompt={item.prompt}
                  value={responses[item.id]}
                  onChange={(v) => setResponses((r) => ({ ...r, [item.id]: v }))}
                  labels={scaleLabelsFor(item)}
                />
              ),
            )}
            {step === 5 && (
              <LikertQuestion
                id={honesty.id}
                prompt={honesty.prompt}
                value={responses[honesty.id]}
                onChange={(v) => setResponses((r) => ({ ...r, [honesty.id]: v }))}
                labels={honesty.labels}
              />
            )}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button type="button" className="learn-btn learn-btn-ghost disabled:opacity-40" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
            {step < 5 ? (
              <button type="button" className="learn-btn learn-btn-primary disabled:opacity-40" disabled={!faceComplete} onClick={() => setStep((s) => s + 1)}>
                Next face
              </button>
            ) : (
              <button type="button" className="learn-btn learn-btn-primary disabled:opacity-40" disabled={!faceComplete} onClick={() => setDone(true)}>
                See my v2 result
              </button>
            )}
          </div>
        </section>
      )}

      {tab === "take" && done && (
        <section className="mt-4 space-y-4" aria-labelledby="v2-res-h">
          <div className="rounded-2xl border border-line bg-elevated p-4 sm:p-6">
            <p className="learn-eyebrow">Preview result · not saved</p>
            <h2 id="v2-res-h" className="mt-1 text-xl font-semibold tracking-tight text-ink">
              Overall {result.overall} · {getProgramme(form)?.name}
            </h2>
            <p className="learn-meta mt-1">
              Face score = {Math.round((1 - SJT_WEIGHT) * 100)}% statements (reverse-keyed items flipped) +{" "}
              {Math.round(SJT_WEIGHT * 100)}% situations (provisional expert key).
            </p>
            {flags.length > 0 && (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.8125rem] text-amber-900" role="status">
                Data-quality flags: {flags.map((f) => QUALITY_FLAG_LABELS[f]).join(" · ")}
              </p>
            )}
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <RadarChart scores={result.constructScores} table="visible" />
              <table className="w-full self-start text-left text-[0.8125rem]">
                <caption className="sr-only">Score parts per face</caption>
                <thead>
                  <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.08em] text-muted">
                    <th scope="col" className="py-2 pr-2">Face</th>
                    <th scope="col" className="px-1 py-2 text-right">Statements</th>
                    <th scope="col" className="px-1 py-2 text-right">Situations</th>
                    <th scope="col" className="py-2 pl-1 text-right">Face</th>
                  </tr>
                </thead>
                <tbody>
                  {result.constructScores.map((c) => (
                    <tr key={c.constructId} className="border-b border-line last:border-0">
                      <th scope="row" className="face-ink py-2 pr-2 font-semibold" style={faceInkStyle(c.color)}>
                        {c.name}
                      </th>
                      <td className="px-1 py-2 text-right tabular-nums">{c.likertScore ?? "—"}</td>
                      <td className="px-1 py-2 text-right tabular-nums">{c.sjtScore ?? "—"}</td>
                      <td className="py-2 pl-1 text-right font-semibold tabular-nums">{c.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-elevated p-4 sm:p-6">
            <h3 className="text-[1rem] font-semibold text-ink">Situations: your choice and the provisional key</h3>
            <p className="learn-meta mt-1">Learners never see the key during an attempt. It is shown here so you can review it.</p>
            <div className="mt-4 space-y-3">
              {items
                .filter((i) => i.itemType === "sjt")
                .map((i) => {
                  const f = constructs.find((c) => c.id === i.constructId)!;
                  return (
                    <SjtQuestion
                      key={i.id}
                      id={`${i.id}-rev`}
                      scenario={i.prompt}
                      options={i.options!}
                      value={responses[i.id]}
                      onChange={() => undefined}
                      instruction={`${f.name} · ${i.skill}`}
                      reveal
                      color={f.color}
                    />
                  );
                })}
            </div>
          </div>
          <button type="button" className="learn-btn learn-btn-ghost" onClick={() => reset(form)}>
            Start again
          </button>
        </section>
      )}

      {tab === "bank" && <BankView form={form} />}
      {tab === "observer" && <ObserverView form={form} />}
    </div>
  );
}

function BankView({ form }: { form: ProgrammeId }) {
  const items = buildInstrumentItems(form, "v2");
  return (
    <section className="mt-4 space-y-4" aria-label="Item bank">
      <p className="learn-meta">
        {INSTRUMENT_LABELS.v2}. <strong>R</strong> = reverse-keyed (scored 6 − answer). Situations show the provisional
        1–4 effectiveness key.
      </p>
      {constructs.map((c) => (
        <div key={c.id} className="rounded-2xl border border-line bg-elevated p-4" style={{ boxShadow: `inset 4px 0 0 ${c.color}` }}>
          <h3 className="face-ink text-[1rem] font-semibold" style={faceInkStyle(c.color)}>
            {c.name}
          </h3>
          <ol className="mt-2 space-y-1.5 text-[0.8125rem] text-ink">
            {items
              .filter((i) => i.constructId === c.id)
              .map((i) => (
                <li key={i.id} className="flex gap-2">
                  <span className="w-8 shrink-0 font-mono text-[0.6875rem] text-muted">{i.id.split("-").pop()}</span>
                  <span className="min-w-0">
                    {i.itemType === "sjt" ? (
                      <>
                        <strong>Situation:</strong> {i.prompt}
                        <ul className="mt-1 list-disc pl-5 text-slate">
                          {i.options!.map((o) => (
                            <li key={o.value}>
                              {o.text} <span className="font-semibold text-ink">[key {o.key}]</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        {i.prompt}{" "}
                        {i.reverse && <span className="rounded bg-black/[0.06] px-1 text-[0.6875rem] font-bold">R</span>}
                      </>
                    )}
                    <span className="ml-1 text-[0.6875rem] text-muted">· {i.skill}</span>
                  </span>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

function ObserverView({ form }: { form: ProgrammeId }) {
  const [name, setName] = useState("Thandi");
  const roles =
    form === "adults"
      ? ["Manager", "Peer", "Direct report"]
      : ["Teacher", "Parent or guardian", "Coach or mentor"];
  const [role, setRole] = useState(roles[0]);
  const items = observerItems(form, name);
  return (
    <section className="mt-4 rounded-2xl border border-line bg-elevated p-4 sm:p-6" aria-label="Observer form preview">
      <div className="flex flex-wrap gap-3">
        <label className="text-[0.8125rem] font-medium text-ink">
          Learner&apos;s first name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block min-h-10 rounded-xl border border-line-strong bg-surface px-3 text-[0.8125rem]"
          />
        </label>
        <label className="text-[0.8125rem] font-medium text-ink">
          Rater
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block min-h-10 rounded-xl border border-line-strong bg-surface px-3 text-[0.8125rem]"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="learn-meta mt-3">
        {role} view · {items.length} statements · same frequency scale as the self form, plus &ldquo;{OBSERVER_DONT_KNOW}&rdquo;
        (not scored). Groups are only shown to the learner once at least 3 raters in that group have answered; a manager
        is shown separately and is told so before answering.
      </p>
      <ol className="mt-4 space-y-2 text-[0.8125rem] text-ink">
        {items.map((i, k) => {
          const f = constructs.find((c) => c.id === i.constructId)!;
          return (
            <li key={i.id} className="flex gap-2">
              <span className="w-6 shrink-0 tabular-nums text-muted">{k + 1}.</span>
              <span>
                {i.prompt}{" "}
                <span className="face-ink text-[0.6875rem] font-semibold" style={faceInkStyle(f.color)}>
                  {f.name}
                </span>
                {i.reverse && <span className="ml-1 rounded bg-black/[0.06] px-1 text-[0.6875rem] font-bold">R</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
