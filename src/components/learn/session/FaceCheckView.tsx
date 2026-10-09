"use client";

import { SessionReflection } from "@/components/learn/SessionReflection";
import type { ConstructId } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import type { RetrievalQ } from "@/lib/lms/sessions";
import type { ProgrammeId } from "@/lib/programmes";
import { RetrievalCheck } from "./RetrievalCheck";

/** End-of-module face check: retrieval across every skill, teach-back, one habit. */
export function FaceCheckView({
  questions,
  lessonId,
  color,
  programmeId,
  constructId,
  faceName,
}: {
  questions: RetrievalQ[];
  lessonId: string;
  color: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
  faceName: string;
}) {
  const kids = programmeId === "kids";
  return (
    <div id="face-check" className="scroll-mt-24 space-y-3" style={faceInkStyle(color)} data-testid="face-check">
      <section className="rounded-2xl border border-line bg-elevated p-3.5 sm:p-5" aria-labelledby="fc-h">
        <h2 id="fc-h" className="learn-eyebrow face-ink">Face check · {faceName}</h2>
        <p className="learn-meta mt-1 mb-3">
          {kids
            ? "Let's see what you remember! One question for each skill."
            : "One question per skill, from memory. Pulling ideas back out of memory makes them stick far better than re-reading."}
        </p>
        <RetrievalCheck questions={questions} color={color} storageKey={lessonId} kids={kids} context={{ lessonId, constructId, programmeId }} />
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-3.5 sm:p-5" aria-labelledby="fc-teach">
        <h2 id="fc-teach" className="learn-eyebrow face-ink">Teach it back</h2>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink">
          {kids
            ? `Tell a grown-up or a friend about ${faceName}: what it is and one thing you tried.`
            : `In 60 seconds, teach the ${faceName} face to someone else: what it is, why it matters, and one practice they could try today. If you can teach it, you own it.`}
        </p>
      </section>

      <SessionReflection
        lessonId={lessonId}
        constructId={constructId}
        color={color}
        journalPrompt={
          kids
            ? "Which idea from this module will you keep using? Write it as: If…, then I will…"
            : "Lock one habit for the next 14 days. Write it as: If [situation], then I will [action]."
        }
        embedded
      />
    </div>
  );
}
