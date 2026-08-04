"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DailyCheckInPanel } from "@/components/learn/DailyCheckInPanel";
import {
  LearnCard,
  LearnCardBody,
  LearnPage,
  LearnPageActions,
} from "@/components/learn/LearnPage";
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

type Mode = "checkin" | "patterns" | "peer";

export default function PulsePage() {
  const [mode, setMode] = useState<Mode>("checkin");
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [peerResponses, setPeerResponses] = useState<PeerPulseResponses>({});
  const [peerSaved, setPeerSaved] = useState<number | null>(null);
  const [observer, setObserver] = useState("");

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const peer = (
      s as LocalLmsState & { peerPulse?: { score: number; observer?: string } }
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
    () => recommendPracticesForFocus(pattern.weakest, 3),
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
      <LearnShell>
        <LearnPage>
          <p className="text-sm text-muted">Loading…</p>
        </LearnPage>
      </LearnShell>
    );
  }

  return (
    <LearnShell>
      <LearnPage>
        {/* Mode switcher — discrete pages within Check-in */}
        <div className="flex gap-1 rounded-2xl border border-black/[0.07] bg-white p-1">
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
              onClick={() => setMode(id)}
              className={`flex-1 rounded-xl py-2.5 text-[0.8125rem] font-semibold transition ${
                mode === id
                  ? "bg-ink text-white"
                  : "text-slate hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "checkin" && (
          <DailyCheckInPanel
            state={state}
            onSaved={(next) => setState(next)}
          />
        )}

        {mode === "patterns" && (
          <div className="space-y-5">
            <LearnCard>
              <LearnCardBody>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  Patterns
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  {pattern.insight}
                </h2>
                <p className="mt-1 text-[0.75rem] text-muted">
                  {pattern.pulseCount} check-ins · {pattern.consistency}%{" "}
                  consistency
                </p>
                <div className="mt-4">
                  <FaceSparkline values={series} />
                </div>
              </LearnCardBody>
            </LearnCard>
            {recommended.length > 0 && (
              <LearnCard tone="soft">
                <LearnCardBody>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    Suggested practices
                  </p>
                  <ul className="mt-3 space-y-2">
                    {recommended.map((p) => {
                      const meta = constructs.find(
                        (c) => c.id === p.constructId
                      );
                      return (
                        <li
                          key={p.id}
                          className="rounded-xl bg-white px-3 py-2.5 text-sm"
                          style={
                            meta
                              ? { boxShadow: `inset 3px 0 0 ${meta.color}` }
                              : undefined
                          }
                        >
                          <span className="font-semibold text-ink">
                            {p.title}
                          </span>
                          <span className="mt-0.5 block text-[0.75rem] text-muted">
                            {p.minutes} min · {meta?.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </LearnCardBody>
              </LearnCard>
            )}
            <LearnPageActions
              primary={{ href: "/learn/practice", label: "Open practice →" }}
              secondary={{
                label: "Back to check-in",
                onClick: () => setMode("checkin"),
              }}
              tertiary={{ href: "/learn", label: "Today" }}
            />
          </div>
        )}

        {mode === "peer" && (
          <div className="space-y-5">
            <LearnCard>
              <LearnCardBody>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  Peer pulse
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  Optional observation
                </h2>
                <p className="mt-1 text-sm text-slate">
                  Five items for someone who sees you lead. Stored on this
                  device.
                </p>
                {peerSaved != null && (
                  <p className="mt-3 text-sm font-semibold text-emerald-800">
                    Last peer score: {peerSaved}/5
                  </p>
                )}
                <label className="mt-4 block">
                  <span className="text-[0.75rem] font-semibold text-muted">
                    Observer (optional)
                  </span>
                  <input
                    className="learn-input mt-1 w-full"
                    value={observer}
                    onChange={(e) => setObserver(e.target.value)}
                    placeholder="Manager · peer"
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
                              setPeerResponses((r) => ({
                                ...r,
                                [item.id]: v,
                              }))
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
              </LearnCardBody>
            </LearnCard>
            <LearnPageActions
              primary={{
                label: "Save peer pulse",
                onClick: submitPeer,
                disabled: !peerReady,
              }}
              secondary={{
                label: "Back to check-in",
                onClick: () => setMode("checkin"),
              }}
            />
          </div>
        )}
      </LearnPage>
    </LearnShell>
  );
}
