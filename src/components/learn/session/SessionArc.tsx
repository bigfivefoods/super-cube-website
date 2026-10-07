"use client";

import { useEffect, useState, type ReactNode } from "react";
import { renderBody, renderInline } from "@/components/learn/LessonContent";
import { SessionReflection } from "@/components/learn/SessionReflection";
import type { ConstructId } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import { ARC_STEPS, sessionNotes, type ResolvedArc } from "@/lib/lms/sessions";
import type { ProgrammeId } from "@/lib/programmes";
import { FacilitatorGuide } from "./FacilitatorGuide";
import { RetrievalCheck } from "./RetrievalCheck";
import { useLocalField } from "./useLocalField";

const AUDIENCE: Record<ProgrammeId, string> = {
  adults: "workplace groups",
  adolescents: "classes and youth groups",
  kids: "classes and families",
};

export function SessionNotes({ programmeId, constructId }: { programmeId: ProgrammeId; constructId: ConstructId }) {
  const notes = sessionNotes(programmeId, constructId);
  if (!notes.length) return null;
  const label = { safety: "Health note", inclusive: "Everyone welcome", kids: "With a grown-up" } as const;
  return (
    <div className="mb-3.5 space-y-2" data-testid="session-notes">
      {notes.map((n) => (
        <p
          key={n.tone}
          className={`rounded-xl border px-3 py-2 text-[0.75rem] leading-snug ${
            n.tone === "safety"
              ? "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100"
              : "border-line bg-elevated text-slate"
          }`}
        >
          <strong className="font-semibold">{label[n.tone]}:</strong> {n.text}
        </p>
      ))}
    </div>
  );
}

function Step({
  id,
  n,
  label,
  color,
  children,
  tight = false,
}: {
  id: string;
  n: number;
  label: string;
  color: string;
  children: ReactNode;
  tight?: boolean;
}) {
  return (
    <section
      id={`step-${id}`}
      aria-labelledby={`step-${id}-h`}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-elevated"
      data-step={id}
    >
      <header className="flex items-center gap-2.5 px-3.5 pt-3 sm:px-5 sm:pt-4">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold tabular-nums text-white"
          style={{ background: color }}
        >
          {n}
        </span>
        <h2 id={`step-${id}-h`} className="learn-eyebrow face-ink">
          <span className="sr-only">Step {n} of 8: </span>
          {label}
        </h2>
      </header>
      <div className={`px-3.5 sm:px-5 ${tight ? "pb-3 pt-1.5" : "pb-4 pt-2 sm:pb-5"}`}>{children}</div>
    </section>
  );
}

function splitIfThen(s: string): { when: string; then: string } {
  const m = /^If (.+?), then I will (.+?)\.?$/i.exec(s.trim());
  return m ? { when: m[1], then: m[2] } : { when: "", then: s };
}

function IfThenPlanner({ suggestion, lessonId, color, kids }: { suggestion: string; lessonId: string; color: string; kids: boolean }) {
  const initial = splitIfThen(suggestion);
  const [plan, setPlan] = useLocalField(`ifthen:${lessonId}`, initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);
  return (
    <div>
      <p className="text-[0.8125rem] leading-relaxed text-slate">
        {kids
          ? "A plan that starts with \u201cif\u201d helps your brain remember what to do."
          : "Plans written as \u201cIf [situation], then I will [action]\u201d make follow-through much more likely than good intentions alone. Use ours or make it yours."}
      </p>
      <form
        className="mt-3 grid gap-2 rounded-xl p-3"
        style={{ background: `${color}12` }}
        onSubmit={(e) => {
          e.preventDefault();
          setPlan({ when: plan.when.trim(), then: plan.then.trim() });
          setSaved(true);
        }}
      >
        <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
          If…
          <input
            className="learn-input"
            value={plan.when}
            onChange={(e) => setPlan({ ...plan, when: e.target.value })}
            placeholder="the situation or cue"
          />
        </label>
        <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
          …then I will
          <input
            className="learn-input"
            value={plan.then}
            onChange={(e) => setPlan({ ...plan, then: e.target.value })}
            placeholder="the specific action"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="learn-btn learn-btn-primary text-white" style={{ background: color }}>
            Save my plan
          </button>
          <button type="button" className="learn-btn learn-btn-ghost" onClick={() => setPlan(initial)}>
            Use the suggestion
          </button>
          <span className="learn-meta" role="status">
            {saved ? "Saved on this device" : ""}
          </span>
        </div>
      </form>
    </div>
  );
}

function PracticeTick({ lessonId, text, color, kids }: { lessonId: string; text: string; color: string; kids: boolean }) {
  const [done, setDone] = useLocalField(`practice:${lessonId}`, false);
  return (
    <div>
      <p className="text-[0.875rem] leading-relaxed text-ink">{text}</p>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] font-medium text-ink">
        <input
          type="checkbox"
          className="h-4 w-4"
          style={{ accentColor: color }}
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
        />
        {kids ? "I tried it!" : "I've done this, or put it in my calendar with a real date"}
      </label>
    </div>
  );
}

/** The eight-step session (content v2). */
export function SessionArc({
  arc,
  lessonId,
  color,
  colorSoft,
  programmeId,
  constructId,
}: {
  arc: ResolvedArc;
  lessonId: string;
  color: string;
  colorSoft: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
}) {
  const kids = programmeId === "kids";
  const [active, setActive] = useState<string>("hook");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive((vis[0].target as HTMLElement).dataset.step || "hook");
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lessonId]);

  return (
    <div style={faceInkStyle(color)} data-testid="session-arc">
      <SessionNotes programmeId={programmeId} constructId={constructId} />

      <nav aria-label="Session steps" className="-mx-1 mb-3 overflow-x-auto px-1 pb-1">
        <ol className="flex min-w-max gap-1.5">
          {ARC_STEPS.map((s, i) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#step-${s.id}`}
                  aria-current={on ? "step" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold transition ${
                    on ? "text-white" : "border-line bg-elevated text-slate hover:text-ink"
                  }`}
                  style={on ? { background: color, borderColor: color } : undefined}
                >
                  <span className="tabular-nums">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="space-y-3">
        <Step id="hook" n={1} label="Hook" color={color}>
          <p
            className={`border-l-4 pl-3 font-semibold leading-snug text-ink ${kids ? "text-[1.0625rem]" : "text-[0.9375rem] sm:text-[1rem]"}`}
            style={{ borderColor: color }}
          >
            {arc.hook}
          </p>
        </Step>

        <Step id="core" n={2} label="Core idea" color={color}>
          <div className={`space-y-1 ${kids ? "[&_p]:text-[0.9375rem] [&_li]:text-[0.9375rem]" : ""}`}>{renderBody(arc.core)}</div>
        </Step>

        <Step id="example" n={3} label={kids ? "A story" : "Real-world example"} color={color}>
          <figure className="rounded-xl p-3.5 sm:p-4" style={{ background: colorSoft }}>
            <figcaption className="text-[0.875rem] font-semibold tracking-tight text-ink">{arc.example.title}</figcaption>
            <p className={`mt-1.5 leading-relaxed text-ink/90 ${kids ? "text-[0.9375rem]" : "text-[0.8125rem]"}`}>{arc.example.body}</p>
            {arc.example.source && (
              <p className="mt-2 text-[0.6875rem] leading-snug text-slate">
                Source: {renderInline(arc.example.source)}
              </p>
            )}
          </figure>
        </Step>

        <Step id="reflect" n={4} label="Reflect" color={color}>
          <p className="text-[0.875rem] font-medium leading-relaxed text-ink">{arc.reflect}</p>
          <p className="learn-meta mt-1.5">
            {kids ? "Talk about it with your grown-up." : "Take a minute to think. You can capture your answer in the journal at step 8."}
          </p>
        </Step>

        <Step id="practice" n={5} label="Micro-practice" color={color}>
          <PracticeTick lessonId={lessonId} text={arc.practice} color={color} kids={kids} />
        </Step>

        <Step id="ifthen" n={6} label="If–then plan" color={color}>
          <IfThenPlanner suggestion={arc.ifThen} lessonId={lessonId} color={color} kids={kids} />
        </Step>

        <Step id="check" n={7} label={kids ? "Quick quiz" : "Check your understanding"} color={color}>
          <p className="learn-meta mb-3">
            {kids ? "Pick an answer. It's OK to get it wrong. That's how we learn!" : "Answer from memory. You'll get feedback straight away."}
          </p>
          <RetrievalCheck
            questions={arc.check}
            color={color}
            storageKey={lessonId}
            kids={kids}
            context={{ lessonId, constructId, programmeId }}
          />
        </Step>

        <Step id="journal" n={8} label="Journal" color={color} tight>
          <SessionReflection lessonId={lessonId} constructId={constructId} color={color} journalPrompt={arc.journal} embedded />
        </Step>
      </div>

      <FacilitatorGuide guide={arc.guide} audience={AUDIENCE[programmeId]} />
    </div>
  );
}
