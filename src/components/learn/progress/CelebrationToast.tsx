"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLmsState } from "@/components/learn/useLearnState";
import { constructs, type ConstructId } from "@/lib/content";
import { earnedProgressBadges, PROGRESS_BADGES, progression } from "@/lib/lms/progression";
import { learnerProgrammeId } from "@/lib/lms/programme-copy";
import { loadLmsState, markCelebrated } from "@/lib/lms/store";
import { CELEBRATE_EVENT } from "./ProgressCube";

type Toast = { title: string; detail: string; color: string; face?: ConstructId };

const TIER_WORD = ["", "first light", "glowing", "bright", "fully lit"];

/**
 * Celebrates each new level, face light and badge once, with a short,
 * quiet animation (none at all with prefers-reduced-motion).
 */
export function CelebrationToast() {
  const trigger = useLmsState();
  const pathname = usePathname();
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Read the stored state directly: the hook can briefly hold the empty server snapshot.
    const state = loadLmsState();
    const pid = learnerProgrammeId(state) ?? "adults";
    const v = progression(state);
    const badges = earnedProgressBadges(state, pid);
    const now = new Date().toISOString();
    if (state.celebratedLevel === undefined) {
      // First visit after this feature shipped: remember where the learner is, celebrate from here on.
      markCelebrated({ celebratedLevel: v.level.level.n, celebratedTiers: v.tiers, progressBadges: Object.fromEntries(badges.map((b) => [b, now])) });
      return;
    }
    const events: Toast[] = [];
    if (v.level.level.n > state.celebratedLevel) {
      events.push({ title: `Level up: ${v.level.level.name}`, detail: v.level.level.line, color: "#0a0a0a" });
    }
    for (const c of constructs) {
      const t = v.tiers[c.id];
      if (t > (state.celebratedTiers?.[c.id] ?? 0)) {
        events.push({ title: `${c.name} face: ${TIER_WORD[t]}`, detail: `Your Super-Cube® ${c.name} face just lit up a step.`, color: c.color, face: c.id });
      }
    }
    const fresh = badges.filter((b) => !state.progressBadges?.[b]);
    for (const b of fresh) events.push({ title: `Badge: ${PROGRESS_BADGES[b].name}`, detail: PROGRESS_BADGES[b].criteria, color: "#0f6f71" });
    if (!events.length) return;
    markCelebrated({ celebratedLevel: v.level.level.n, celebratedTiers: v.tiers, progressBadges: Object.fromEntries(fresh.map((b) => [b, now])) });
    const first = events[0];
    setToast(events.length > 1 ? { ...first, detail: `${first.detail} (+${events.length - 1} more on your Progress page)` } : first);
    const face = events.find((e) => e.face)?.face;
    if (face) window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: face }));
  }, [trigger]);

  useEffect(() => {
    if (!toast) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 7000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast]);

  if (!toast) return null;
  const face = toast.face;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-50 flex justify-center px-3 lg:bottom-6"
      data-testid="celebration"
    >
      <div
        className="sc-pop pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-line bg-elevated p-3.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)]"
        role="status"
        aria-live="polite"
      >
        <span className="sc-confetti pointer-events-none absolute left-8 top-6" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const c = constructs[i % constructs.length].color;
            return (
              <i
                key={i}
                style={
                  {
                    background: c,
                    "--dx": `${Math.round(Math.cos(a) * 70)}px`,
                    "--dy": `${Math.round(Math.sin(a) * 50)}px`,
                    "--rot": `${i * 47}deg`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
        <span aria-hidden className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: toast.color }}>
          ★
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[0.9375rem] font-semibold tracking-tight text-ink">{toast.title}</p>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">{toast.detail}</p>
          {pathname !== "/learn/progress" && (
            <Link href={face ? `/learn/progress?lit=${face}` : "/learn/progress"} className="mt-1.5 inline-block text-[0.8125rem] font-semibold text-ink underline underline-offset-2">
              See your cube
            </Link>
          )}
        </div>
        <button type="button" onClick={() => setToast(null)} className="relative -mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-slate hover:text-ink" aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}
