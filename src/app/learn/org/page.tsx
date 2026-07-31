"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { loadLmsState, setOrgCode, type LocalLmsState } from "@/lib/lms/store";
import { createClient } from "@/lib/supabase/client";

/**
 * Join school / company cohort — local code always; Supabase membership when signed in.
 */
export default function LearnOrgPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [code, setCode] = useState("");
  const [role, setRole] = useState<"learner" | "coach">("learner");
  const [saved, setSaved] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    setCode(s.orgCode ?? "");
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const next = setOrgCode(code);
    setState(next);
    setSaved(true);
    track("org_join", { orgCode: next.orgCode ?? "", role });

    // Cloud membership when signed in
    if (email) {
      try {
        const res = await fetch("/api/org/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: next.orgCode,
            role,
            displayName: next.user?.fullName || email,
          }),
        });
        const j = await res.json();
        if (!res.ok) {
          setCloudMsg(
            j.error ||
              "Cloud join failed — run SUPABASE_RUN_THIS_ORGS_COACH.sql if tables are missing."
          );
        } else {
          setCloudMsg(`Joined ${j.org?.name || next.orgCode} as ${role}.`);
          // Push progress snapshot for coaches
          void pushProgress(next.orgCode!);
        }
      } catch {
        setCloudMsg("Cloud join unavailable offline.");
      }
    } else {
      setCloudMsg(
        "Saved on this device. Sign in to join the cloud roster for coaches."
      );
    }
  }

  async function pushProgress(orgCode: string) {
    const s = loadLmsState();
    const pre = s.attempts.find((a) => a.phase === "pre");
    const post = s.attempts.find((a) => a.phase === "post");
    const lessonsCompleted = Object.values(s.lessonProgress).filter(
      (x) => x === "completed"
    ).length;
    await fetch("/api/org/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgCode,
        programmeId:
          s.subscription?.programmeId || s.user?.programmeId || null,
        pathwayPct: 0,
        lessonsCompleted,
        preOverall: pre?.result.overall ?? null,
        postOverall: post?.result.overall ?? null,
        growth:
          pre && post
            ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
            : null,
        certificateId: s.certificateId ?? null,
      }),
    });
  }

  return (
    <LearnShell
      title="School or company cohort"
      subtitle="Join a Super-Cube® pilot with a short code. Local save always works; signed-in users join the cloud roster coaches can view."
    >
      <form onSubmit={join} className="learn-card max-w-md space-y-3">
        <label className="block">
          <span className="learn-label">Cohort code</span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setSaved(false);
              setCloudMsg(null);
            }}
            placeholder="e.g. DEMO2026"
            className="learn-input mt-1.5"
            maxLength={24}
            autoCapitalize="characters"
            aria-describedby="org-help"
          />
        </label>
        <fieldset className="flex gap-4 text-sm">
          <legend className="sr-only">Role</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              checked={role === "learner"}
              onChange={() => setRole("learner")}
            />
            Learner
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              checked={role === "coach"}
              onChange={() => setRole("coach")}
            />
            Coach / facilitator
          </label>
        </fieldset>
        <p id="org-help" className="learn-meta">
          Try <strong className="text-ink">DEMO2026</strong> after running the
          orgs SQL. Ask your facilitator for a live school code.
        </p>
        <button type="submit" className="learn-btn learn-btn-primary">
          Join cohort
        </button>
        {saved && (
          <p className="text-[0.8125rem] font-medium text-emerald-800">
            Local code saved{state?.orgCode ? `: ${state.orgCode}` : ""}.
          </p>
        )}
        {cloudMsg && <p className="learn-meta">{cloudMsg}</p>}
        {!email && (
          <p className="learn-meta">
            <Link
              href="/login?next=/learn/org"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            for multi-device roster membership.
          </p>
        )}
      </form>

      <div className="mt-6 learn-card-muted max-w-md">
        <p className="learn-label">Facilitators</p>
        <p className="learn-body mt-1">
          After joining as coach, open{" "}
          <Link href="/learn/coach" className="font-semibold text-ink">
            Coach tools
          </Link>{" "}
          to see the roster (requires SQL + sign-in).
        </p>
      </div>
    </LearnShell>
  );
}
