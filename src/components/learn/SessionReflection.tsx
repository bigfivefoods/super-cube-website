"use client";

import { useEffect, useState } from "react";
import type { ConstructId } from "@/lib/content";
import {
  loadLmsState,
  saveReflection,
} from "@/lib/lms/store";

/**
 * Deliberate-practice journal: one reflection per session.
 * World-class leadership programmes treat reflection as core, not optional.
 */
export function SessionReflection({
  lessonId,
  constructId,
  color,
}: {
  lessonId: string;
  constructId: ConstructId;
  color: string;
}) {
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const state = loadLmsState();
    const existing = state.reflections?.[lessonId];
    if (existing) {
      setText(existing.text);
      setSavedAt(existing.updatedAt);
    }
  }, [lessonId]);

  function save() {
    const next = saveReflection(lessonId, constructId, text);
    setSavedAt(next.reflections?.[lessonId]?.updatedAt ?? null);
    setDirty(false);
  }

  return (
    <section
      className="mt-6 overflow-hidden rounded-2xl border border-black/[0.07] bg-white"
      style={{ boxShadow: `inset 3px 0 0 ${color}` }}
    >
      <div className="border-b border-black/[0.05] px-4 py-3 sm:px-5">
        <p className="learn-eyebrow" style={{ color }}>
          Leadership journal
        </p>
        <h3 className="mt-0.5 text-[0.9375rem] font-semibold tracking-tight text-ink">
          Reflect before you leave
        </h3>
        <p className="learn-meta mt-0.5">
          What will you practice this week? Who will you serve differently?
        </p>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          rows={4}
          placeholder="Write 2–5 sentences. Specific beats vague—name a situation, person, or decision."
          className="learn-input min-h-[6rem] resize-y"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="learn-meta">
            {savedAt && !dirty
              ? `Saved ${new Date(savedAt).toLocaleString()}`
              : dirty
                ? "Unsaved changes"
                : "Private to this device (export backup anytime)"}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={!text.trim()}
            className="learn-btn learn-btn-primary disabled:opacity-40"
            style={{ background: color }}
          >
            Save reflection
          </button>
        </div>
      </div>
    </section>
  );
}
