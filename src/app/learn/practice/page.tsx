"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs, type ConstructId } from "@/lib/content";
import { getMicroPracticesFor } from "@/lib/lms/micro-practices";
import { deriveFacePattern, recommendPractice } from "@/lib/lms/face-tracking";
import {
  loadLmsState,
  logMicroPractice,
  practiceDoneToday,
  type LocalLmsState,
} from "@/lib/lms/store";
import { track } from "@/lib/analytics";
import { recordHabit } from "@/lib/lms/cloud";
import { learnerProgrammeId, programmeCopy } from "@/lib/lms/programme-copy";

export default function MicroPracticePage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setState(loadLmsState());
    track("page_view", { path: "/learn/practice" });
  }, []);

  if (!state) {
    // The page is prerendered: today's pick depends on the date and this device's
    // check-ins, so render it only after mount (no server/client mismatch, React #418).
    return (
      <LearnShell title="Micro-practice" subtitle={programmeCopy("practice.subtitle", learnerProgrammeId(null))}>
        <div className="h-72 animate-pulse rounded-2xl border border-line bg-elevated motion-reduce:animate-none" aria-busy="true" aria-label="Loading today’s practice" />
      </LearnShell>
    );
  }
  return <PracticeView state={state} setState={setState} done={done} setDone={setDone} note={note} setNote={setNote} />;
}

function PracticeView({
  state,
  setState,
  done,
  setDone,
  note,
  setNote,
}: {
  state: LocalLmsState;
  setState: (s: LocalLmsState) => void;
  done: boolean;
  setDone: (v: boolean) => void;
  note: string;
  setNote: (v: string) => void;
}) {
  const pattern = useMemo(() => deriveFacePattern(state), [state]);

  const weakest = pattern.weakest as ConstructId[];

  const daily = useMemo(() => recommendPractice(state), [state]);

  // The learner's local day (shared helper), the same day the streak uses.
  const already = practiceDoneToday(state, daily.id) || done;

  function complete() {
    logMicroPractice(daily.id);
    void recordHabit("practice_complete", daily.id).then(() => setState(loadLmsState()));
    setState(loadLmsState());
    setDone(true);
    track("micro_practice_complete", {
      id: daily.id,
      construct: daily.constructId,
    });
  }

  const meta = constructs.find((c) => c.id === daily.constructId);
  const more = weakest.flatMap((id) => getMicroPracticesFor(id)).slice(0, 4);

  return (
    <LearnShell
      title="Micro-practice"
      subtitle={programmeCopy("practice.subtitle", learnerProgrammeId(state))}
    >
      {pattern.insight && (
        <p className="mb-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-[0.8125rem] text-slate">
          {pattern.insight}{" "}
          <Link
            href="/learn/pulse"
            className="font-semibold text-ink underline"
          >
            Track faces →
          </Link>
        </p>
      )}

      <section
        className="rounded-2xl border border-ink bg-elevated p-5 sm:p-6"
        style={meta ? { boxShadow: `inset 4px 0 0 ${meta.color}` } : undefined}
      >
        <p className="learn-eyebrow">
          Today · {daily.minutes} min · {meta?.name ?? daily.constructId}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
          {daily.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          {daily.prompt}
        </p>
        <p className="mt-3 text-[0.8125rem] text-muted">
          <span className="font-semibold text-ink">Reflect: </span>
          {daily.reflection}
        </p>
        <label className="mt-4 block">
          <span className="text-[0.75rem] font-semibold text-muted">
            Optional note (stays on device)
          </span>
          <textarea
            className="learn-input mt-1 min-h-[4.5rem] w-full"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One sentence…"
          />
        </label>
        <button
          type="button"
          disabled={already}
          onClick={complete}
          className="learn-btn learn-btn-primary mt-4 disabled:opacity-50"
        >
          {already ? "Done for today ✓" : "Mark practice complete"}
        </button>
      </section>

      {more.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-ink">
            More for your stretch faces
          </h3>
          <ul className="mt-3 space-y-2">
            {more.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm"
              >
                <span className="font-semibold text-ink">{p.title}</span>
                <span className="text-muted"> · {p.minutes}m</span>
                <p className="mt-0.5 text-[0.75rem] text-slate">{p.prompt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </LearnShell>
  );
}
