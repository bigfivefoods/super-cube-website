"use client";

import { useMemo } from "react";
import { constructs } from "@/lib/content";
import { formatDateTimeZA } from "@/lib/datetime";
import {
  MIN_GROUP,
  atRiskLearners,
  faceImpact,
  funnel,
  overallImpact,
  roiCsv,
  type CohortLearner,
  type PairedResult,
} from "@/lib/lms/cohort-stats";
import { track } from "@/lib/analytics";

const f1 = (v: number) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : "—");
const sign = (v: number) => (v > 0 ? `+${f1(v)}` : f1(v));

function Cell({ r, which }: { r: PairedResult; which: "before" | "after" }) {
  const i = r[which];
  return (
    <>
      <span className="font-semibold tabular-nums text-ink">{f1(i.mean)}</span>
      <span className="block text-[0.6875rem] tabular-nums text-slate">
        {f1(i.low)}–{f1(i.high)}
      </span>
    </>
  );
}

/** Per-face before/after with CIs and Cohen's d, completion funnel, at-risk learners and the ROI pack. */
export function CohortImpact({
  roster,
  cohortName,
  cohortCode,
  now,
}: {
  roster: CohortLearner[];
  cohortName: string;
  cohortCode: string;
  now: number;
}) {
  const faces = useMemo(() => faceImpact(roster, constructs.map((c) => ({ id: c.id, name: c.name }))), [roster]);
  const overall = useMemo(() => overallImpact(roster), [roster]);
  const steps = useMemo(() => funnel(roster), [roster]);
  const risk = useMemo(() => atRiskLearners(roster, new Date(now)), [roster, now]);
  const learners = steps[0]?.count ?? 0;
  const generatedAt = formatDateTimeZA(now);

  function downloadCsv() {
    const csv = roiCsv({ cohortName, generatedAt, faces, overall, funnel: steps });
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `super-cube-impact-${cohortCode.replace(/[^A-Za-z0-9-]/g, "") || "cohort"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("cohort_roi_download", { format: "csv" });
  }

  async function downloadPdf() {
    const { downloadRoiPackPdf } = await import("@/lib/lms/roi-pdf");
    downloadRoiPackPdf({ cohortName, cohortCode, generatedAt, learners, faces, overall, funnel: steps, atRiskCount: risk.length });
    track("cohort_roi_download", { format: "pdf" });
  }

  return (
    <section className="learn-card min-w-0 lg:col-span-2" aria-labelledby="impact-h" data-testid="cohort-impact">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="impact-h" className="learn-card-title">
            Cohort impact
          </h2>
          <p className="learn-meta mt-0.5">
            {cohortName} · {learners} learner{learners === 1 ? "" : "s"} · consented scores only, never journals
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadCsv} className="learn-btn learn-btn-ghost" data-testid="roi-csv">
            Download CSV
          </button>
          <button type="button" onClick={() => void downloadPdf()} className="learn-btn learn-btn-primary" data-testid="roi-pdf">
            ROI pack (PDF)
          </button>
        </div>
      </div>

      <h3 className="mt-5 text-[0.875rem] font-semibold text-ink">Before and after, by face</h3>
      <p className="learn-meta mt-0.5">
        Paired learners only (baseline and re-measure). Means on a 0–100 scale with 95% confidence intervals; Cohen&apos;s
        d of 0.2 is small, 0.5 medium, 0.8 large. Faces with fewer than {MIN_GROUP} learners stay hidden.
      </p>
      {/* Phones: one card per face */}
      <ul className="mt-3 space-y-2 sm:hidden">
        {[...faces.map((f) => ({ key: f.id, name: f.name, r: f.result })), { key: "overall", name: "Overall", r: overall }].map(
          ({ key, name, r }) => (
            <li key={key} className={`rounded-xl border p-3 ${key === "overall" ? "border-ink/25 bg-surface" : "border-line"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[0.875rem] font-semibold text-ink">{name}</p>
                {r && (
                  <p className="text-[0.75rem] tabular-nums text-slate">
                    n {r.n}
                    {r.d != null && (
                      <>
                        {" "}
                        · d <span className="font-semibold text-ink">{r.d.toFixed(2)}</span> {r.label}
                      </>
                    )}
                  </p>
                )}
              </div>
              {r ? (
                <>
                  <p className="mt-1 text-[0.8125rem] tabular-nums text-ink">
                    {f1(r.before.mean)} <span aria-hidden>→</span>
                    <span className="sr-only">to</span> {f1(r.after.mean)}
                    <span className="font-semibold"> ({sign(r.change.mean)})</span>
                  </p>
                  <p className="text-[0.6875rem] tabular-nums text-slate">
                    95% CI of change {sign(r.change.low)} to {sign(r.change.high)} · before {f1(r.before.low)}–{f1(r.before.high)} · after{" "}
                    {f1(r.after.low)}–{f1(r.after.high)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[0.75rem] text-slate">Shown once {MIN_GROUP}+ learners have both measures</p>
              )}
            </li>
          ),
        )}
      </ul>
      <div className="mt-2 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.8125rem]" data-testid="impact-table">
          <caption className="sr-only">Before and after scores by face with 95% confidence intervals and Cohen&apos;s d</caption>
          <thead>
            <tr className="border-b border-line text-[0.6875rem] uppercase tracking-[0.08em] text-slate">
              <th scope="col" className="py-2 pr-3 font-semibold">Face</th>
              <th scope="col" className="py-2 pr-3 font-semibold">n</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Before</th>
              <th scope="col" className="py-2 pr-3 font-semibold">After</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Change (95% CI)</th>
              <th scope="col" className="py-2 font-semibold">Cohen&apos;s d</th>
            </tr>
          </thead>
          <tbody>
            {[...faces.map((f) => ({ key: f.id, name: f.name, r: f.result })), { key: "overall", name: "Overall", r: overall }].map(
              ({ key, name, r }) => (
                <tr key={key} className={`border-b border-line align-top ${key === "overall" ? "font-semibold" : ""}`} data-testid={`impact-${key}`}>
                  <th scope="row" className="py-2 pr-3 font-semibold text-ink">{name}</th>
                  {r ? (
                    <>
                      <td className="py-2 pr-3 tabular-nums text-ink">{r.n}</td>
                      <td className="py-2 pr-3"><Cell r={r} which="before" /></td>
                      <td className="py-2 pr-3"><Cell r={r} which="after" /></td>
                      <td className="py-2 pr-3">
                        <span className="font-semibold tabular-nums text-ink">{sign(r.change.mean)}</span>
                        <span className="block text-[0.6875rem] tabular-nums text-slate">
                          {sign(r.change.low)} to {sign(r.change.high)}
                        </span>
                      </td>
                      <td className="py-2 tabular-nums text-ink">
                        {r.d == null ? "—" : r.d.toFixed(2)}
                        {r.label && <span className="block text-[0.6875rem] font-normal text-slate">{r.label}</span>}
                      </td>
                    </>
                  ) : (
                    <td colSpan={5} className="py-2 text-slate">
                      Shown once {MIN_GROUP}+ learners have both measures
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-[0.875rem] font-semibold text-ink">Completion funnel</h3>
          <ol className="mt-2 space-y-1.5" data-testid="funnel">
            {steps.map((s) => (
              <li key={s.id}>
                <div className="flex items-baseline justify-between text-[0.8125rem]">
                  <span className="text-ink">{s.label}</span>
                  <span className="tabular-nums text-slate">
                    <span className="font-semibold text-ink">{s.count}</span> · {s.pct}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.07]" aria-hidden>
                  <div className="h-full rounded-full bg-ink" style={{ width: `${s.pct}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="text-[0.875rem] font-semibold text-ink">Who might need a check-in</h3>
          {risk.length === 0 ? (
            <p className="learn-meta mt-2">Nobody flagged right now.</p>
          ) : (
            <ul className="mt-2 space-y-2" data-testid="at-risk">
              {risk.map((r) => (
                <li key={r.userId} className="rounded-xl border border-line bg-surface p-3">
                  <p className="text-[0.875rem] font-semibold text-ink">{r.name}</p>
                  <ul className="mt-0.5 list-disc pl-4 text-[0.75rem] text-slate">
                    {r.reasons.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <p className="learn-meta mt-2">Flags are prompts for a supportive conversation, not a judgement.</p>
        </div>
      </div>
    </section>
  );
}
