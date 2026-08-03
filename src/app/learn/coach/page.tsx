"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs } from "@/lib/content";
import { track } from "@/lib/analytics";
import {
  buildReportSharePayload,
  encodeShareToken,
  ensureCertificateId,
  shareReportUrl,
} from "@/lib/lms/share";
import {
  loadLmsState,
  setCertificateMeta,
  type LocalLmsState,
} from "@/lib/lms/store";
import { createClient } from "@/lib/supabase/client";

type RosterRow = {
  userId: string;
  role: string;
  displayName: string | null;
  joinedAt: string;
  progress: {
    programme_id?: string;
    pathway_pct?: number;
    lessons_completed?: number;
    pre_overall?: number | null;
    post_overall?: number | null;
    growth?: number | null;
    certificate_id?: string | null;
    face_scores?: Record<
      string,
      { pre?: number; post?: number; mid?: number }
    > | null;
  } | null;
};

export default function CoachToolsPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [rosterMsg, setRosterMsg] = useState<string | null>(null);
  const [orgCode, setOrgCodeState] = useState("");
  const [createName, setCreateName] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    setOrgCodeState(s.orgCode || "DEMO2026");
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  function loadRoster(code: string) {
    void fetch(`/api/org/roster?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) {
          setRosterMsg(j.error);
          return;
        }
        setOrgName(j.org?.name || null);
        setRoster(j.roster || []);
        setRosterMsg(j.message || null);
      })
      .catch(() => setRosterMsg("Could not load roster"));
  }

  useEffect(() => {
    if (!email) return;
    loadRoster(orgCode || "DEMO2026");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg(null);
    const res = await fetch("/api/org/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createName,
        kind: "school",
        contactEmail: email,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setCreateMsg(j.error || "Create failed");
      return;
    }
    setCreateMsg(`Created ${j.org.code} — share this code with learners.`);
    setOrgCodeState(j.org.code);
    loadRoster(j.org.code);
  }

  function createShare() {
    const s = state ?? loadLmsState();
    const payload = buildReportSharePayload(s);
    if (!payload) {
      setError("Complete at least the baseline assessment to share growth.");
      setLink(null);
      return;
    }
    if (s.attempts.some((a) => a.phase === "post")) {
      const certId = ensureCertificateId(s);
      setCertificateMeta(certId);
      payload.certificateId = certId;
      // Register in cloud when possible
      void fetch("/api/certificates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: certId,
          learnerName: payload.name,
          programmeId: payload.programmeId,
          preOverall: payload.preOverall,
          postOverall: payload.postOverall,
          growth: payload.growth,
          orgCode: payload.orgCode,
        }),
      });
    }
    setError(null);
    const token = encodeShareToken(payload);
    const url = shareReportUrl(token);
    setLink(url);
    track("report_share", {
      hasPost: payload.postOverall != null,
      orgCode: payload.orgCode ?? "",
    });
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const pre = state?.attempts.find((a) => a.phase === "pre");
  const post = state?.attempts.find((a) => a.phase === "post");

  return (
    <LearnShell
      title="Coach & facilitator tools"
      subtitle="Share consented growth summaries and view cloud cohort roster when signed in as coach."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="learn-card">
          <h2 className="learn-card-title">Share this learner’s growth</h2>
          <p className="learn-body mt-2">
            Read-only snapshot (pre / post / construct deltas). Journals never
            leave the device.
          </p>
          <ul className="mt-3 space-y-1 text-[0.75rem] text-slate">
            <li>
              Baseline:{" "}
              <strong className="text-ink">
                {pre ? pre.result.overall : "not yet"}
              </strong>
            </li>
            <li>
              Post:{" "}
              <strong className="text-ink">
                {post ? post.result.overall : "not yet"}
              </strong>
            </li>
            <li>
              Cohort:{" "}
              <strong className="text-ink">{state?.orgCode || "none"}</strong>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createShare}
              className="learn-btn learn-btn-primary"
            >
              Generate share link
            </button>
            <Link href="/learn/report" className="learn-btn learn-btn-ghost">
              Open full report
            </Link>
          </div>
          {error && (
            <p className="mt-3 text-[0.8125rem] text-amber-800">{error}</p>
          )}
          {link && (
            <div className="mt-4 rounded-xl bg-[#f4f4f4] p-3">
              <p className="break-all text-[0.7rem] text-slate">{link}</p>
              <button
                type="button"
                onClick={copy}
                className="mt-2 text-[0.8125rem] font-semibold text-ink"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          )}
        </section>

        <section className="learn-card">
          <h2 className="learn-card-title">Create organisation</h2>
          <p className="learn-body mt-1">
            Signed-in coaches can create a cohort code (requires orgs SQL).
          </p>
          <form onSubmit={createOrg} className="mt-3 space-y-2">
            <input
              className="learn-input"
              placeholder="School or company name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
              disabled={!email}
            />
            <button
              type="submit"
              className="learn-btn learn-btn-primary"
              disabled={!email}
            >
              Create cohort
            </button>
          </form>
          {createMsg && (
            <p className="mt-2 text-[0.8125rem] font-medium text-ink">
              {createMsg}
            </p>
          )}
          {!email && (
            <p className="learn-meta mt-2">
              <Link
                href="/login?next=/learn/coach"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{" "}
              to create orgs.
            </p>
          )}
        </section>

        <section className="learn-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="learn-card-title">Cloud roster</h2>
            {email && orgCode && (
              <a
                href={`/api/org/export?code=${encodeURIComponent(orgCode)}`}
                className="text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Export CSV
              </a>
            )}
          </div>
          {!email && (
            <p className="learn-body mt-2">
              <Link
                href="/login?next=/learn/coach"
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{" "}
              and join{" "}
              <Link href="/learn/org" className="font-semibold text-ink">
                /learn/org
              </Link>{" "}
              as coach (try DEMO2026 after SQL).
            </p>
          )}
          {email && (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  className="learn-input max-w-[12rem]"
                  value={orgCode}
                  onChange={(e) => setOrgCodeState(e.target.value.toUpperCase())}
                  placeholder="CODE"
                />
                <button
                  type="button"
                  className="learn-btn learn-btn-ghost"
                  onClick={() => loadRoster(orgCode)}
                >
                  Load roster
                </button>
              </div>
              <p className="learn-meta mt-1">
                {orgName || "No org"} · signed in as {email}
              </p>
              {rosterMsg && (
                <p className="learn-meta mt-1 text-amber-800">{rosterMsg}</p>
              )}
              {roster.length === 0 ? (
                <p className="learn-body mt-3">
                  No members yet. Learners join the same code on /learn/org and
                  enable “Share progress with coach”.
                </p>
              ) : (
                <>
                  {/* Heat map: completion + growth bands (no ranking language) */}
                  <div className="mt-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                      Cohort heat · completion & growth
                    </p>
                    <p className="learn-meta mt-0.5">
                      Colours show effort and change—not fixed ability. Never
                      display as a public leaderboard.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {roster.map((r) => {
                        const pre = r.progress?.pre_overall;
                        const growth = r.progress?.growth;
                        const lessons = r.progress?.lessons_completed ?? 0;
                        const heat =
                          growth != null && growth >= 8
                            ? "#059669"
                            : growth != null && growth >= 3
                              ? "#3b82f6"
                              : lessons >= 3
                                ? "#a3a3a3"
                                : "#e5e5e5";
                        return (
                          <div
                            key={r.userId}
                            className="rounded-lg px-2 py-2 text-center text-[0.65rem] font-semibold text-white"
                            style={{ background: heat }}
                            title="Consented snapshot only"
                          >
                            <span className="block truncate">
                              {(r.displayName || "Learner").split(" ")[0]}
                            </span>
                            <span className="block opacity-90">
                              {lessons} sess
                              {pre != null ? ` · ${pre}` : ""}
                              {growth != null ? ` · Δ${growth}` : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Face-level heat from consented face_scores when present */}
                    <div className="mt-5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                        Face heat · cohort mean pre
                      </p>
                      <p className="learn-meta mt-0.5">
                        Real face scores when learners share progress (requires
                        face_scores column—run migration 004). Falls back to
                        overall pre mean if faces not yet synced.
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {(() => {
                          const faceMaps = roster
                            .map((r) => r.progress?.face_scores)
                            .filter(Boolean) as Record<
                            string,
                            { pre?: number }
                          >[];
                          const hasFaces = faceMaps.length > 0;
                          const means: Record<string, number> = {};
                          if (hasFaces) {
                            for (const c of constructs) {
                              const vals = faceMaps
                                .map((m) => m[c.id]?.pre)
                                .filter(
                                  (n): n is number => typeof n === "number"
                                );
                              if (vals.length)
                                means[c.id] =
                                  vals.reduce((a, b) => a + b, 0) /
                                  vals.length;
                            }
                          }
                          const overallFallback = (() => {
                            const pres = roster
                              .map((r) => r.progress?.pre_overall)
                              .filter(
                                (n): n is number => typeof n === "number"
                              );
                            return pres.length
                              ? pres.reduce((a, b) => a + b, 0) / pres.length
                              : 50;
                          })();
                          return constructs.map((c) => {
                            const mean = means[c.id] ?? overallFallback;
                            const intensity = Math.min(
                              1,
                              Math.max(0.25, mean / 100)
                            );
                            return (
                              <div
                                key={c.id}
                                className="rounded-lg px-1.5 py-2 text-center"
                                style={{
                                  background: c.color,
                                  opacity: 0.35 + intensity * 0.65,
                                }}
                              >
                                <p className="text-[0.6rem] font-bold text-white">
                                  {c.shortName}
                                </p>
                                <p className="text-[0.65rem] tabular-nums text-white/90">
                                  {Math.round(mean)}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-3 text-[0.65rem] text-muted">
                      <li>
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />{" "}
                        Strong growth
                      </li>
                      <li>
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />{" "}
                        Emerging growth
                      </li>
                      <li>
                        <span className="inline-block h-2 w-2 rounded-full bg-neutral-400" />{" "}
                        Active
                      </li>
                      <li>
                        <span className="inline-block h-2 w-2 rounded-full bg-neutral-200" />{" "}
                        Early
                      </li>
                    </ul>
                  </div>
                  <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                    {roster.map((r) => (
                      <li
                        key={r.userId}
                        className="rounded-lg border border-black/[0.06] bg-[#fafafa] px-3 py-2 text-[0.75rem]"
                      >
                        <p className="font-semibold text-ink">
                          {r.displayName || r.userId.slice(0, 8)}
                          <span className="ml-2 font-normal text-muted">
                            {r.role}
                          </span>
                        </p>
                        {r.progress ? (
                          <p className="mt-0.5 text-slate">
                            Lessons {r.progress.lessons_completed ?? 0}
                            {r.progress.pre_overall != null
                              ? ` · pre ${r.progress.pre_overall}`
                              : ""}
                            {r.progress.post_overall != null
                              ? ` · post ${r.progress.post_overall}`
                              : ""}
                            {r.progress.growth != null
                              ? ` · Δ ${r.progress.growth}`
                              : ""}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-muted">No snapshot yet</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>

        <section className="learn-card lg:col-span-2">
          <h2 className="learn-card-title">Construct colours · tools</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {constructs.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="font-medium text-ink">{c.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-[0.8125rem] font-semibold">
            <Link href="/facilitator" className="text-ink underline-offset-2 hover:underline">
              8-week calendar →
            </Link>
            <Link href="/team" className="text-ink underline-offset-2 hover:underline">
              Team cube →
            </Link>
            <Link href="/practices" className="text-ink underline-offset-2 hover:underline">
              Practice library →
            </Link>
          </div>
        </section>
      </div>
    </LearnShell>
  );
}
