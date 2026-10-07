"use client";

import { useEffect, useState } from "react";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import {
  is360EnabledClient,
  MIN_RATERS_TO_SHOW,
  RELATIONSHIP_LABELS,
  type FaceObserverScore,
  type RaterRelationship,
} from "@/lib/lms/feedback360";
import type { ConstructScore } from "@/lib/lms/scoring";

type Group = { key: RaterRelationship | "all"; invited: number; completed: number; shown: boolean; scores: FaceObserverScore[] | null };
type Req = { id: string; createdAt: string; closesAt: string | null; groups: Group[] };

/**
 * Learner side of 360 feedback (Adults, behind NEXT_PUBLIC_LMS_360=on).
 * Invite raters with single-use links; results appear per group only once
 * MIN_RATERS_TO_SHOW have answered, next to the learner's own scores.
 */
export function Feedback360Panel({ self, minor }: { self: ConstructScore[] | null; minor: boolean }) {
  const enabled = is360EnabledClient();
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [rows, setRows] = useState<{ relationship: RaterRelationship; label: string }[]>([
    { relationship: "manager", label: "" },
    { relationship: "peer", label: "" },
    { relationship: "peer", label: "" },
    { relationship: "direct_report", label: "" },
  ]);
  const [links, setLinks] = useState<{ relationship: RaterRelationship; label: string | null; token: string }[] | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || minor) return;
    void fetch("/api/lms/feedback360", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setReqs(j.ok ? j.requests : []))
      .catch(() => setReqs([]));
  }, [enabled, minor]);

  if (!enabled || minor) return null;

  async function create() {
    setNote(null);
    const r = await fetch("/api/lms/feedback360", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ raters: rows.map((x) => ({ relationship: x.relationship, label: x.label || null })) }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.ok) setLinks(j.links);
    else setNote(j.error === "open_request_exists" ? "You already have an open feedback request." : String(j.error || "Sign in to invite raters."));
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const latest = reqs?.[0];
  const all = latest?.groups.find((g) => g.key === "all");

  return (
    <section className="learn-card mt-4 sm:mt-5 print:break-inside-avoid" aria-labelledby="fb360-h" data-testid="feedback-360">
      <p className="learn-eyebrow">Beta</p>
      <h2 id="fb360-h" className="learn-card-title">360 feedback: how others see you</h2>
      <p className="learn-body mt-1">
        Invite 3 to 12 people who see you at work. Each gets a single-use link to an 8-minute form. You only ever see
        averages, and only once at least {MIN_RATERS_TO_SHOW} people have answered, so their answers stay anonymous.
      </p>

      {links && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[0.8125rem] text-emerald-950" role="status">
          <p className="font-semibold">Copy these links now. For privacy we don&apos;t store them, so they can&apos;t be shown again.</p>
          <ul className="mt-2 space-y-1.5">
            {links.map((l) => (
              <li key={l.token} className="break-all">
                <strong>{l.label || RELATIONSHIP_LABELS[l.relationship]}:</strong> {origin}/feedback/360/{l.token}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!links && reqs && reqs.length === 0 && (
        <div className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor={`fb-l-${i}`}>Rater {i + 1} first name (optional)</label>
              <input
                id={`fb-l-${i}`}
                placeholder="First name (optional, only you see it)"
                value={r.label}
                maxLength={40}
                onChange={(e) => setRows((xs) => xs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))}
                className="min-h-10 flex-1 rounded-xl border border-line-strong bg-surface px-3 text-[0.8125rem]"
              />
              <label className="sr-only" htmlFor={`fb-r-${i}`}>Relationship</label>
              <select
                id={`fb-r-${i}`}
                value={r.relationship}
                onChange={(e) => setRows((xs) => xs.map((x, k) => (k === i ? { ...x, relationship: e.target.value as RaterRelationship } : x)))}
                className="min-h-10 rounded-xl border border-line-strong bg-surface px-3 text-[0.8125rem]"
              >
                {(Object.keys(RELATIONSHIP_LABELS) as RaterRelationship[]).map((k) => (
                  <option key={k} value={k}>{RELATIONSHIP_LABELS[k]}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="learn-btn learn-btn-ghost" disabled={rows.length >= 12} onClick={() => setRows((x) => [...x, { relationship: "peer", label: "" }])}>
              Add rater
            </button>
            <button type="button" className="learn-btn learn-btn-primary" disabled={rows.length < MIN_RATERS_TO_SHOW} onClick={() => void create()}>
              Create feedback links
            </button>
          </div>
        </div>
      )}

      {latest && (
        <div className="mt-3">
          <p className="learn-meta">
            {latest.groups
              .filter((g) => g.key !== "all" && g.invited > 0)
              .map((g) => `${RELATIONSHIP_LABELS[g.key as RaterRelationship]}: ${g.completed}/${g.invited}`)
              .join(" · ")}
          </p>
          {all?.shown && all.scores && (
            <table className="mt-3 w-full text-left text-[0.8125rem]">
              <caption className="sr-only">Your scores compared with the average of your raters</caption>
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="py-2 pr-2">Face</th>
                  <th scope="col" className="px-1 py-2 text-right">You</th>
                  <th scope="col" className="px-1 py-2 text-right">Others ({all.completed})</th>
                  <th scope="col" className="py-2 pl-1 text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                {constructs.map((c) => {
                  const you = self?.find((s) => s.constructId === c.id)?.score ?? null;
                  const them = all.scores!.find((s) => s.constructId === c.id)?.score ?? null;
                  const gap = you != null && them != null ? Math.round((them - you) * 10) / 10 : null;
                  return (
                    <tr key={c.id} className="border-b border-line last:border-0">
                      <th scope="row" className="face-ink py-2 pr-2 font-semibold" style={faceInkStyle(c.color)}>{c.name}</th>
                      <td className="px-1 py-2 text-right tabular-nums">{you ?? "—"}</td>
                      <td className="px-1 py-2 text-right tabular-nums">{them ?? "—"}</td>
                      <td className="py-2 pl-1 text-right font-semibold tabular-nums">
                        {gap == null ? "—" : `${gap > 0 ? "+" : ""}${gap}`}
                        {gap != null && Math.abs(gap) >= 10 && (
                          <span className="ml-1 text-[0.625rem] font-semibold uppercase text-muted">
                            {gap > 0 ? "others see more" : "you see more"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!all?.shown && (
            <p className="learn-meta mt-2">Results appear once at least {MIN_RATERS_TO_SHOW} people have answered.</p>
          )}
        </div>
      )}
      {note && <p className="mt-2 text-[0.8125rem] font-medium text-amber-900" role="status">{note}</p>}
    </section>
  );
}
