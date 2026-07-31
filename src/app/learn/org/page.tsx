"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { loadLmsState, setOrgCode, type LocalLmsState } from "@/lib/lms/store";

/**
 * Light org / school cohort join — stores a cohort code on the learner.
 * Full multi-user dashboards can read orgCode once server-side rostering ships.
 */
export default function LearnOrgPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    setCode(s.orgCode ?? "");
  }, []);

  function join(e: React.FormEvent) {
    e.preventDefault();
    const next = setOrgCode(code);
    setState(next);
    setSaved(true);
    track("org_join", { orgCode: next.orgCode ?? "" });
  }

  return (
    <LearnShell
      title="School or company cohort"
      subtitle="Join a Super-Cube® pilot or organisational cohort with a short code from your facilitator. Your journals stay private; only pathway progress can be aggregated later with consent."
    >
      <form
        onSubmit={join}
        className="learn-card max-w-md space-y-3"
      >
        <label className="block">
          <span className="learn-label">Cohort code</span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setSaved(false);
            }}
            placeholder="e.g. IMANA2026"
            className="learn-input mt-1.5"
            maxLength={24}
            autoCapitalize="characters"
            aria-describedby="org-help"
          />
        </label>
        <p id="org-help" className="learn-meta">
          Codes are case-insensitive. Ask your teacher, HR lead, or Super-Cube®
          facilitator if you don’t have one.
        </p>
        <button type="submit" className="learn-btn learn-btn-primary">
          Save cohort
        </button>
        {saved && (
          <p className="text-[0.8125rem] font-medium text-emerald-800">
            Saved{state?.orgCode ? `: ${state.orgCode}` : ""}.
          </p>
        )}
      </form>

      <div className="mt-6 learn-card-muted max-w-md">
        <p className="learn-label">Facilitators</p>
        <p className="learn-body mt-1">
          For a pilot roster, school licence, or coach view of consented growth
          summaries, email{" "}
          <a href="mailto:hello@super-cube.me" className="font-semibold text-ink">
            hello@super-cube.me
          </a>
          .
        </p>
        <Link
          href="/learn/coach"
          className="mt-3 inline-block text-[0.8125rem] font-semibold text-ink"
        >
          Open coach tools →
        </Link>
      </div>
    </LearnShell>
  );
}
