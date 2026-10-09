"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { constructs } from "@/lib/content";
import { formatDateZA } from "@/lib/datetime";
import { sessionReviewQueue, type SessionReviewItem } from "@/lib/lms/progression";
import type { LocalLmsState } from "@/lib/lms/store";

const ReviewQuiz = dynamic(() => import("./ReviewQuiz"), { ssr: false });

const NAMES: Record<number, string> = { 3: "First recall", 7: "Mix it up", 21: "Lock it in" };

/** Today / Progress: the next Day 3, 7 or 21 review of a session, taken right here. */
export function SessionReviewCard({ state, fallback }: { state: LocalLmsState; fallback?: { title: string; when: string; href: string } }) {
  // Keep the review that was opened on screen after it is saved (the queue moves on).
  const [openItem, setOpenItem] = useState<SessionReviewItem | null>(null);
  const { due, next } = sessionReviewQueue(state);
  const kids = (state.subscription?.programmeId || state.user?.programmeId || state.profile?.programmeId) === "kids";
  const item = openItem ?? due[0];
  const open = Boolean(openItem);

  if (!item) {
    return (
      <div className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" data-testid="next-review">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">Spaced reviews</p>
        {next ? (
          <>
            <p className="mt-1 text-[1rem] font-semibold tracking-tight text-ink">
              Day {next.days[0]} · {next.title}
            </p>
            <p className="mt-1 text-[0.875rem] leading-snug text-slate">
              Due {formatDateZA(new Date(`${next.dueKey}T12:00:00`))}. Each session comes back on Day 3, 7 and 21 as a two-minute quiz.
            </p>
          </>
        ) : fallback ? (
          <Link href={fallback.href} className="block">
            <p className="mt-1 text-[1rem] font-semibold tracking-tight text-ink">{fallback.title}</p>
            <p className="mt-1 text-[0.875rem] leading-snug text-slate">{fallback.when}</p>
          </Link>
        ) : (
          <p className="mt-1 text-[0.875rem] leading-snug text-slate">
            Finish a session and it comes back on Day 3, 7 and 21 as a two-minute quiz, which is how it sticks.
          </p>
        )}
      </div>
    );
  }

  const color = constructs.find((c) => c.id === item.constructId)?.color;
  const day = item.days[item.days.length - 1];
  return (
    <section
      // An open review takes the full row at desktop so the questions have room.
      className={`rounded-2xl border border-line bg-elevated p-4 sm:p-5${open ? " sm:col-span-2" : ""}`}
      style={color ? { boxShadow: `inset 4px 0 0 ${color}` } : undefined}
      aria-labelledby="review-due-h"
      data-testid="next-review"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
        {open ? "Spaced review" : `Review due${due.length > 1 ? ` · ${due.length} waiting` : ""}`}
      </p>
      <h2 id="review-due-h" className="mt-1 text-[1rem] font-semibold tracking-tight text-ink">
        Day {day} · {NAMES[day]}: {item.title}
      </h2>
      {!open ? (
        <>
          <p className="mt-1 text-[0.875rem] leading-snug text-slate">
            {kids ? "A tiny quiz about a session you finished. Ready?" : "Two minutes, from memory, on a session you finished. Spacing it out is what makes it last."}
          </p>
          <button type="button" className="learn-btn learn-btn-primary mt-3" onClick={() => setOpenItem(item)} data-testid="start-review">
            Start review
          </button>
        </>
      ) : (
        <div className="mt-3">
          <ReviewQuiz item={item} kids={kids} onDone={() => setOpenItem(null)} />
        </div>
      )}
    </section>
  );
}
