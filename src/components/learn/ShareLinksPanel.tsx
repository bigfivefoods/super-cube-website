"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { formatDateZA } from "@/lib/datetime";
import { DEFAULT_SHARE_DAYS, SHARE_LINK_DAYS, type ShareLinkSummary } from "@/lib/lms/share";
import type { ProgrammeId } from "@/lib/programmes";

const noopSubscribe = () => () => {};

type Load =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "unavailable" }
  | { kind: "ready"; links: ShareLinkSummary[] };

/**
 * Create, copy and turn off growth-report share links (server-backed).
 * The link holds a random token only; scores are read from the server when it is opened.
 */
export function ShareLinksPanel({
  programmeId,
  minor = false,
  hasBaseline = true,
  headingLevel = 2,
}: {
  programmeId: ProgrammeId;
  minor?: boolean;
  hasBaseline?: boolean;
  headingLevel?: 2 | 3;
}) {
  const uid = useId();
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [days, setDays] = useState<number>(DEFAULT_SHARE_DAYS);
  const [label, setLabel] = useState("");
  const [showName, setShowName] = useState(!minor);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<{ url: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmOff, setConfirmOff] = useState<string | null>(null);
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => "share" in navigator,
    () => false,
  );
  const H = headingLevel === 2 ? "h2" : "h3";

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/lms/shares", { cache: "no-store" });
      if (res.status === 401) return setLoad({ kind: "signed_out" });
      if (!res.ok) return setLoad({ kind: "unavailable" });
      const j = (await res.json()) as { links: ShareLinkSummary[] };
      setLoad({ kind: "ready", links: j.links });
    } catch {
      setLoad({ kind: "unavailable" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFresh(null);
    try {
      const res = await fetch("/api/lms/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programmeId, days, label: label.trim() || undefined, showName }),
      });
      const j = (await res.json().catch(() => ({}))) as { path?: string; link?: ShareLinkSummary; message?: string; error?: string };
      if (res.status === 401) {
        setLoad({ kind: "signed_out" });
        return;
      }
      if (!res.ok || !j.path || !j.link) {
        setError(j.message || "Couldn’t create the link. Please try again.");
        return;
      }
      setFresh({ url: `${window.location.origin}${j.path}`, id: j.link.id });
      setCopied(false);
      setLabel("");
      track("report_share", { days, named: showName });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function turnOff(id: string) {
    setError(null);
    const res = await fetch(`/api/lms/shares/${id}`, { method: "DELETE" });
    setConfirmOff(null);
    if (!res.ok && res.status !== 404) {
      setError("Couldn’t turn the link off. Please try again.");
      return;
    }
    if (fresh?.id === id) setFresh(null);
    await refresh();
  }

  async function copy() {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const active = load.kind === "ready" ? load.links.filter((l) => l.status === "active") : [];
  const past = load.kind === "ready" ? load.links.filter((l) => l.status !== "active").slice(0, 5) : [];

  return (
    <section className="learn-card" aria-labelledby={`${uid}-h`} data-testid="share-links">
      <H id={`${uid}-h`} className="learn-card-title">
        Share your growth
      </H>
      <p className="learn-body mt-1.5">
        Send a coach or mentor a private link to your scores. It expires, you can turn it off at any time, and your
        journals and answers are never shared.
      </p>

      {load.kind === "loading" && <p className="learn-meta mt-3">Loading your links…</p>}

      {load.kind === "signed_out" && (
        <div className="mt-3">
          <p className="learn-body">Sign in to create a share link. Your scores need to be saved to your account first.</p>
          <Link href="/login?next=/learn/report" className="learn-btn learn-btn-primary mt-3">
            Sign in to share
          </Link>
        </div>
      )}

      {load.kind === "unavailable" && (
        <p className="learn-meta mt-3" role="status">
          Sharing isn’t available right now. Please try again later.
        </p>
      )}

      {load.kind === "ready" && !hasBaseline && (
        <p className="learn-body mt-3">Take your baseline first, then you can share your growth.</p>
      )}

      {load.kind === "ready" && hasBaseline && (
        <>
          <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-label`} className="block text-[0.8125rem] font-semibold text-ink">
                  Who is it for? <span className="font-normal text-slate">(optional)</span>
                </label>
                <input
                  id={`${uid}-label`}
                  value={label}
                  maxLength={80}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My coach, Thandi"
                  className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-days`} className="block text-[0.8125rem] font-semibold text-ink">
                  Link works for
                </label>
                <select
                  id={`${uid}-days`}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  {SHARE_LINK_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-start gap-2 text-[0.8125rem] text-slate sm:col-span-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                <span>{minor ? "Show my first name" : "Show my name"} on the shared report</span>
              </label>
            </div>
            <button type="submit" disabled={busy} className="learn-btn learn-btn-primary disabled:opacity-50">
              {busy ? "Creating…" : "Create link"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-[0.8125rem] font-medium text-red-800" role="alert">
              {error}
            </p>
          )}

          {fresh && (
            <div className="mt-4 rounded-xl border border-ink/20 bg-surface p-3" role="status" data-testid="share-fresh">
              <p className="text-[0.8125rem] font-semibold text-ink">Your link is ready</p>
              <label htmlFor={`${uid}-url`} className="sr-only">
                Share link
              </label>
              <input
                id={`${uid}-url`}
                readOnly
                value={fresh.url}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 w-full rounded-lg border border-line bg-elevated px-3 py-2 font-mono text-[0.75rem] text-ink"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={copy} className="learn-btn learn-btn-primary !min-h-10">
                  {copied ? "Copied" : "Copy link"}
                </button>
                {canShare && (
                  <button
                    type="button"
                    className="learn-btn learn-btn-ghost !min-h-10"
                    onClick={() => void navigator.share({ title: "My Super-Cube® growth report", url: fresh.url }).catch(() => {})}
                  >
                    Share…
                  </button>
                )}
              </div>
              <p className="learn-meta mt-2">Copy it now. For your privacy we only show a link once; you can always make a new one.</p>
            </div>
          )}

          <H className="mt-6 text-[0.8125rem] font-semibold text-ink">Active links ({active.length})</H>
          {active.length === 0 ? (
            <p className="learn-meta mt-1">No active links.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
              {active.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5" data-testid="share-link-row">
                  <div className="min-w-0">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{l.label || "Share link"}</p>
                    <p className="learn-meta">
                      Made {formatDateZA(l.createdAt)} · expires {formatDateZA(l.expiresAt)} · {l.viewCount}{" "}
                      {l.viewCount === 1 ? "view" : "views"}
                      {l.showName ? "" : " · name hidden"}
                    </p>
                  </div>
                  {confirmOff === l.id ? (
                    <span className="flex gap-2">
                      <button type="button" className="learn-btn learn-btn-primary !min-h-10" onClick={() => void turnOff(l.id)}>
                        Turn off
                      </button>
                      <button type="button" className="learn-btn learn-btn-ghost !min-h-10" onClick={() => setConfirmOff(null)}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="learn-btn learn-btn-ghost !min-h-10"
                      onClick={() => setConfirmOff(l.id)}
                      aria-label={`Turn off ${l.label || "share link"}`}
                    >
                      Turn off
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {past.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[0.8125rem] font-semibold text-slate">Past links</summary>
              <ul className="mt-2 space-y-1">
                {past.map((l) => (
                  <li key={l.id} className="learn-meta">
                    {l.label || "Share link"} · {l.status === "revoked" ? "turned off" : "expired"}{" "}
                    {formatDateZA(l.revokedAt ?? l.expiresAt)} · {l.viewCount} {l.viewCount === 1 ? "view" : "views"}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
