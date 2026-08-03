"use client";

import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import {
  peerPulseItems,
  scorePeerPulse,
  type PeerPulseResponses,
} from "@/lib/lms/peer-pulse";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";

/**
 * Manager / peer 5-item observation pulse (optional, post-programme).
 */
export default function PeerPulsePage() {
  const [responses, setResponses] = useState<PeerPulseResponses>({});
  const [saved, setSaved] = useState<number | null>(null);
  const [observer, setObserver] = useState("");

  useEffect(() => {
    const s = loadLmsState() as ReturnType<typeof loadLmsState> & {
      peerPulse?: { score: number; observer?: string; at: string };
    };
    if (s.peerPulse?.score != null) setSaved(s.peerPulse.score);
    track("page_view", { path: "/learn/pulse" });
  }, []);

  function submit() {
    const score = scorePeerPulse(responses);
    if (score == null) return;
    const state = loadLmsState() as ReturnType<typeof loadLmsState> & {
      peerPulse?: { score: number; observer?: string; at: string; responses: PeerPulseResponses };
    };
    state.peerPulse = {
      score,
      observer: observer || undefined,
      at: new Date().toISOString(),
      responses,
    };
    saveLmsState(state);
    setSaved(score);
    track("peer_pulse_complete", { score });
  }

  const ready = peerPulseItems.every(
    (i) => responses[i.id] >= 1 && responses[i.id] <= 5
  );

  return (
    <LearnShell
      title="Peer / manager pulse"
      subtitle="Optional 5-item observation after the programme. Developmental only—not hiring or clinical. Journals stay separate."
    >
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
                    setResponses((r) => ({ ...r, [item.id]: v }))
                  }
                  className={`rounded-lg border py-2 text-sm font-semibold ${
                    responses[item.id] === v
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
        disabled={!ready}
        onClick={submit}
        className="learn-btn learn-btn-primary mt-5 disabled:opacity-40"
      >
        Save pulse
      </button>

      {saved != null && (
        <p className="mt-4 rounded-xl bg-[#fafafa] px-4 py-3 text-sm text-ink">
          Pulse score (0–100):{" "}
          <strong className="tabular-nums">{saved}</strong>. Share only with
          consent—not a formal appraisal.
        </p>
      )}
    </LearnShell>
  );
}
