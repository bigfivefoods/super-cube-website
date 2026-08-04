"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { constructs, type ConstructId } from "@/lib/content";
import { track } from "@/lib/analytics";
import {
  CHECKIN_QUESTIONS,
  SCALE_LABELS,
  WEEKDAY_SHORT,
  countAnsweredFaces,
  monthGrid,
  scoresFromAnswers,
  weekDaysAround,
} from "@/lib/lms/daily-checkin";
import {
  getFacePulses,
  saveFacePulse,
} from "@/lib/lms/face-tracking";
import { localDayKey, loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { pushCoachProgressIfConsented } from "@/lib/lms/push-coach-progress";
import {
  LearnCard,
  LearnCardBody,
  LearnPageActions,
  LearnPageHeader,
} from "@/components/learn/LearnPage";

type Answers = Partial<Record<ConstructId, (number | undefined)[]>>;
type Step = "day" | "faces" | "note" | "done";

function emptyAnswers(): Answers {
  const a: Answers = {};
  for (const c of constructs) a[c.id] = [undefined, undefined, undefined];
  return a;
}

function loadAnswersForDay(state: LocalLmsState, day: string): Answers {
  const pulse = getFacePulses(state).find((p) => p.date === day);
  const base = emptyAnswers();
  if (!pulse) return base;
  if (pulse.questions) {
    for (const c of constructs) {
      const q = pulse.questions[c.id];
      if (q?.length) base[c.id] = [q[0], q[1], q[2]];
    }
    return base;
  }
  for (const c of constructs) {
    const s = pulse.scores[c.id];
    if (typeof s === "number") base[c.id] = [s, s, s];
  }
  return base;
}

export function DailyCheckInPanel({
  state,
  onSaved,
}: {
  state: LocalLmsState;
  onSaved?: (next: LocalLmsState) => void;
}) {
  const today = localDayKey();
  const [step, setStep] = useState<Step>("day");
  const [selectedDay, setSelectedDay] = useState(today);
  const [faceIndex, setFaceIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() =>
    loadAnswersForDay(state, today)
  );
  const [note, setNote] = useState("");
  const [showMonth, setShowMonth] = useState(false);
  const [calCursor, setCalCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const pulses = useMemo(() => getFacePulses(state), [state]);
  const pulseDates = useMemo(() => new Set(pulses.map((p) => p.date)), [pulses]);
  const week = useMemo(() => weekDaysAround(new Date(), 6, 0), []);
  const monthCells = monthGrid(calCursor.y, calCursor.m);

  useEffect(() => {
    const s = loadLmsState();
    setAnswers(loadAnswersForDay(s, selectedDay));
    const p = getFacePulses(s).find((x) => x.date === selectedDay);
    setNote(p?.note ?? "");
  }, [selectedDay]);

  const answeredFaces = countAnsweredFaces(answers);
  const canSave = answeredFaces >= 3;
  const face = constructs[faceIndex]!;
  const row = answers[face.id] ?? [];
  const faceQsDone = row.filter(
    (v) => typeof v === "number" && v >= 1 && v <= 5
  ).length;
  const stepNum = step === "day" ? 1 : step === "faces" ? 2 : step === "note" ? 3 : 4;

  function setAnswer(qi: number, value: number) {
    setAnswers((prev) => {
      const r = [...(prev[face.id] ?? [undefined, undefined, undefined])];
      r[qi] = value;
      return { ...prev, [face.id]: r };
    });
  }

  function save() {
    if (!canSave) return;
    const scores = scoresFromAnswers(answers);
    const questions: Partial<Record<ConstructId, number[]>> = {};
    for (const c of constructs) {
      const r = (answers[c.id] ?? []).filter(
        (v): v is number => typeof v === "number"
      );
      if (r.length) questions[c.id] = r;
    }
    let focusFace: ConstructId | undefined;
    let lowest = 99;
    for (const [id, sc] of Object.entries(scores)) {
      if (typeof sc === "number" && sc < lowest) {
        lowest = sc;
        focusFace = id as ConstructId;
      }
    }
    const next = saveFacePulse({
      date: selectedDay,
      scores,
      questions,
      focusFace,
      note,
      source: "daily",
    });
    onSaved?.(next);
    setStep("done");
    track("face_pulse_save", {
      source: "daily",
      faces: answeredFaces,
      day: selectedDay,
      rich: true,
      wizard: true,
    });
    if (next.shareProgressWithCoach && next.orgCode) {
      void pushCoachProgressIfConsented(next);
    }
  }

  /* ── Page 1: pick day ── */
  if (step === "day") {
    return (
      <div className="space-y-5">
        <LearnPageHeader
          kicker="Check-in"
          title="Which day are you logging?"
          description="Tap a day on the week strip, or open the full calendar. Then rate the six faces."
          step={1}
          stepTotal={4}
        />
        <LearnCard>
          <LearnCardBody>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                This week
              </p>
              <button
                type="button"
                onClick={() => setShowMonth((v) => !v)}
                className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
              >
                {showMonth ? "Hide calendar" : "Full calendar"}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d) => {
                const key = localDayKey(d);
                const selected = key === selectedDay;
                const logged = pulseDates.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={`flex flex-col items-center rounded-2xl px-1 py-2.5 transition ${
                      selected
                        ? "bg-ink text-white shadow-md"
                        : "bg-[#f4f4f4] text-ink hover:bg-black/[0.06]"
                    }`}
                  >
                    <span
                      className={`text-[0.6rem] font-semibold uppercase ${
                        selected ? "text-white/55" : "text-muted"
                      }`}
                    >
                      {WEEKDAY_SHORT[d.getDay()]}
                    </span>
                    <span className="mt-0.5 text-sm font-semibold tabular-nums">
                      {d.getDate()}
                    </span>
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        logged
                          ? selected
                            ? "bg-emerald-300"
                            : "bg-emerald-500"
                          : selected
                            ? "bg-white/25"
                            : "bg-black/10"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {showMonth && (
              <div className="mt-4 rounded-2xl border border-black/[0.07] bg-[#fafafa] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-sm font-semibold"
                    onClick={() =>
                      setCalCursor((c) => {
                        const m = c.m - 1;
                        return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m };
                      })
                    }
                  >
                    ←
                  </button>
                  <p className="text-sm font-semibold">
                    {new Date(calCursor.y, calCursor.m).toLocaleString(
                      undefined,
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-sm font-semibold"
                    onClick={() =>
                      setCalCursor((c) => {
                        const m = c.m + 1;
                        return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m };
                      })
                    }
                  >
                    →
                  </button>
                </div>
                <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[0.6rem] font-semibold text-muted">
                  {WEEKDAY_SHORT.map((w, i) => (
                    <span key={`${w}${i}`}>{w}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((d, i) => {
                    if (!d) return <span key={`e${i}`} />;
                    const key = localDayKey(d);
                    const selected = key === selectedDay;
                    const logged = pulseDates.has(key);
                    const future = key > today;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={future}
                        onClick={() => {
                          setSelectedDay(key);
                          setShowMonth(false);
                        }}
                        className={`aspect-square rounded-xl text-[0.75rem] font-semibold disabled:opacity-30 ${
                          selected
                            ? "bg-ink text-white"
                            : logged
                              ? "bg-emerald-50 ring-1 ring-emerald-200"
                              : "bg-white hover:bg-black/[0.04]"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </LearnCardBody>
        </LearnCard>
        <LearnPageActions
          primary={{
            label: "Next · rate faces →",
            onClick: () => {
              setFaceIndex(0);
              setStep("faces");
            },
          }}
          tertiary={{ href: "/learn", label: "Back to Today" }}
        />
      </div>
    );
  }

  /* ── Page 2: one face at a time ── */
  if (step === "faces") {
    return (
      <div className="space-y-5">
        <LearnPageHeader
          kicker={`${face.name} · face ${faceIndex + 1} of 6`}
          title="Rate this face"
          description="Three quick sliders. Be honest—this is developmental, not a test."
          step={2}
          stepTotal={4}
        />

        <LearnCard>
          <div
            className="h-1.5 w-full"
            style={{ background: face.color }}
            aria-hidden
          />
          <LearnCardBody>
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{ background: face.color }}
              >
                {face.shortName.slice(0, 1)}
              </span>
              <div>
                <p className="text-base font-semibold text-ink">{face.name}</p>
                <p className="text-[0.75rem] text-muted">
                  {faceQsDone}/3 answered · {answeredFaces}/6 faces ready
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {CHECKIN_QUESTIONS[face.id].map((q, qi) => {
                const val = row[qi];
                return (
                  <div key={q.id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[0.875rem] font-medium leading-snug text-ink">
                        {q.prompt}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#f4f4f4] px-2.5 py-0.5 text-[0.75rem] font-semibold tabular-nums">
                        {typeof val === "number" ? val : "—"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={typeof val === "number" ? val : 3}
                      onChange={(e) => setAnswer(qi, Number(e.target.value))}
                      onPointerDown={() => {
                        if (typeof val !== "number") setAnswer(qi, 3);
                      }}
                      className="mt-3 w-full"
                      style={{ accentColor: face.color }}
                      aria-label={q.prompt}
                    />
                    <div className="mt-1 flex justify-between text-[0.6rem] text-muted">
                      <span>{SCALE_LABELS[0]}</span>
                      <span>{SCALE_LABELS[4]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Face jump dots */}
            <div className="mt-6 flex justify-center gap-1.5">
              {constructs.map((c, i) => {
                const done =
                  (answers[c.id] ?? []).filter(
                    (v) => typeof v === "number"
                  ).length >= 2;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFaceIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === faceIndex ? "w-6 bg-ink" : done ? "w-2 bg-ink/40" : "w-2 bg-black/15"
                    }`}
                    aria-label={c.name}
                  />
                );
              })}
            </div>
          </LearnCardBody>
        </LearnCard>

        <LearnPageActions
          primary={{
            label:
              faceIndex < constructs.length - 1
                ? "Next face →"
                : "Next · journal →",
            onClick: () => {
              if (faceIndex < constructs.length - 1) {
                setFaceIndex((i) => i + 1);
              } else {
                setStep("note");
              }
            },
          }}
          secondary={{
            label: faceIndex === 0 ? "Back · day" : "Previous face",
            onClick: () => {
              if (faceIndex === 0) setStep("day");
              else setFaceIndex((i) => i - 1);
            },
          }}
        />
      </div>
    );
  }

  /* ── Page 3: note + save ── */
  if (step === "note") {
    return (
      <div className="space-y-5">
        <LearnPageHeader
          kicker="Journal"
          title="Anything to capture?"
          description="Optional free text. Private on this device. Then save your check-in."
          step={3}
          stepTotal={4}
        />
        <LearnCard>
          <LearnCardBody>
            <p className="text-sm text-slate">
              <span className="font-semibold text-ink">{answeredFaces} faces</span>{" "}
              rated for{" "}
              <span className="font-semibold text-ink">{selectedDay}</span>
              {!canSave && (
                <span className="mt-1 block text-amber-800">
                  Rate at least 3 faces (2+ sliders each) before saving.
                </span>
              )}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="What mattered most about how you led? One win, one friction, one intention…"
              className="learn-input mt-4 w-full resize-y text-sm"
            />
          </LearnCardBody>
        </LearnCard>
        <LearnPageActions
          primary={{
            label: pulseDates.has(selectedDay)
              ? "Update check-in"
              : "Save check-in",
            onClick: save,
            disabled: !canSave,
          }}
          secondary={{
            label: "Back · faces",
            onClick: () => {
              setFaceIndex(constructs.length - 1);
              setStep("faces");
            },
          }}
        />
      </div>
    );
  }

  /* ── Page 4: done ── */
  return (
    <div className="space-y-5">
      <LearnPageHeader
        kicker="Complete"
        title="Check-in saved"
        description="Patterns will sharpen as you log more days. Choose your next page."
        step={4}
        stepTotal={4}
      />
      <LearnCard tone="ink">
        <LearnCardBody>
          <p className="text-sm leading-relaxed text-white/75">
            Logged for <span className="font-semibold text-white">{selectedDay}</span>
            . {answeredFaces} faces captured
            {note ? " with a journal note" : ""}.
          </p>
        </LearnCardBody>
      </LearnCard>
      <LearnPageActions
        primary={{ href: "/learn/practice", label: "Micro-practice →" }}
        secondary={{ href: "/learn/courses", label: "Continue learning" }}
        tertiary={{ href: "/learn", label: "Back to Today" }}
      />
      <p className="text-center">
        <button
          type="button"
          className="text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          onClick={() => {
            setStep("day");
            setFaceIndex(0);
          }}
        >
          Log another day
        </button>
      </p>
      <p className="text-center">
        <Link
          href="/learn/report"
          className="text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          View progress report
        </Link>
      </p>
    </div>
  );
}
