"use client";

import { useState } from "react";
import {
  COHORT_KINDS,
  getProfile,
  saveProfile,
  type CohortKind,
} from "@/lib/lms/profile";
import { setOrgCode, type LocalLmsState } from "@/lib/lms/store";

export function InlineProfileEdit({
  state,
  onSaved,
}: {
  state: LocalLmsState;
  onSaved: (s: LocalLmsState) => void;
}) {
  const profile = getProfile(state);
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(profile?.goal || "");
  const [cohortKind, setCohortKind] = useState<CohortKind>(
    profile?.cohortKind || "solo"
  );
  const [code, setCode] = useState(state.orgCode || "");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
      >
        Quick edit goal & cohort →
      </button>
    );
  }

  function save() {
    let next = saveProfile({
      goal: goal.trim() || undefined,
      cohortKind,
    });
    if (code.trim()) {
      next = setOrgCode(code.trim());
    }
    onSaved(next);
    setOpen(false);
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-black/[0.08] bg-[#fafafa] p-3">
      <label className="block">
        <span className="learn-label">Goal</span>
        <textarea
          className="learn-input mt-1 min-h-[3.5rem] w-full"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What leadership growth matters most this season?"
        />
      </label>
      <div>
        <p className="learn-label">Learning mode</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {COHORT_KINDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCohortKind(c.id)}
              className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
                cohortKind === c.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/[0.1] text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      {cohortKind !== "solo" && (
        <label className="block">
          <span className="learn-label">Family / cohort code</span>
          <input
            className="learn-input mt-1 w-full"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. FAMILY-ABC"
            maxLength={24}
          />
        </label>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={save} className="learn-btn learn-btn-primary">
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="learn-btn learn-btn-ghost"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
