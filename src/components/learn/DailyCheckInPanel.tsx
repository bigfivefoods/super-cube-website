"use client";

import { useEffect, useMemo, useState } from "react";
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
  getTodayPulse,
  saveFacePulse,
} from "@/lib/lms/face-tracking";
import { localDayKey, loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { pushCoachProgressIfConsented } from "@/lib/lms/push-coach-progress";

type Answers = Partial<Record<ConstructId, (number | undefined)[]>>;

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
      if (q?.length) {
        base[c.id] = [q[0], q[1], q[2]];
      }
    }
    return base;
  }
  // Legacy: single score → prefill all three
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
  const [selectedDay, setSelectedDay] = useState(today);
  const [answers, setAnswers] = useState<Answers>(() =>
    loadAnswersForDay(state, today)
  );
  const [note, setNote] = useState("");
  const [openFace, setOpenFace] = useState<ConstructId | "all" | null>("all");
  const [msg, setMsg] = useState<string | null>(null);
  const [showMonth, setShowMonth] = useState(false);
  const [calCursor, setCalCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const pulses = useMemo(() => getFacePulses(state), [state]);
  const pulseDates = useMemo(
    () => new Set(pulses.map((p) => p.date)),
    [pulses]
  );
  const week = useMemo(() => weekDaysAround(new Date(), 6, 0), []);

  useEffect(() => {
    const s = loadLmsState();
    setAnswers(loadAnswersForDay(s, selectedDay));
    const p = getFacePulses(s).find((x) => x.date === selectedDay);
    setNote(p?.note ?? "");
    setMsg(null);
  }, [selectedDay]);

  const answeredFaces = countAnsweredFaces(answers);
  const canSave = answeredFaces >= 3;
  const isToday = selectedDay === today;
  const existing = pulseDates.has(selectedDay);

  function setAnswer(face: ConstructId, qi: number, value: number) {
    setAnswers((prev) => {
      const row = [...(prev[face] ?? [undefined, undefined, undefined])];
      row[qi] = value;
      return { ...prev, [face]: row };
    });
  }

  function save() {
    if (!canSave) {
      setMsg("Rate at least 3 faces (2+ sliders each) to save.");
      return;
    }
    const scores = scoresFromAnswers(answers);
    const questions: Partial<Record<ConstructId, number[]>> = {};
    for (const c of constructs) {
      const row = (answers[c.id] ?? []).filter(
        (v): v is number => typeof v === "number"
      );
      if (row.length) questions[c.id] = row;
    }
    // Focus = lowest mean face
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
    setMsg(
      isToday
        ? "Today’s check-in saved. Patterns and practice will use this."
        : `Check-in for ${selectedDay} saved.`
    );
    track("face_pulse_save", {
      source: "daily",
      faces: answeredFaces,
      day: selectedDay,
      rich: true,
    });
    if (next.shareProgressWithCoach && next.orgCode) {
      void pushCoachProgressIfConsented(next);
    }
  }

  const monthCells = monthGrid(calCursor.y, calCursor.m);

  return (
    <section
      id="check-in"
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_20px_50px_-32px_rgba(10,10,10,0.35)]"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-black/[0.06] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a] px-5 py-6 text-white sm:px-7 sm:py-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30 blur-2xl"
          style={{
            background: `conic-gradient(${constructs.map((c) => c.color).join(",")})`,
          }}
          aria-hidden
        />
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/50">
          Daily check-in
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          How did you lead today?
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">
          Three quick sliders per face · optional free text. Pick a day on the
          calendar, rate honestly, save in under two minutes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[0.75rem]">
          <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-white/90">
            {answeredFaces}/6 faces rated
          </span>
          {existing && (
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 font-medium text-emerald-200">
              Saved for this day
            </span>
          )}
          {!isToday && (
            <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-white/70">
              Editing {selectedDay}
            </span>
          )}
        </div>
      </div>

      {/* Week strip */}
      <div className="border-b border-black/[0.06] px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-2">
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
            const isTod = key === today;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(key)}
                className={`flex flex-col items-center rounded-2xl px-1 py-2.5 text-center transition ${
                  selected
                    ? "bg-ink text-white shadow-md"
                    : "bg-[#f6f6f6] text-ink hover:bg-black/[0.06]"
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
                  title={logged ? "Logged" : isTod ? "Today" : "Empty"}
                />
              </button>
            );
          })}
        </div>

        {showMonth && (
          <div className="mt-4 rounded-2xl border border-black/[0.07] bg-[#fafafa] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-ink hover:bg-black/[0.05]"
                onClick={() =>
                  setCalCursor((c) => {
                    const m = c.m - 1;
                    return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m };
                  })
                }
              >
                ←
              </button>
              <p className="text-sm font-semibold text-ink">
                {new Date(calCursor.y, calCursor.m).toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-ink hover:bg-black/[0.05]"
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
                <span key={`${w}-${i}`}>{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((d, i) => {
                if (!d) return <span key={`e-${i}`} />;
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
                    className={`relative aspect-square rounded-xl text-[0.75rem] font-semibold transition disabled:opacity-30 ${
                      selected
                        ? "bg-ink text-white"
                        : logged
                          ? "bg-emerald-50 text-ink ring-1 ring-emerald-200"
                          : "bg-white text-ink hover:bg-black/[0.04]"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Faces + sliders */}
      <div className="space-y-2 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Six faces · 3 questions each
          </p>
          <button
            type="button"
            className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
            onClick={() =>
              setOpenFace((v) => (v === "all" ? null : "all"))
            }
          >
            {openFace === "all" ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {constructs.map((c) => {
          const open = openFace === "all" || openFace === c.id;
          const row = answers[c.id] ?? [];
          const filled = row.filter(
            (v) => typeof v === "number" && v >= 1 && v <= 5
          ).length;
          const filledVals = row.filter(
            (v): v is number => typeof v === "number" && v >= 1 && v <= 5
          );
          const mean =
            filledVals.length > 0
              ? Math.round(
                  (filledVals.reduce((a, b) => a + b, 0) / filledVals.length) *
                    10
                ) / 10
              : null;

          return (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[#fafafa]"
              style={{ boxShadow: open ? `inset 3px 0 0 ${c.color}` : undefined }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenFace((v) =>
                    v === c.id ? null : openFace === "all" ? c.id : c.id
                  )
                }
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left sm:px-4"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.7rem] font-bold text-white"
                  style={{ background: c.color }}
                >
                  {c.shortName.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {c.name}
                  </span>
                  <span className="block text-[0.7rem] text-muted">
                    {filled}/3 answered
                    {mean != null ? ` · avg ${mean.toFixed(1)}` : ""}
                  </span>
                </span>
                <span className="text-muted" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>

              {open && (
                <div className="space-y-4 border-t border-black/[0.05] bg-white px-3.5 py-4 sm:px-4">
                  {CHECKIN_QUESTIONS[c.id].map((q, qi) => {
                    const val = row[qi];
                    return (
                      <div key={q.id}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[0.8125rem] font-medium leading-snug text-ink">
                            {q.prompt}
                          </p>
                          <span className="shrink-0 rounded-full bg-[#f4f4f4] px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-ink">
                            {typeof val === "number" ? val : "—"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={typeof val === "number" ? val : 3}
                          onChange={(e) =>
                            setAnswer(c.id, qi, Number(e.target.value))
                          }
                          className="mt-2 w-full accent-current"
                          style={{ accentColor: c.color }}
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
              )}
            </div>
          );
        })}
      </div>

      {/* Free text */}
      <div className="border-t border-black/[0.06] px-4 py-4 sm:px-6">
        <label className="block">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Journal note (optional)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What mattered most about how you led today? Wins, friction, one intention for tomorrow…"
            className="learn-input mt-2 w-full resize-y text-sm"
          />
        </label>
      </div>

      {/* Save */}
      <div className="flex flex-col gap-3 border-t border-black/[0.06] bg-[#fafafa] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[0.75rem] leading-relaxed text-muted">
          Private on this device. Coach only sees scores if you opt in.
          {getTodayPulse(state) && isToday
            ? " Saving again updates today’s entry."
            : ""}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {existing ? "Update check-in" : "Save check-in"}
        </button>
      </div>
      {msg && (
        <p className="border-t border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-900 sm:px-6">
          {msg}
        </p>
      )}
    </section>
  );
}
