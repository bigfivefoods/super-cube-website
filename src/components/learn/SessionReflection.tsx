"use client";

import { useEffect, useState } from "react";
import type { ConstructId } from "@/lib/content";
import { track } from "@/lib/analytics";
import { reflectionPrompt } from "@/lib/lms/wins";
import {
  loadLmsState,
  saveReflection,
} from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

/**
 * Deliberate-practice journal: prompts adapt by programme (kids / adolescents / adults).
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
  const [programmeId, setProgrammeId] = useState<ProgrammeId>("adults");

  useEffect(() => {
    const state = loadLmsState();
    const existing = state.reflections?.[lessonId];
    if (existing) {
      setText(existing.text);
      setSavedAt(existing.updatedAt);
    }
    setProgrammeId(
      (state.subscription?.programmeId ||
        state.user?.programmeId ||
        "adults") as ProgrammeId
    );
  }, [lessonId]);

  const prompt = reflectionPrompt(constructId, programmeId);

  function save() {
    const next = saveReflection(lessonId, constructId, text);
    setSavedAt(next.reflections?.[lessonId]?.updatedAt ?? null);
    setDirty(false);
    track("reflection_save", { constructId, programmeId });
  }

  return (
    <section
      className="mt-6 overflow-hidden rounded-2xl border border-black/[0.07] bg-white"
      style={{ boxShadow: `inset 3px 0 0 ${color}` }}
      aria-labelledby={`reflect-title-${lessonId}`}
    >
      <div className="border-b border-black/[0.05] px-4 py-3 sm:px-5">
        <p className="learn-eyebrow" style={{ color }}>
          Leadership journal
        </p>
        <h3
          id={`reflect-title-${lessonId}`}
          className="mt-0.5 text-[0.9375rem] font-semibold tracking-tight text-ink"
        >
          {prompt.title}
        </h3>
        <p className="learn-meta mt-0.5">{prompt.hint}</p>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <label className="sr-only" htmlFor={`reflect-${lessonId}`}>
          Reflection
        </label>
        <textarea
          id={`reflect-${lessonId}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          rows={4}
          placeholder={prompt.placeholder}
          className="learn-input min-h-[6rem] resize-y"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="learn-meta">
            {savedAt && !dirty
              ? `Saved ${new Date(savedAt).toLocaleString()}`
              : dirty
                ? "Unsaved changes"
                : "Private to this device until you share or sync"}
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
