"use client";

import { useEffect, useRef, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import { reflectionCount } from "@/lib/lms/continue";
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
import { getProgramme } from "@/lib/programmes";

export default function AccountPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const cloudReady = isSupabaseConfigured();

  useEffect(() => {
    setState(loadLmsState());
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setSignedInEmail(data.user?.email ?? null);
    });
  }, []);

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
    const blob = new Blob([exportLmsBackup()], {
      type: "application/json",
    });
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
        const next = importLmsBackup(String(reader.result));
        setState(next);
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
    if (perm === "granted") {
      new Notification("Super-Cube® Learn", {
        body: "Practice reminders enabled. Open Learn each day to keep your streak.",
        icon: "/icons/icon-192.png",
      });
      setMsg("Practice reminders enabled.");
    } else {
      setMsg("Notifications were not granted.");
    }
  }

  if (!state) {
    return (
      <LearnShell title="Account">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  const programme = state.subscription?.programmeId
    ? getProgramme(state.subscription.programmeId)
    : state.user?.programmeId
      ? getProgramme(state.user.programmeId)
      : undefined;

  const completedLessons = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;
  const reflections = reflectionCount(state);
  const streak = state.practiceStreak?.current ?? 0;

  return (
    <LearnShell
      title="Account"
      subtitle="Your profile, practice momentum, and progress backup. Sign in with Supabase for multi-device sync when configured."
    >
      {msg && (
        <p className="mb-4 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-[0.8125rem] text-ink">
          {msg}
        </p>
      )}

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="learn-card !p-3.5">
          <p className="learn-eyebrow">Streak</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
            {streak}{" "}
            <span className="text-sm font-medium text-muted">days</span>
          </p>
        </div>
        <div className="learn-card !p-3.5">
          <p className="learn-eyebrow">Sessions done</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
            {completedLessons}
          </p>
        </div>
        <div className="learn-card !p-3.5">
          <p className="learn-eyebrow">Reflections</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
            {reflections}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <section className="learn-card">
          <h2 className="learn-card-title">Profile</h2>
          <dl className="mt-3.5 space-y-2.5">
            <div>
              <dt className="learn-meta">Name</dt>
              <dd className="learn-label mt-0.5">
                {state.user?.fullName || "—"}
              </dd>
            </div>
            <div>
              <dt className="learn-meta">Email</dt>
              <dd className="learn-label mt-0.5">
                {state.user?.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="learn-meta">Programme</dt>
              <dd className="learn-label mt-0.5">
                {programme?.name || "Not selected"}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {signedInEmail ? (
              <button
                type="button"
                onClick={signOut}
                className="learn-btn learn-btn-ghost"
              >
                Sign out
              </button>
            ) : (
              <>
                <Button
                  href="/login?next=/learn/account"
                  variant="ghost"
                  className="!min-h-9 !py-1.5 !text-[0.8125rem]"
                >
                  Sign in (Supabase)
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
          <h2 className="learn-card-title">Subscription</h2>
          <p className="learn-body mt-2.5">
            Status:{" "}
            <strong className="font-semibold text-ink">
              {state.subscription?.status ?? "none"}
            </strong>
          </p>
          {state.subscription && (
            <p className="learn-meta mt-1">
              Plan {state.subscription.planId} · since{" "}
              {new Date(state.subscription.activatedAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              href="/pricing"
              variant="primary"
              className="!min-h-9 !py-1.5 !text-[0.8125rem]"
            >
              Manage plan
            </Button>
          </div>
        </section>

        <section className="learn-card lg:col-span-2">
          <h2 className="learn-card-title">Cloud sync (multi-device)</h2>
          <p className="learn-body mt-2">
            {cloudReady
              ? signedInEmail
                ? "Your progress is synced to Supabase when you are signed in—lessons, assessments, reflections, and streak."
                : "Supabase is configured. Sign in to sync progress across phones and laptops."
              : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run supabase/migrations/002_learner_state.sql."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={forceSync}
              disabled={!cloudReady || syncing}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
            {!signedInEmail && cloudReady && (
              <Button
                href="/login?next=/learn/account"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Sign in to enable sync
              </Button>
            )}
          </div>
        </section>

        <section className="learn-card lg:col-span-2">
          <h2 className="learn-card-title">Progress backup & device tools</h2>
          <p className="learn-body mt-2">
            Always keep a local backup before switching devices—or if cloud sync
            is offline. JSON includes assessments, courses, and journal entries.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="learn-btn learn-btn-primary"
            >
              Download progress backup
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="learn-btn learn-btn-ghost"
            >
              Restore from backup
            </button>
            <button
              type="button"
              onClick={enableReminders}
              className="learn-btn learn-btn-ghost"
            >
              {state.notifyPractice
                ? "Reminders enabled"
                : "Enable practice reminders"}
            </button>
            <button
              type="button"
              onClick={clearDemo}
              className="learn-btn learn-btn-ghost !text-slate"
            >
              Reset local demo data
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
          <p className="learn-meta mt-3">
            Install the PWA (banner on Learn) or use the Capacitor app shell for
            a full-screen experience—see docs/APP.md.
          </p>
        </section>
      </div>
    </LearnShell>
  );
}
