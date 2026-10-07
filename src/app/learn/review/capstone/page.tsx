"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { PaywallCard } from "@/components/learn/PaywallCard";
import { RetrievalCheck } from "@/components/learn/session/RetrievalCheck";
import { useLocalField } from "@/components/learn/session/useLocalField";
import { track } from "@/lib/analytics";
import { constructs, type ConstructId } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import { formatDateZA } from "@/lib/datetime";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { capstoneCheck } from "@/lib/lms/review";
import { CAPSTONE } from "@/lib/lms/sessions/capstone";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

type Plan = Partial<Record<ConstructId, { answer: string; when: string; then: string }>>;

export default function CapstonePage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);
  const programmeId = (state?.subscription?.programmeId || state?.user?.programmeId || "adults") as ProgrammeId;
  const kids = programmeId === "kids";
  const cap = CAPSTONE[programmeId];
  const [plan, setPlan] = useLocalField<Plan>(`capstone:${programmeId}`, {});
  const [doneAt, setDoneAt] = useLocalField<string | null>(`capstone-done:${programmeId}`, null);
  const locked = state ? !hasFullPathwayAccess(state) : false;
  const name = state?.profile?.displayName || state?.user?.fullName || "";

  function update(c: ConstructId, k: "answer" | "when" | "then", v: string) {
    const cur = plan[c] ?? { answer: "", when: "", then: "" };
    setPlan({ ...plan, [c]: { ...cur, [k]: v } });
  }
  const filled = constructs.filter((c) => plan[c.id]?.when?.trim() && plan[c.id]?.then?.trim()).length;

  return (
    <LearnShell
      title={`Capstone · ${cap.title}`}
      subtitle={kids ? "Use all six faces in one story." : "One realistic case. Six faces. One personal leadership plan."}
    >
      <PaywallCard />
      {!locked && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5 print:hidden" aria-labelledby="cap-warm">
            <h2 id="cap-warm" className="learn-eyebrow">Warm-up · one question per face</h2>
            <div className="mt-3">
              <RetrievalCheck questions={capstoneCheck(programmeId)} color="#111111" storageKey="capstone" kids={kids} context={{ capstone: "1", programmeId }} />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="cap-case">
            <h2 id="cap-case" className="learn-eyebrow">The case</h2>
            <p className={`mt-2 leading-relaxed text-ink ${kids ? "text-[1rem]" : "text-[0.9375rem]"}`}>{cap.scenario}</p>
          </section>

          <section aria-labelledby="cap-plan" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="cap-plan" className="text-[1rem] font-semibold text-ink">
                  {name ? `${name}'s` : "My"} leadership plan
                </h2>
                <p className="learn-meta">{cap.planIntro} Saved on this device as you type.</p>
              </div>
              <p className="learn-meta tabular-nums" aria-live="polite">{filled}/6 faces planned</p>
            </div>
            {constructs.map((c) => {
              const v = plan[c.id] ?? { answer: "", when: "", then: "" };
              return (
                <article
                  key={c.id}
                  className="break-inside-avoid rounded-2xl border border-line bg-elevated p-4"
                  style={{ boxShadow: `inset 4px 0 0 ${c.color}`, ...faceInkStyle(c.color) }}
                >
                  <h3 className="face-ink text-[0.8125rem] font-bold uppercase tracking-wider">{c.name}</h3>
                  <p className="mt-1 text-[0.875rem] leading-snug text-ink">{cap.prompts[c.id]}</p>
                  <label className="mt-2 block text-[0.75rem] font-semibold text-ink">
                    My thinking
                    <textarea rows={2} className="learn-input mt-1 min-h-[3.5rem] resize-y" value={v.answer} onChange={(e) => update(c.id, "answer", e.target.value)} />
                  </label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label className="block text-[0.75rem] font-semibold text-ink">
                      If…
                      <input className="learn-input mt-1" value={v.when} onChange={(e) => update(c.id, "when", e.target.value)} />
                    </label>
                    <label className="block text-[0.75rem] font-semibold text-ink">
                      …then I will
                      <input className="learn-input mt-1" value={v.then} onChange={(e) => update(c.id, "then", e.target.value)} />
                    </label>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              className="learn-btn learn-btn-primary"
              disabled={filled < 6}
              onClick={() => {
                setDoneAt(new Date().toISOString());
                track("review_complete", { capstone: "1", programmeId });
              }}
            >
              {doneAt ? "Update my plan" : "Complete the capstone"}
            </button>
            <button type="button" className="learn-btn learn-btn-secondary" onClick={() => window.print()}>
              Print or save as PDF
            </button>
            <Link href="/learn/assessment/post" className="learn-btn learn-btn-ghost">
              Go to the after-test
            </Link>
            <span className="learn-meta" role="status">
              {doneAt ? `Completed ${formatDateZA(doneAt)}` : filled < 6 ? "Plan all six faces to complete." : ""}
            </span>
          </div>
        </div>
      )}
    </LearnShell>
  );
}
