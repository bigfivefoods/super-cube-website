"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DailyCheckInPanel } from "@/components/learn/DailyCheckInPanel";
import { LearnShell } from "@/components/learn/LearnShell";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import { constructs } from "@/lib/content";
import { track } from "@/lib/analytics";
import {
  peerPulseItems,
  scorePeerPulse,
  type PeerPulseResponses,
} from "@/lib/lms/peer-pulse";
import {
  deriveFacePattern,
  pulseSeries,
  recommendPracticesForFocus,
} from "@/lib/lms/face-tracking";
import { loadLmsState, saveLmsState, type LocalLmsState } from "@/lib/lms/store";

type Tab = "checkin" | "patterns" | "peer";

export default function PulsePage() {
  const [tab, setTab] = useState<Tab>("checkin");
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [peerResponses, setPeerResponses] = useState<PeerPulseResponses>({});
  const [peerSaved, setPeerSaved] = useState<number | null>(null);
  const [observer, setObserver] = useState("");

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const peer = (
      s as LocalLmsState & {
        peerPulse?: { score: number; observer?: string };
      }
    ).peerPulse;
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

  if (!state) {
    return (
      <LearnShell title="Daily check-in" wide>
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  return (
    <LearnShell wide>
      <div className="mb-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Check-in
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Daily leadership pulse
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          Calendar-backed journal with three slider questions per face—fast,
          beautiful, private. Patterns and peer observation live on the tabs
          below.
        </p>
      </div>

      <div className="mb-5 flex gap-1 rounded-2xl border border-black/[0.07] bg-white p-1 shadow-sm">
        {(
          [
            ["checkin", "Check-in"],
            ["patterns", "Patterns"],
            ["peer", "Peer"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl py-2.5 text-[0.8125rem] font-semibold transition ${
              tab === id
                ? "bg-ink text-white"
                : "text-slate hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "checkin" && (
        <DailyCheckInPanel
          state={state}
          onSaved={(next) => setState(next)}
        />
      )}

      {tab === "patterns" && (
        <section className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.05] px-5 py-5 sm:px-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Patterns
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">
              {pattern.insight}
            </h2>
            <p className="learn-meta mt-1">
              {pattern.pulseCount} check-ins · {pattern.consistency}% consistency
            </p>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <FaceSparkline values={series} />
          </div>
          {recommended.length > 0 && (
            <div className="border-t border-black/[0.05] px-5 py-4 sm:px-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Recommended practices
              </p>
              <ul className="mt-3 space-y-2">
                {recommended.map((p) => {
                  const meta = constructs.find((c) => c.id === p.constructId);
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl bg-[#fafafa] px-3 py-2.5 text-sm"
                      style={
                        meta
                          ? { boxShadow: `inset 3px 0 0 ${meta.color}` }
                          : undefined
                      }
                    >
                      <span className="font-semibold text-ink">{p.title}</span>
                      <span className="mt-0.5 block text-[0.75rem] text-muted">
                        {p.minutes} min · {meta?.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/learn/practice"
                className="mt-4 inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-white"
              >
                Open micro-practice →
              </Link>
            </div>
          )}
        </section>
      )}

      {tab === "peer" && (
        <section className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Peer / manager pulse
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">
            Optional 5-item observation
          </h2>
          <p className="mt-1 text-sm text-slate">
            Someone who sees you lead can rate five behaviours. Stored on this
            device only unless you share with a coach.
          </p>
          {peerSaved != null && (
            <p className="mt-3 text-sm font-semibold text-emerald-800">
              Last peer score: {peerSaved}/5
            </p>
          )}
          <label className="mt-4 block">
            <span className="text-[0.75rem] font-semibold text-muted">
              Observer name (optional)
            </span>
            <input
              className="learn-input mt-1 w-full"
              value={observer}
              onChange={(e) => setObserver(e.target.value)}
              placeholder="e.g. Manager · peer"
            />
          </label>
          <div className="mt-4 space-y-4">
            {peerPulseItems.map((item) => (
              <fieldset key={item.id}>
                <legend className="text-[0.8125rem] font-medium text-ink">
                  {item.prompt}
                </legend>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
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
                          : "border-black/[0.1] bg-[#fafafa] text-slate"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <button
            type="button"
            disabled={!peerReady}
            onClick={submitPeer}
            className="learn-btn learn-btn-primary mt-5 disabled:opacity-40"
          >
            Save peer pulse
          </button>
        </section>
      )}
    </LearnShell>
  );
}
