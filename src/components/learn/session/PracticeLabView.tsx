"use client";

import { SessionReflection } from "@/components/learn/SessionReflection";
import type { ConstructId } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import type { PracticeLab } from "@/lib/lms/curriculum";
import type { ProgrammeId } from "@/lib/programmes";
import { SessionNotes } from "./SessionArc";
import { useLocalField } from "./useLocalField";

/** Practice lab: one real challenge planned with WOOP, then a checklist. */
export function PracticeLabView({
  lab,
  lessonId,
  color,
  colorSoft,
  programmeId,
  constructId,
}: {
  lab: PracticeLab;
  lessonId: string;
  color: string;
  colorSoft: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
}) {
  const kids = programmeId === "kids";
  const [woop, setWoop] = useLocalField<Record<string, string>>(`woop:${lessonId}`, {});
  const [ticks, setTicks] = useLocalField<boolean[]>(`lab:${lessonId}`, lab.checklist.map(() => false));
  const done = ticks.filter(Boolean).length;

  return (
    <div className="space-y-3" style={faceInkStyle(color)} data-testid="practice-lab">
      <SessionNotes programmeId={programmeId} constructId={constructId} />
      <section className="rounded-2xl border border-line bg-elevated p-3.5 sm:p-5" aria-labelledby="lab-challenge">
        <h2 id="lab-challenge" className="learn-eyebrow face-ink">This week&apos;s challenge</h2>
        <p className={`mt-1.5 font-semibold leading-snug text-ink ${kids ? "text-[1rem]" : "text-[0.9375rem]"}`}>{lab.challenge}</p>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-3.5 sm:p-5" aria-labelledby="lab-woop">
        <h2 id="lab-woop" className="learn-eyebrow face-ink">{kids ? "Make a plan" : "Plan it with WOOP"}</h2>
        <p className="learn-meta mt-1">
          {kids
            ? "Four little steps to help you do it."
            : "Wish, Outcome, Obstacle, Plan: picture the goal, then name what could get in the way and decide in advance how you'll handle it."}
        </p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {lab.woop.map((w, i) => (
            <li key={w.id} className="rounded-xl p-3" style={{ background: colorSoft }}>
              <label className="grid gap-1.5">
                <span className="text-[0.75rem] font-bold uppercase tracking-wider text-ink">
                  <span className="tabular-nums">{i + 1}</span> · {w.label}
                </span>
                <span className="text-[0.8125rem] leading-snug text-ink/90">{w.prompt}</span>
                <textarea
                  rows={2}
                  className="learn-input min-h-[3.5rem] resize-y bg-white/80 dark:bg-black/30"
                  value={woop[w.id] ?? ""}
                  onChange={(e) => setWoop({ ...woop, [w.id]: e.target.value })}
                />
              </label>
            </li>
          ))}
        </ol>
        <p className="learn-meta mt-2">Saved on this device as you type.</p>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-3.5 sm:p-5" aria-labelledby="lab-check">
        <h2 id="lab-check" className="learn-eyebrow face-ink">
          Success checklist · <span className="tabular-nums">{done}/{lab.checklist.length}</span>
        </h2>
        <ul className="mt-2 space-y-1.5">
          {lab.checklist.map((c, i) => (
            <li key={c}>
              <label className="flex cursor-pointer items-start gap-2 text-[0.8125rem] leading-snug text-ink">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ accentColor: color }}
                  checked={Boolean(ticks[i])}
                  onChange={(e) => {
                    const next = lab.checklist.map((_, j) => (j === i ? e.target.checked : Boolean(ticks[j])));
                    setTicks(next);
                  }}
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <SessionReflection
        lessonId={lessonId}
        constructId={constructId}
        color={color}
        journalPrompt={kids ? "What happened when you tried it?" : "What did I try, what happened, and what will I keep doing?"}
        embedded
      />
    </div>
  );
}
