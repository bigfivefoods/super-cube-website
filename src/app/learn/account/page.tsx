"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LearnShell } from "@/components/learn/LearnShell";
import { RadarChart } from "@/components/learn/RadarChart";
import { Button } from "@/components/ui";
import { track } from "@/lib/analytics";
import { reflectionCount } from "@/lib/lms/continue";
import {
  AGE_BANDS,
  COHORT_KINDS,
  CONTEXTS,
  ROLES,
  getProfile,
  profileComplete,
  profileStory,
} from "@/lib/lms/profile";
import { compareAttempts } from "@/lib/lms/scoring";
import { syncLearnerState } from "@/lib/lms/sync";
import {
  exportLmsBackup,
  importLmsBackup,
  isSupabaseConfigured,
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { createClient } from "@/lib/supabase/client";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <LearnShell title="You">
          <p className="learn-meta">Loading…</p>
        </LearnShell>
      }
    >
      <AccountPageInner />
    </Suspense>
  );
}

function AccountPageInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<LocalLmsState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const cloudReady = isSupabaseConfigured();
  const paidHandled = useRef(false);

  useEffect(() => {
    setState(loadLmsState());
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setSignedInEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (paidHandled.current) return;
    const paid = searchParams.get("paid");
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    const programme = searchParams.get("programme") as ProgrammeId | null;
    if (paid !== "1" && !reference) return;
    paidHandled.current = true;

    void (async () => {
      if (reference) {
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference,
              programmeId: programme || undefined,
            }),
          });
          const data = await res.json();
          if (data.paid && data.activateLocal?.programmeId) {
            const next = loadLmsState();
            const pid = data.activateLocal.programmeId as ProgrammeId;
            next.subscription = {
              programmeId: pid,
              planId: data.activateLocal.planId || `${pid}_once`,
              status: "active",
              activatedAt: new Date().toISOString(),
            };
            next.user = {
              email: data.email || next.user?.email || "learner@super-cube.me",
              fullName: next.user?.fullName || next.profile?.displayName || "Learner",
              programmeId: pid,
            };
            saveLmsState(next);
            setState(next);
            track("checkout_start", { programmeId: pid, verified: true });
            window.location.href = `/learn/onboarding?mode=purchase&programme=${pid}`;
            return;
          }
        } catch {
          /* fall through */
        }
      }
      if (programme) {
        const next = loadLmsState();
        next.subscription = {
          programmeId: programme,
          planId: `${programme}_once`,
          status: "active",
          activatedAt: new Date().toISOString(),
        };
        next.user = {
          email: next.user?.email || "learner@super-cube.me",
          fullName: next.user?.fullName || "Learner",
          programmeId: programme,
        };
        saveLmsState(next);
        setState(next);
        window.location.href = `/learn/onboarding?mode=purchase&programme=${programme}`;
      }
    })();
  }, [searchParams]);

  async function forceSync() {
    setSyncing(true);
    setMsg(null);
    const result = await syncLearnerState();
    setSyncing(false);
    if (result.merged) setState(result.merged);
    setMsg(result.message || result.status);
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setSignedInEmail(null);
    setMsg("Signed out. Local progress stays on this device.");
  }

  function clearDemo() {
    if (
      !confirm(
        "Reset all local Learn progress, assessments, and reflections on this device?"
      )
    ) {
      return;
    }
    localStorage.removeItem("supercube_lms_v1");
    setState(loadLmsState());
    setMsg("Local data cleared.");
  }

  function downloadBackup() {
    const blob = new Blob([exportLmsBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `super-cube-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setState(importLmsBackup(String(reader.result)));
        setMsg("Backup restored on this device.");
      } catch {
        setMsg("Could not import that file. Use a Super-Cube JSON backup.");
      }
    };
    reader.readAsText(file);
  }

  async function enableReminders() {
    if (!("Notification" in window)) {
      setMsg("Notifications are not supported in this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    const next = loadLmsState();
    next.notifyPractice = perm === "granted";
    saveLmsState(next);
    setState(next);
    setMsg(
      perm === "granted"
        ? "Practice reminders enabled."
        : "Notifications were not granted."
    );
  }

  if (!state) {
    return (
      <LearnShell title="You">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  const profile = getProfile(state);
  const programme = getProgramme(
    state.subscription?.programmeId ||
      state.user?.programmeId ||
      profile?.programmeId ||
      ""
  );
  const completedLessons = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;
  const reflections = reflectionCount(state);
  const streak = state.practiceStreak?.current ?? 0;
  const bestStreak = state.practiceStreak?.best ?? 0;
  const pulseCount = state.facePulses?.length ?? 0;
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");
  const mid = state.attempts.find((a) => a.phase === "mid");
  const growth =
    pre && post
      ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
      : null;

  const comparison = useMemo(() => {
    if (!pre) return null;
    return compareAttempts(pre.result, post?.result);
  }, [pre, post]);

  const strongest = comparison
    ? [...comparison].sort((a, b) => (b.post ?? b.pre) - (a.post ?? a.pre))[0]
    : null;
  const weakest = comparison
    ? [...comparison].sort((a, b) => (a.post ?? a.pre) - (b.post ?? b.pre))[0]
    : null;

  const initials = (profile?.displayName || state.user?.fullName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = profile?.role
    ? ROLES.find((r) => r.id === profile.role)?.label
    : null;
  const contextLabel = profile?.context
    ? CONTEXTS.find((c) => c.id === profile.context)?.label
    : null;
  const ageLabel = profile?.ageBand
    ? AGE_BANDS.find((a) => a.id === profile.ageBand)?.label
    : null;
  const cohortLabel = profile?.cohortKind
    ? COHORT_KINDS.find((c) => c.id === profile.cohortKind)?.label
    : null;

  return (
    <LearnShell
      title="You"
      subtitle="Your identity, growth snapshot, cohort, and device tools—one place to know yourself in Super-Cube®."
    >
      {msg && (
        <p className="mb-4 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-[0.8125rem] text-ink">
          {msg}
        </p>
      )}

      {/* Identity hero */}
      <section className="mb-4 overflow-hidden rounded-2xl border border-black/[0.07] bg-ink text-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold tracking-tight">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">
              Learner profile
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {profile?.displayName || state.user?.fullName || "Complete your profile"}
            </h2>
            <p className="mt-1 text-sm text-white/65">
              {profile ? profileStory(profile) : "Tell us who you are so Learn can fit you."}
            </p>
            {profile?.goal && (
              <p className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-[0.8125rem] text-white/85">
                <span className="text-white/50">Goal · </span>
                {profile.goal}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/learn/welcome"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink"
            >
              {profileComplete(profile) ? "Edit profile" : "Set up profile"}
            </Link>
            {!signedInEmail && (
              <Link
                href="/login?next=/learn/account"
                className="inline-flex min-h-10 items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            ["Streak", `${streak}d`, `Best ${bestStreak}`],
            ["Sessions", String(completedLessons), "completed"],
            ["Reflections", String(reflections), "journal"],
            ["Pulses", String(pulseCount), "face checks"],
          ].map(([k, v, sub]) => (
            <div key={k} className="bg-ink px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white/40">
                {k}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">{v}</p>
              <p className="text-[0.65rem] text-white/45">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About you detail */}
      <section className="learn-card mb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="learn-card-title">About you</h2>
          <Link
            href="/learn/welcome"
            className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Update →
          </Link>
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["Email", profile?.email || state.user?.email || signedInEmail || "—"],
            ["Age band", ageLabel || "—"],
            ["Role", roleLabel || "—"],
            ["Context", contextLabel || "—"],
            [
              "Location",
              [profile?.city, profile?.country].filter(Boolean).join(", ") || "—",
            ],
            ["Programme", programme?.name || "Not selected"],
            ["Learning mode", cohortLabel || "—"],
            [
              "Signed in",
              signedInEmail || "Local device only",
            ],
          ].map(([dt, dd]) => (
            <div key={dt}>
              <dt className="learn-meta">{dt}</dt>
              <dd className="learn-label mt-0.5">{dd}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Growth snapshot */}
      <section className="mb-4 grid gap-3 lg:grid-cols-2">
        <div className="learn-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="learn-card-title">Growth snapshot</h2>
            <Link
              href="/learn/report"
              className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Full report →
            </Link>
          </div>
          {!pre ? (
            <div className="mt-3">
              <p className="learn-body">
                No baseline yet. Take the pre-assessment to see your six-face profile here.
              </p>
              <Link
                href="/learn/assessment/pre"
                className="learn-btn learn-btn-primary mt-3 inline-flex"
              >
                Start baseline →
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#fafafa] px-3 py-2.5">
                  <p className="learn-eyebrow">Pre</p>
                  <p className="text-lg font-semibold tabular-nums text-ink">
                    {pre.result.overall}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fafafa] px-3 py-2.5">
                  <p className="learn-eyebrow">Post</p>
                  <p className="text-lg font-semibold tabular-nums text-ink">
                    {post ? post.result.overall : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fafafa] px-3 py-2.5">
                  <p className="learn-eyebrow">Growth</p>
                  <p className="text-lg font-semibold tabular-nums text-ink">
                    {growth === null
                      ? "—"
                      : `${growth > 0 ? "+" : ""}${growth}`}
                  </p>
                </div>
              </div>
              {(strongest || weakest) && (
                <ul className="mt-3 space-y-1.5 text-[0.8125rem]">
                  {strongest && (
                    <li className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: strongest.color }}
                      />
                      <span className="text-slate">Strength ·</span>
                      <span className="font-semibold text-ink">
                        {strongest.name}
                      </span>
                    </li>
                  )}
                  {weakest && (
                    <li className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: weakest.color }}
                      />
                      <span className="text-slate">Focus ·</span>
                      <span className="font-semibold text-ink">
                        {weakest.name}
                      </span>
                    </li>
                  )}
                </ul>
              )}
              <div className="mt-3">
                <RadarChart
                  scores={pre.result.constructScores}
                  compareScores={post?.result.constructScores}
                  preLabel="Pre"
                  postLabel="Post"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="learn-card">
            <h2 className="learn-card-title">Your reports</h2>
            <p className="learn-meta mt-1">
              Open any assessment view in one tap.
            </p>
            <ul className="mt-3 space-y-2">
              {[
                {
                  href: "/learn/report",
                  t: "Growth report",
                  d: pre
                    ? post
                      ? `Pre ${pre.result.overall} → Post ${post.result.overall}`
                      : `Baseline ${pre.result.overall} · post pending`
                    : "Complete baseline first",
                  ready: Boolean(pre),
                },
                {
                  href: "/learn/assessment/orientation",
                  t: "Orientation",
                  d: state.orientation
                    ? state.orientation.result.label
                    : "Not taken",
                  ready: true,
                },
                {
                  href: "/learn/pulse",
                  t: "Face pulse history",
                  d:
                    pulseCount > 0
                      ? `${pulseCount} check-ins recorded`
                      : "Start daily/weekly tracking",
                  ready: true,
                },
                {
                  href: "/learn/feedback",
                  t: "Narrative feedback",
                  d: "Lit cube + story view",
                  ready: Boolean(pre),
                },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-2.5 transition hover:border-black/[0.12]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{item.t}</p>
                      <p className="truncate text-[0.7rem] text-muted">{item.d}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="learn-card">
            <h2 className="learn-card-title">Family & cohort</h2>
            <p className="learn-body mt-2">
              {state.orgCode ? (
                <>
                  Joined code{" "}
                  <strong className="text-ink">{state.orgCode}</strong>
                  {cohortLabel ? ` · ${cohortLabel}` : ""}
                </>
              ) : (
                <>Join a family, school, or company code to learn together.</>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/learn/org" className="learn-btn learn-btn-primary">
                {state.orgCode ? "Manage cohort" : "Join family / cohort"}
              </Link>
              <Link href="/learn/coach" className="learn-btn learn-btn-ghost">
                Coach tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment timeline */}
      <section className="learn-card mb-4">
        <h2 className="learn-card-title">Assessment timeline</h2>
        <ol className="mt-3 space-y-2">
          {[
            {
              label: "Orientation",
              at: state.orientation?.completedAt,
              meta: state.orientation?.result.label,
            },
            {
              label: "Pre-assessment",
              at: pre?.completedAt,
              meta: pre ? `Overall ${pre.result.overall}` : undefined,
            },
            {
              label: "Mid check",
              at: mid?.completedAt,
              meta: mid ? `Overall ${mid.result.overall}` : undefined,
            },
            {
              label: "Post-assessment",
              at: post?.completedAt,
              meta: post ? `Overall ${post.result.overall}` : undefined,
            },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.05] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                    row.at
                      ? "bg-emerald-600 text-white"
                      : "border border-black/[0.12] text-muted"
                  }`}
                >
                  {row.at ? "✓" : "·"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  {row.meta && (
                    <p className="text-[0.7rem] text-muted">{row.meta}</p>
                  )}
                </div>
              </div>
              <p className="text-[0.7rem] tabular-nums text-muted">
                {row.at ? new Date(row.at).toLocaleDateString() : "Pending"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Access + sync + tools */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="learn-card">
          <h2 className="learn-card-title">Access & account</h2>
          <p className="learn-body mt-2">
            Status:{" "}
            <strong className="text-ink">
              {state.subscription?.status ?? "demo / none"}
            </strong>
            {state.subscription && (
              <>
                {" · "}
                {new Date(state.subscription.activatedAt).toLocaleDateString()}
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              href="/pricing"
              variant="primary"
              className="!min-h-9 !py-1.5 !text-[0.8125rem]"
            >
              Manage plan
            </Button>
            {signedInEmail ? (
              <button type="button" onClick={signOut} className="learn-btn learn-btn-ghost">
                Sign out
              </button>
            ) : (
              <>
                <Button
                  href="/login?next=/learn/account"
                  variant="ghost"
                  className="!min-h-9 !py-1.5 !text-[0.8125rem]"
                >
                  Sign in
                </Button>
                <Button
                  href="/signup"
                  variant="ghost"
                  className="!min-h-9 !py-1.5 !text-[0.8125rem]"
                >
                  Create account
                </Button>
              </>
            )}
          </div>
          {signedInEmail && (
            <p className="learn-meta mt-2">Signed in as {signedInEmail}</p>
          )}
        </section>

        <section className="learn-card">
          <h2 className="learn-card-title">Cloud sync</h2>
          <p className="learn-body mt-2">
            {cloudReady
              ? signedInEmail
                ? "Progress syncs when signed in—lessons, assessments, reflections, streak."
                : "Sign in to sync across phones and laptops."
              : "Supabase keys not configured on this deploy."}
          </p>
          <button
            type="button"
            onClick={forceSync}
            disabled={!cloudReady || syncing}
            className="learn-btn learn-btn-primary mt-3 disabled:opacity-40"
          >
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        </section>

        <section className="learn-card lg:col-span-2">
          <h2 className="learn-card-title">Backup & device tools</h2>
          <p className="learn-body mt-2">
            Download a JSON backup before switching devices. Includes profile,
            assessments, courses, and journal.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={downloadBackup} className="learn-btn learn-btn-primary">
              Download backup
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="learn-btn learn-btn-ghost"
            >
              Restore backup
            </button>
            <button type="button" onClick={enableReminders} className="learn-btn learn-btn-ghost">
              {state.notifyPractice ? "Reminders on" : "Enable reminders"}
            </button>
            <button
              type="button"
              onClick={clearDemo}
              className="learn-btn learn-btn-ghost !text-slate"
            >
              Reset local data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </section>
      </div>
    </LearnShell>
  );
}
