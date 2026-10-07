"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { PaywallCard } from "@/components/learn/PaywallCard";
import { RetrievalCheck } from "@/components/learn/session/RetrievalCheck";
import { loadMisses, useLocalField } from "@/components/learn/session/useLocalField";
import { track } from "@/lib/analytics";
import { constructs } from "@/lib/content";
import { formatDateZA } from "@/lib/datetime";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { buildReview, reviewSchedule, REVIEW_DAYS, type ReviewDay } from "@/lib/lms/review";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

export default function ReviewPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [open, setOpen] = useState<ReviewDay | null>(null);
  const [misses, setMisses] = useState<string[]>([]);
  const [now, setNow] = useState(0);
  const [done, setDone] = useLocalField<Record<string, string>>("reviews-done", {});

  useEffect(() => {
    setState(loadLmsState());
    setNow(Date.now());
    setMisses(Object.values(loadMisses()).flat());
    const d = Number(new URLSearchParams(window.location.search).get("day"));
    if ((REVIEW_DAYS as readonly number[]).includes(d)) setOpen(d as ReviewDay);
  }, []);

  const programmeId = (state?.subscription?.programmeId || state?.user?.programmeId || "adults") as ProgrammeId;
  const kids = programmeId === "kids";
  const pre = state?.attempts.find((a) => a.phase === "pre" && a.programmeId === programmeId) ?? state?.attempts.find((a) => a.phase === "pre");
  const schedule = reviewSchedule(pre?.completedAt);
  const questions = useMemo(() => (open ? buildReview(programmeId, open, misses) : []), [open, programmeId, misses]);
  const locked = state ? !hasFullPathwayAccess(state) : false;

  function finish(day: ReviewDay) {
    setDone({ ...done, [String(day)]: new Date().toISOString() });
    track("review_complete", { day: String(day), programmeId });
    setOpen(null);
    window.history.replaceState(null, "", "/learn/review");
  }

  return (
    <LearnShell
      title="Spaced review"
      subtitle={
        kids
          ? "Little memory games on Day 3, 7 and 14 help you remember what you learned."
          : "Three short reviews across your 21 days. Spacing practice out and mixing the faces is one of the most reliable ways to make learning last."
      }
    >
      <PaywallCard />
      {!locked && open === null && (
        <>
          <ol className="grid gap-3 sm:grid-cols-3" data-testid="review-schedule">
            {schedule.map(({ day, due }) => {
              const completed = done[String(day)];
              const isDue = due ? due.getTime() <= now : false;
              return (
                <li key={day} className="rounded-2xl border border-line bg-elevated p-4">
                  <p className="learn-eyebrow">Day {day}</p>
                  <p className="mt-1 text-[0.9375rem] font-semibold text-ink">
                    {day === 3 ? "First recall" : day === 7 ? "Mix it up" : "Lock it in"}
                  </p>
                  <p className="learn-meta mt-0.5">
                    {completed
                      ? `Done ${formatDateZA(completed)}`
                      : due
                        ? isDue
                          ? `Due since ${formatDateZA(due)}`
                          : `Due ${formatDateZA(due)}`
                        : "Starts after your baseline"}
                    {" · "}
                    {kids ? "4 questions" : "6 questions · ~3 min"}
                  </p>
                  <button
                    type="button"
                    className={`learn-btn mt-3 ${completed ? "learn-btn-ghost" : isDue ? "learn-btn-primary" : "learn-btn-secondary"}`}
                    onClick={() => {
                      setOpen(day);
                      window.history.replaceState(null, "", `/learn/review?day=${day}`);
                    }}
                  >
                    {completed ? "Do it again" : isDue ? "Start review" : "Start early"}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 rounded-2xl border border-line bg-elevated p-4 sm:p-5">
            <p className="learn-eyebrow">Before your after-test</p>
            <p className="mt-1 text-[0.9375rem] font-semibold text-ink">Capstone: all six faces at once</p>
            <p className="learn-meta mt-0.5">
              {kids
                ? "One story where you use all six faces, and a plan to keep growing."
                : "One realistic case that needs every face, ending in a personal leadership plan you can print. Best done in your third week."}
            </p>
            <Link href="/learn/review/capstone" className="learn-btn learn-btn-primary mt-3">
              Open the capstone
            </Link>
          </div>
        </>
      )}

      {!locked && open !== null && (
        <section aria-labelledby="review-h" className="rounded-2xl border border-line bg-elevated p-4 sm:p-5">
          <p className="learn-eyebrow">Day {open} review</p>
          <h2 id="review-h" className="mt-1 text-[1rem] font-semibold text-ink">
            {kids ? "What do you remember?" : "Mixed recall across the six faces"}
          </h2>
          <p className="learn-meta mb-3 mt-0.5">
            {misses.length
              ? "Questions you found tricky come first."
              : "Answer from memory first. Each question shows its face."}
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5" aria-label="Faces in this review">
            {questions.map((q, i) => {
              const c = constructs.find((x) => x.id === q.constructId);
              return (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: c?.color }} aria-hidden="true" />
                  {i + 1}. {c?.name}
                </span>
              );
            })}
          </div>
          <RetrievalCheck
            key={open}
            questions={questions}
            color="#111111"
            storageKey={`review-${open}`}
            kids={kids}
            context={{ review: String(open), programmeId }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="learn-btn learn-btn-primary" onClick={() => finish(open)}>
              Finish review
            </button>
            <button
              type="button"
              className="learn-btn learn-btn-ghost"
              onClick={() => {
                setOpen(null);
                window.history.replaceState(null, "", "/learn/review");
              }}
            >
              Back
            </button>
          </div>
        </section>
      )}
    </LearnShell>
  );
}
