"use client";

import { useEffect, useState } from "react";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import {
  MIN_PEERS_TO_SHOW,
  gapLabel,
  type CheckinRelationship,
  type FaceRating,
} from "@/lib/lms/checkin";
import type { ProgrammeId } from "@/lib/programmes";

type Invite = { id: string; relationship: CheckinRelationship; email: string; status: "sent" | "completed" | "expired" };
type Group = { completed: number; shown: boolean; scores: FaceRating[] | null };
type Load = {
  invites: Invite[];
  self: FaceRating[] | null;
  groups: { manager: Group; peer: Group; others: Group };
};

const NOTE: Record<string, string> = {
  sign_in: "Sign in to invite your manager and peers.",
  adults_only: "Check-ins are for adults.",
  not_ready: "Check-ins are not switched on yet",
  invalid: "Add a valid email address.",
  limit: "You can invite up to 3 managers and 12 peers.",
  own_email: "Use your manager's or a peer's email, not your own.",
  send_failed: "We could not send every invitation. Check the addresses and try again.",
  unavailable: "We could not send every invitation. Check the addresses and try again.",
};

/**
 * Learner results: invite a manager and peers by email, then compare the
 * self-report with their ratings on the same six faces.
 */
export function CheckinPanel({ minor, programmeId }: { minor: boolean; programmeId?: string | null }) {
  const { t, locale, fill } = useLmsT();
  const adults = !programmeId || programmeId === "adults";
  const [load, setLoad] = useState<Load | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [manager, setManager] = useState("");
  const [peers, setPeers] = useState<string[]>(["", ""]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (minor || !adults) return;
    void fetch("/api/lms/checkins", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) setLoad({ invites: j.invites ?? [], self: j.self ?? null, groups: j.groups });
        else setBlocked(String(j.error || "unavailable"));
      })
      .catch(() => setBlocked("unavailable"));
  }, [minor, adults]);

  if (minor || !adults) return null;

  async function send() {
    setNote(null);
    const invites = [
      ...(manager.trim() ? [{ email: manager.trim(), relationship: "manager" as const }] : []),
      ...peers.filter((p) => p.trim()).map((email) => ({ email: email.trim(), relationship: "peer" as const })),
    ];
    if (invites.length === 0) {
      setNote("invalid");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/lms/checkins", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invites, programmeId: (programmeId as ProgrammeId) || "adults", locale }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok && j.ok) {
      setNote(j.failed ? "send_failed" : "sent");
      setManager("");
      setPeers(["", ""]);
      const again = await fetch("/api/lms/checkins", { cache: "no-store" }).then((x) => x.json()).catch(() => null);
      if (again?.ok) setLoad({ invites: again.invites ?? [], self: again.self ?? null, groups: again.groups });
    } else {
      setNote(String(j.error || "send_failed"));
    }
  }

  const others = load?.groups.others;
  const statusLabel = { sent: t("Sent"), completed: t("Completed"), expired: t("Expired") };

  return (
    <section className="learn-card mt-4 sm:mt-5 print:break-inside-avoid" aria-labelledby="checkin-h" data-testid="checkin-panel">
      <p className="learn-eyebrow">Super-Cube®</p>
      <h2 id="checkin-h" className="learn-card-title">{t("Manager and peer check-in")}</h2>
      <p className="learn-body mt-1">
        {t("Invite your manager and peers by email. They rate you on the same six Super-Cube® faces as your self-report. You see your score next to theirs.")}
      </p>
      <p className="learn-meta mt-1">
        {t("Your manager's rating is shown to you. Peer ratings stay hidden until at least 3 peers have answered, so one colleague cannot be singled out.")}
      </p>
      <p className="learn-meta mt-1">{t("Development only. These ratings are not for pay, hiring or discipline.")}</p>

      {blocked && <p className="mt-3 text-[0.8125rem] font-medium text-amber-900" role="status">{t(NOTE[blocked] ?? NOTE.unavailable)}</p>}

      {!blocked && (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="learn-label">{t("Manager email")}</span>
            <input
              type="email"
              value={manager}
              autoComplete="off"
              maxLength={120}
              onChange={(e) => setManager(e.target.value)}
              className="learn-input mt-1.5"
              placeholder="manager@company.com"
            />
          </label>
          <fieldset>
            <legend className="learn-label">{t("Peer emails")}</legend>
            <div className="mt-1.5 space-y-2">
              {peers.map((value, i) => (
                <div key={i} className="flex gap-2">
                  <label className="sr-only" htmlFor={`peer-email-${i}`}>{t("Peer emails")}</label>
                  <input
                    id={`peer-email-${i}`}
                    type="email"
                    value={value}
                    autoComplete="off"
                    maxLength={120}
                    onChange={(e) => setPeers((xs) => xs.map((x, k) => (k === i ? e.target.value : x)))}
                    className="learn-input"
                    placeholder="peer@company.com"
                  />
                  {peers.length > 1 && (
                    <button
                      type="button"
                      className="learn-btn learn-btn-ghost shrink-0"
                      onClick={() => setPeers((xs) => xs.filter((_, k) => k !== i))}
                    >
                      {t("Remove peer")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="learn-btn learn-btn-ghost"
              disabled={peers.length >= 12}
              onClick={() => setPeers((xs) => [...xs, ""])}
            >
              {t("Add a peer")}
            </button>
            <button type="button" className="learn-btn learn-btn-primary" disabled={busy} onClick={() => void send()}>
              {t("Send invitations")}
            </button>
          </div>
        </div>
      )}

      {note && (
        <p className="mt-2 text-[0.8125rem] font-medium text-ink" role="status">
          {note === "sent" ? t("Invitation sent.") : t(NOTE[note] ?? NOTE.send_failed)}
        </p>
      )}

      {load && load.invites.length > 0 && (
        <ul className="mt-3 space-y-1 text-[0.8125rem] text-slate" data-testid="checkin-invites">
          {load.invites.map((i) => (
            <li key={i.id} className="flex flex-wrap justify-between gap-2">
              <span>{i.relationship === "manager" ? t("Manager") : t("Peers")} · {i.email}</span>
              <span>{statusLabel[i.status]}</span>
            </li>
          ))}
        </ul>
      )}

      {load && !load.self && <p className="learn-meta mt-3">{t("No self-report on the server yet. Complete your baseline, then come back to compare.")}</p>}

      {load?.self && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-start text-[0.8125rem]">
            <caption className="sr-only">{t("Manager and peer check-in")}</caption>
            <thead>
              <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.08em] text-muted">
                <th scope="col" className="py-2 pe-2 text-start">{t("Face")}</th>
                <th scope="col" className="px-1 py-2 text-end">{t("Self")}</th>
                <th scope="col" className="px-1 py-2 text-end">{t("Manager")}</th>
                <th scope="col" className="px-1 py-2 text-end">{t("Peers")}</th>
                <th scope="col" className="px-1 py-2 text-end">{t("Others")}</th>
                <th scope="col" className="py-2 ps-1 text-end">{t("Gap")}</th>
              </tr>
            </thead>
            <tbody>
              {constructs.map((c) => {
                const you = load.self?.find((s) => s.constructId === c.id)?.score ?? null;
                const managerScore = load.groups.manager.shown ? load.groups.manager.scores?.find((s) => s.constructId === c.id)?.score ?? null : null;
                const peerScore = load.groups.peer.shown ? load.groups.peer.scores?.find((s) => s.constructId === c.id)?.score ?? null : null;
                const otherScore = others?.shown ? others.scores?.find((s) => s.constructId === c.id)?.score ?? null : null;
                const gap = you != null && otherScore != null ? Math.round((otherScore - you) * 10) / 10 : null;
                const label = gapLabel(gap);
                return (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <th scope="row" className="face-ink py-2 pe-2 text-start font-semibold" style={faceInkStyle(c.color)}>{t(c.name)}</th>
                    <td className="px-1 py-2 text-end tabular-nums">{you ?? "—"}</td>
                    <td className="px-1 py-2 text-end tabular-nums">{managerScore ?? "—"}</td>
                    <td className="px-1 py-2 text-end tabular-nums">{peerScore ?? "—"}</td>
                    <td className="px-1 py-2 text-end tabular-nums">{otherScore ?? "—"}</td>
                    <td className="py-2 ps-1 text-end font-semibold tabular-nums">
                      {gap == null ? "—" : `${gap > 0 ? "+" : ""}${gap}`}
                      {label && <span className="ms-1 text-[0.625rem] font-semibold uppercase text-muted">{t(label)}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!load.groups.peer.shown && (
            <p className="learn-meta mt-2">
              {fill("Shown once {k} peers have answered", { k: MIN_PEERS_TO_SHOW })}
              {load.groups.peer.completed > 0 ? ` (${load.groups.peer.completed}/${MIN_PEERS_TO_SHOW})` : ""}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
