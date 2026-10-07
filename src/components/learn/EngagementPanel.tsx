"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCalendar } from "@/components/learn/AddToCalendar";
import { formatDateZA } from "@/lib/datetime";
import { BADGE_IDS, BADGES, liveStreak } from "@/lib/lms/badges";
import { fetchEngagement, mirrorServerStreak, type EngagementView } from "@/lib/lms/cloud";
import { PUSH_ENABLED, pushSupported, turnOffPush, turnOnPush, type PushOutcome } from "@/lib/lms/push";
import { loadLmsState, localDayKey } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

const PUSH_MESSAGES: Record<PushOutcome, string> = {
  on: "Push reminders are on for this device.",
  denied: "Notifications are blocked for this site. Allow them in your browser settings to turn reminders on.",
  unsupported: "This browser can't receive push reminders. On iPhone, add Super-Cube® to your Home Screen first.",
  not_configured: "Push reminders aren't switched on yet.",
  consent_required: "Push reminders for under-18s need a parent or guardian's consent first.",
  signed_out: "Sign in to turn on push reminders.",
  error: "Couldn't turn on push reminders. Try again.",
};

/** Streak, streak freezes, badges, push opt-in and the day-21 calendar invite. */
export function EngagementPanel() {
  const [view, setView] = useState<EngagementView | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [local, setLocal] = useState<ReturnType<typeof loadLmsState> | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocal(loadLmsState());
    void fetchEngagement().then((r) => {
      if (r.kind === "ok") {
        setView(r.data);
        setSignedIn(true);
        mirrorServerStreak(r.data.streak);
        setLocal(loadLmsState());
      } else {
        setSignedIn(false);
      }
    });
  }, []);

  if (!local) return null;

  const today = localDayKey();
  const streak = view?.streak ?? {
    current: local.practiceStreak?.current ?? 0,
    best: local.practiceStreak?.best ?? 0,
    freezes: local.streakFreezes ?? 0,
    lastDay: local.practiceStreak?.lastDate ?? null,
  };
  const current = liveStreak(streak, today);
  const earned = new Map<string, string>((view?.badges ?? []).map((b) => [b.badgeId, b.awardedAt]));
  const pre = local.attempts.find((a) => a.phase === "pre");
  const post = local.attempts.find((a) => a.phase === "post");
  const programme = getProgramme(pre?.programmeId ?? local.profile?.programmeId ?? "adults");

  async function togglePush() {
    setBusy(true);
    if (view?.push.subscribed) {
      await turnOffPush();
      setView((v) => (v ? { ...v, push: { ...v.push, subscribed: false } } : v));
      setPushMsg("Push reminders are off.");
    } else {
      const out = await turnOnPush();
      if (out === "on") setView((v) => (v ? { ...v, push: { ...v.push, subscribed: true } } : v));
      setPushMsg(PUSH_MESSAGES[out]);
    }
    setBusy(false);
  }

  return (
    <section className="learn-card" aria-labelledby="habits-h" data-testid="engagement">
      <h2 id="habits-h" className="learn-card-title">
        Habits and badges
      </h2>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line bg-surface p-3">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">Streak</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-ink" data-testid="streak-current">
            {current} {current === 1 ? "day" : "days"}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">Best</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">{streak.best}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">Freezes</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-ink" data-testid="streak-freezes">
            {streak.freezes}
            <span className="text-sm font-medium text-slate"> / 2</span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-slate">
        A check-in, a micro-practice or a session keeps your streak going. Every 7 days in a row earns a streak
        freeze (hold up to 2), which covers a missed day for you automatically.
        {signedIn === false && " Sign in to keep your streak and badges on every device."}
      </p>

      <h3 className="mt-5 text-[0.875rem] font-semibold text-ink">Badges</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-3" data-testid="badges">
        {BADGE_IDS.map((id) => {
          const at = earned.get(id);
          return (
            <li
              key={id}
              className={`flex items-start gap-2.5 rounded-xl border p-2.5 sm:gap-3 sm:p-3 ${at ? "border-ink/20 bg-surface" : "border-line bg-transparent"}`}
              data-testid={`badge-${id}`}
              data-earned={at ? "true" : "false"}
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center sm:h-9 sm:w-9 justify-center rounded-full text-[0.8125rem] font-semibold ${
                  at ? "bg-void text-void-fg" : "border border-dashed border-line-strong text-slate"
                }`}
              >
                {BADGES[id].mark}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.875rem] font-semibold text-ink">
                  {BADGES[id].name}
                  <span className="sr-only">{at ? ", earned" : ", not earned yet"}</span>
                </span>
                <span className="block text-[0.75rem] leading-snug text-slate">
                  {at ? `Earned ${formatDateZA(at)}` : BADGES[id].criteria}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-5 text-[0.875rem] font-semibold text-ink">Reminders</h3>
      {PUSH_ENABLED && view?.push.configured ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void togglePush()}
            disabled={busy || !pushSupported()}
            className="learn-btn learn-btn-ghost"
            aria-pressed={Boolean(view?.push.subscribed)}
          >
            {view?.push.subscribed ? "Turn off push reminders" : "Turn on push reminders"}
          </button>
        </div>
      ) : (
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate" data-testid="push-off">
          Push reminders to your phone are coming soon. Until then, browser reminders on this device (below) and a
          calendar invite keep you on track.
        </p>
      )}
      {pushMsg && (
        <p className="mt-2 text-[0.8125rem] text-ink" role="status">
          {pushMsg}
        </p>
      )}
      {pre && !post ? (
        <div className="mt-3">
          <AddToCalendar preCompletedAt={pre.completedAt} programmeName={programme?.name ?? "Super-Cube®"} />
        </div>
      ) : !pre ? (
        <p className="mt-2 text-[0.8125rem] text-slate">
          Take your <Link href="/learn/assessment/pre" className="font-semibold text-ink underline underline-offset-2">baseline</Link>{" "}
          and you can add the re-measure date to your calendar.
        </p>
      ) : null}
    </section>
  );
}
