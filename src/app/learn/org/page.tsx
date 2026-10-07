"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { getProfile } from "@/lib/lms/profile";
import { loadLmsState, setOrgCode, type LocalLmsState } from "@/lib/lms/store";
import { createClient } from "@/lib/supabase/client";

/**
 * Join family / school / company cohort — local code always; Supabase when signed in.
 */
export default function LearnOrgPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [code, setCode] = useState("");
  const [invite, setInvite] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const profile = getProfile();

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const params = new URLSearchParams(window.location.search);
    // Cohort links from the admin console: /learn/org?code=ABC123 prefills the code
    const linkCode = (params.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
    setCode(linkCode || s.orgCode || "");
    const inv = params.get("invite");
    if (inv) setInvite(inv.slice(0, 200));
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function acceptInvite() {
    if (!invite) return;
    if (!email) {
      setCloudMsg("Sign in first, then open the invite link again.");
      return;
    }
    const res = await fetch("/api/org/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite,
        displayName: profile?.displayName || email,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setCloudMsg(j.error || "This invite is not valid any more. Ask your organisation admin for a new one.");
      return;
    }
    if (j.org?.code) setState(setOrgCode(j.org.code));
    setCloudMsg(`Joined ${j.org?.name || "the organisation"} as ${j.role || "coach"}.`);
    track("org_invite_accept", { role: j.role || "coach" });
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const next = setOrgCode(code);
    setState(next);
    setSaved(true);
    track("org_join", { orgCode: next.orgCode ?? "", role: "learner" });

    if (email) {
      try {
        const res = await fetch("/api/org/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: next.orgCode,
            displayName:
              next.profile?.displayName || next.user?.fullName || email,
          }),
        });
        const j = await res.json();
        if (!res.ok) {
          setCloudMsg(j.error || "Could not join this cohort.");
        } else {
          setCloudMsg(`Joined ${j.org?.name || next.orgCode} as a learner.`);
          void pushProgress(next.orgCode!);
        }
      } catch {
        setCloudMsg("Cloud join unavailable offline.");
      }
    } else {
      setCloudMsg(
        "Saved on this device. Sign in to join the cloud roster for coaches / family leads.",
      );
    }
  }

  async function pushProgress(orgCode: string) {
    const s = loadLmsState();
    // Scores, sessions and certificate are read from the server's own records.
    await fetch("/api/org/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgCode,
        programmeId: s.subscription?.programmeId || s.user?.programmeId || null,
        consent: Boolean(s.shareProgressWithCoach),
      }),
    });
  }

  return (
    <LearnShell
      title="Family, school or company cohort"
      subtitle="Join with a short code—family circle, classroom, or workplace pilot. Local save always works; signed-in users appear on the coach roster. Journals stay private; scores only if you consent on Today / Coach."
    >
      {profile?.cohortKind && profile.cohortKind !== "solo" && (
        <p className="mb-4 rounded-xl border border-line bg-elevated px-3 py-2 text-[0.8125rem] text-slate">
          Your profile preference:{" "}
          <strong className="text-ink">{profile.cohortKind}</strong>
          {profile.displayName ? ` · ${profile.displayName}` : ""}
        </p>
      )}

      {invite && (
        <div className="learn-card mb-4 max-w-md" data-testid="invite-card">
          <p className="learn-eyebrow">Staff invite</p>
          <p className="learn-body mt-1">
            You have been invited to join an organisation as a coach or admin.
          </p>
          <button type="button" className="learn-btn learn-btn-primary mt-3" onClick={() => void acceptInvite()}>
            Accept invite
          </button>
        </div>
      )}

      <form onSubmit={join} className="learn-card max-w-md space-y-3">
        <label className="block">
          <span className="learn-label">Learner cohort / family code</span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setSaved(false);
              setCloudMsg(null);
            }}
            placeholder="e.g. FAMILY-ABC"
            className="learn-input mt-1.5"
            maxLength={24}
            autoCapitalize="characters"
            aria-describedby="org-help"
          />
        </label>
        <p id="org-help" className="learn-meta">
          Learners join with the code from their teacher, facilitator or family lead.
          Coaches and facilitators join with a personal invite link from the
          organisation&apos;s admin, so only invited staff can see learners&apos; scores.
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

      <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
        <div className="learn-card-muted">
          <p className="learn-label">Facilitators</p>
          <p className="learn-body mt-1">
            After joining as coach, open{" "}
            <Link href="/learn/coach" className="font-semibold text-ink">
              Coach tools
            </Link>
            .
          </p>
        </div>
        <div className="learn-card-muted">
          <p className="learn-label">Your profile</p>
          <p className="learn-body mt-1">
            <Link href="/learn/account" className="font-semibold text-ink">
              You
            </Link>{" "}
            ·{" "}
            <Link href="/learn/report" className="font-semibold text-ink">
              Reports
            </Link>
          </p>
        </div>
      </div>
    </LearnShell>
  );
}
