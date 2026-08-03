"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs, type ConstructId } from "@/lib/content";
import { track } from "@/lib/analytics";
import {
  peerPulseItems,
  scorePeerPulse,
  type PeerPulseResponses,
} from "@/lib/lms/peer-pulse";
import {
  deriveFacePattern,
  getTodayPulse,
  pulseSeries,
  recommendPracticesForFocus,
  saveFacePulse,
} from "@/lib/lms/face-tracking";
import { loadLmsState, saveLmsState, type LocalLmsState } from "@/lib/lms/store";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import { pushCoachProgressIfConsented } from "@/lib/lms/push-coach-progress";

const SCALE = [1, 2, 3, 4, 5] as const;

type Tab = "track" | "patterns" | "peer";

export default function PulsePage() {
  const [tab, setTab] = useState<Tab>("track");
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [scores, setScores] = useState<Partial<Record<ConstructId, number>>>(
    {}
  );
  const [focusFace, setFocusFace] = useState<ConstructId | undefined>();
  const [note, setNote] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [firstPulseCelebration, setFirstPulseCelebration] = useState(false);

  const [peerResponses, setPeerResponses] = useState<PeerPulseResponses>({});
  const [peerSaved, setPeerSaved] = useState<number | null>(null);
  const [observer, setObserver] = useState("");

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const today = getTodayPulse(s);
    if (today) {
      setScores(today.scores);
      setFocusFace(today.focusFace);
      setNote(today.note ?? "");
    }
    const peer = (s as LocalLmsState & {
      peerPulse?: { score: number; observer?: string };
    }).peerPulse;
    if (peer?.score != null) setPeerSaved(peer.score);
    track("page_view", { path: "/learn/pulse" });
  }, []);

  const pattern = useMemo(
    () => deriveFacePattern(state ?? undefined),
    [state]
  );

  const series = useMemo(
    () => pulseSeries(state ?? undefined, 14).map((d) => d.overall),
    [state]
  );

  const recommended = useMemo(
    () => recommendPracticesForFocus(pattern.weakest, 4),
    [pattern.weakest]
  );

  const ratedCount = constructs.filter(
    (c) => typeof scores[c.id] === "number"
  ).length;
  const canSave = ratedCount >= 3;
  const pulseCountBefore = state?.facePulses?.length ?? 0;

  function savePulse(source: "daily" | "weekly" | "quick") {
    if (!canSave) return;
    const wasFirst =
      !state?.firstRun?.firstPulse && pulseCountBefore === 0;
    const next = saveFacePulse({
      scores,
      focusFace,
      note,
      source,
    });
    setState(next);
    if (wasFirst) {
      setFirstPulseCelebration(true);
      setSavedMsg(null);
      track("first_pulse_complete", { source, faces: ratedCount });
    } else {
      setFirstPulseCelebration(false);
      setSavedMsg("Pulse saved. Patterns update as you log more days.");
    }
    track("face_pulse_save", {
      source,
      faces: ratedCount,
      focus: focusFace ?? null,
    });
    if (next.shareProgressWithCoach && next.orgCode) {
      void pushCoachProgressIfConsented(next);
    }
  }

  function submitPeer() {
    const score = scorePeerPulse(peerResponses);
    if (score == null) return;
    const s = loadLmsState() as LocalLmsState & {
      peerPulse?: {
        score: number;
        observer?: string;
        at: string;
        responses: PeerPulseResponses;
      };
    };
    s.peerPulse = {
      score,
      observer: observer || undefined,
      at: new Date().toISOString(),
      responses: peerResponses,
    };
    saveLmsState(s);
    setPeerSaved(score);
    setState(loadLmsState());
    track("peer_pulse_complete", { score });
  }

  const peerReady = peerPulseItems.every(
    (i) => peerResponses[i.id] >= 1 && peerResponses[i.id] <= 5
  );

  return (
    <LearnShell
      title="Face tracking"
      subtitle="Daily or weekly pulses across the six faces build patterns and guide deliberate practice."
    >
      {firstPulseCelebration && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-black/[0.08] bg-ink text-white">
          <div className="p-5 sm:p-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/50">
              First pulse complete
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
              Pattern engine is live.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Tomorrow’s nudge will use this baseline. Log a few more days and
              your weakest faces, trends, and practice plan will sharpen.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/learn/practice"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-ink"
              >
                Open recommended practice →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setFirstPulseCelebration(false);
                  setTab("patterns");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white"
              >
                View patterns
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl border border-black/[0.07] bg-[#fafafa] p-1">
        {(
          [
            ["track", "Track"],
            ["patterns", "Patterns"],
            ["peer", "Peer pulse"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              tab === id
                ? "bg-ink text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "track" && (
        <>
          {pulseCountBefore === 0 && !firstPulseCelebration && (
            <div className="mb-4 rounded-2xl border border-dashed border-black/[0.12] bg-white p-4">
              <p className="learn-eyebrow">First pulse</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Rate three or more faces · about 60 seconds
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate">
                This is how the cube starts forming patterns. Honest ratings beat
                perfect ones—you can update tomorrow.
              </p>
            </div>
          )}

          <div className="learn-card mb-4 !p-4">
            <p className="learn-eyebrow">Growth priority</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {pattern.insight}
            </p>
            {pattern.weakest.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pattern.weakest.map((id) => {
                  const c = constructs.find((x) => x.id === id)!;
                  return (
                    <span
                      key={id}
                      className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold text-white"
                      style={{ background: c.color }}
                    >
                      {c.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mb-3 text-[0.8125rem] text-slate">
            Rate at least three faces (1 = low energy / capacity today · 5 =
            strong). Optional focus face and note stay private.
          </p>

          <ul className="space-y-3">
            {constructs.map((c) => (
              <li key={c.id} className="learn-card !p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: c.color }}
                    >
                      {c.name}
                    </p>
                    <p className="text-[0.7rem] text-muted">{c.tagline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFocusFace((f) => (f === c.id ? undefined : c.id))
                    }
                    className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${
                      focusFace === c.id
                        ? "border-ink bg-ink text-white"
                        : "border-black/[0.1] text-muted"
                    }`}
                  >
                    {focusFace === c.id ? "Focus ✓" : "Focus"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {SCALE.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setScores((r) => ({ ...r, [c.id]: v }))
                      }
                      className={`rounded-lg border py-2 text-sm font-semibold ${
                        scores[c.id] === v
                          ? "border-ink bg-ink text-white"
                          : "border-black/[0.08] bg-[#fafafa] text-slate"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <label className="mt-4 block">
            <span className="text-[0.75rem] font-semibold text-muted">
              Optional note (device only)
            </span>
            <textarea
              className="learn-input mt-1 min-h-[4rem] w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is shaping these faces today?"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canSave}
              onClick={() => savePulse("daily")}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              Save daily pulse
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => savePulse("weekly")}
              className="learn-btn learn-btn-ghost disabled:opacity-40"
            >
              Save as weekly check-in
            </button>
          </div>

          {savedMsg && (
            <p className="mt-3 rounded-xl bg-[#fafafa] px-4 py-3 text-sm text-ink">
              {savedMsg}{" "}
              <Link href="/learn/practice" className="font-semibold underline">
                Open recommended practice →
              </Link>
            </p>
          )}

          {pattern.pulseCount > 0 && (
            <p className="learn-meta mt-3">
              {pattern.pulseCount} pulse
              {pattern.pulseCount === 1 ? "" : "s"} in the last 28 days ·{" "}
              {pattern.consistency}% consistency
            </p>
          )}
        </>
      )}

      {tab === "patterns" && (
        <>
          <div className="learn-card mb-4 !p-4">
            <p className="learn-eyebrow">Insight</p>
            <p className="mt-1 text-sm text-ink">{pattern.insight}</p>
          </div>

          <div className="learn-card mb-4 !p-4">
            <p className="learn-eyebrow">14-day overall trend</p>
            <div className="mt-2">
              <FaceSparkline values={series} />
            </div>
            <p className="learn-meta mt-1">
              From daily face pulses (gaps = days without a log).
            </p>
          </div>

          <ul className="space-y-2">
            {constructs.map((c) => {
              const avg = pattern.averages[c.id];
              const t = pattern.trend[c.id] ?? "unknown";
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-white px-3 py-2.5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: c.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{c.name}</p>
                    <p className="text-[0.7rem] text-muted">
                      Trend: {t}
                      {avg != null ? ` · avg ~${avg}` : " · no pulse yet"}
                    </p>
                  </div>
                  {avg != null && (
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${avg}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {recommended.length > 0 && (
            <section className="mt-5">
              <h3 className="text-sm font-semibold text-ink">
                Recommended practices
              </h3>
              <ul className="mt-2 space-y-2">
                {recommended.map((p) => {
                  const c = constructs.find((x) => x.id === p.constructId);
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-sm"
                      style={
                        c
                          ? { boxShadow: `inset 3px 0 0 ${c.color}` }
                          : undefined
                      }
                    >
                      <span className="font-semibold text-ink">{p.title}</span>
                      <span className="text-muted"> · {p.minutes}m</span>
                      <p className="mt-0.5 text-[0.75rem] text-slate">
                        {p.prompt}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/learn/practice"
                className="mt-3 inline-flex text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Open today's micro-practice →
              </Link>
            </section>
          )}

          {pattern.pulseCount < 3 && (
            <p className="mt-4 text-sm text-slate">
              Patterns strengthen after a few days of tracking. Switch to the
              Track tab and log a quick pulse.
            </p>
          )}
        </>
      )}

      {tab === "peer" && (
        <>
          <p className="mb-4 text-sm text-slate">
            Optional 5-item observation after the programme. Developmental
            only—not hiring or clinical. Journals stay separate.
          </p>
          <div className="learn-card mb-4">
            <label className="block text-sm">
              <span className="learn-meta">Observer name (optional)</span>
              <input
                className="learn-input mt-1 w-full"
                value={observer}
                onChange={(e) => setObserver(e.target.value)}
                placeholder="Manager or peer"
              />
            </label>
          </div>

          <ul className="space-y-4">
            {peerPulseItems.map((item) => (
              <li key={item.id} className="learn-card !p-4">
                <p className="text-sm font-medium text-ink">{item.prompt}</p>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setPeerResponses((r) => ({ ...r, [item.id]: v }))
                      }
                      className={`rounded-lg border py-2 text-sm font-semibold ${
                        peerResponses[item.id] === v
                          ? "border-ink bg-ink text-white"
                          : "border-black/[0.08] bg-[#fafafa] text-slate"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="learn-meta mt-1.5 flex justify-between">
                  <span>Rarely</span>
                  <span>Consistently</span>
                </p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={!peerReady}
            onClick={submitPeer}
            className="learn-btn learn-btn-primary mt-5 disabled:opacity-40"
          >
            Save peer pulse
          </button>

          {peerSaved != null && (
            <p className="mt-4 rounded-xl bg-[#fafafa] px-4 py-3 text-sm text-ink">
              Pulse score (0–100):{" "}
              <strong className="tabular-nums">{peerSaved}</strong>. Share only
              with consent—not a formal appraisal.
            </p>
          )}
        </>
      )}
    </LearnShell>
  );
}
