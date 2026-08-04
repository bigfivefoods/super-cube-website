"use client";

import { useState } from "react";
import Link from "next/link";
import { constructs, type ConstructId } from "@/lib/content";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import {
  deriveFacePattern,
  pulseSeries,
} from "@/lib/lms/face-tracking";
import { getMicroPracticesFor } from "@/lib/lms/micro-practices";
import { buildAssessmentNarrative } from "@/lib/lms/narrative";
import type { LocalAttempt } from "@/lib/lms/store";
import type { LocalLmsState } from "@/lib/lms/store";

export function ConstructDeepDive({
  state,
  pre,
  post,
}: {
  state: LocalLmsState;
  pre: LocalAttempt;
  post?: LocalAttempt;
}) {
  const [open, setOpen] = useState<ConstructId | null>(null);
  const narrative = buildAssessmentNarrative(post?.result ?? pre.result);
  const pattern = deriveFacePattern(state);
  const series = pulseSeries(state, 14);

  return (
    <section className="learn-card mt-4 sm:mt-5 print:break-inside-avoid">
      <h2 className="learn-card-title">Construct deep-dive</h2>
      <p className="learn-meta mt-1">
        Tap a face for score history, insight, and practices.
      </p>
      <ul className="mt-3 space-y-2">
        {constructs.map((c) => {
          const face = narrative.faces.find((f) => f.constructId === c.id);
          const preScore = pre.result.constructScores.find(
            (s) => s.constructId === c.id
          )?.score;
          const postScore = post?.result.constructScores.find(
            (s) => s.constructId === c.id
          )?.score;
          const delta =
            preScore != null && postScore != null
              ? Math.round((postScore - preScore) * 10) / 10
              : null;
          const isOpen = open === c.id;
          const vals = series.map((s) => s.faces[c.id] ?? null);
          const practices = getMicroPracticesFor(c.id).slice(0, 2);

          return (
            <li
              key={c.id}
              className="rounded-xl border border-black/[0.06] bg-white"
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
                onClick={() => setOpen(isOpen ? null : c.id)}
                aria-expanded={isOpen}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {c.name}
                  </span>
                  <span className="text-[0.7rem] text-muted">
                    Pre {preScore ?? "—"}
                    {postScore != null ? ` · Post ${postScore}` : ""}
                    {delta != null
                      ? ` · ${delta > 0 ? "+" : ""}${delta}`
                      : ""}
                  </span>
                </span>
                <span className="text-sm font-semibold text-muted">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && face && (
                <div className="border-t border-black/[0.05] px-3 pb-3 pt-2">
                  <p className="text-[0.8125rem] font-semibold text-ink">
                    {face.headline}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-slate">
                    {face.insight}
                  </p>
                  <div className="mt-2">
                    <FaceSparkline values={vals} stroke={c.color} height={40} />
                  </div>
                  <p className="mt-2 text-[0.75rem] text-muted">
                    Pulse avg:{" "}
                    {pattern.averages[c.id] != null
                      ? Math.round(pattern.averages[c.id]!)
                      : "—"}{" "}
                    · Trend: {pattern.trend[c.id] ?? "unknown"}
                  </p>
                  <p className="mt-2 text-[0.8125rem] text-ink">
                    <span className="font-semibold">First practice · </span>
                    {face.firstPractice}
                  </p>
                  {practices.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {practices.map((p) => (
                        <li
                          key={p.id}
                          className="text-[0.75rem] text-slate"
                        >
                          · {p.title}
                          {p.minutes ? ` (${p.minutes} min)` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                    <Link
                      href={`/learn/courses/${c.id}`}
                      className="learn-btn learn-btn-ghost !min-h-8 !text-[0.75rem]"
                    >
                      Sessions
                    </Link>
                    <Link
                      href="/learn/practice"
                      className="learn-btn learn-btn-primary !min-h-8 !text-[0.75rem]"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
