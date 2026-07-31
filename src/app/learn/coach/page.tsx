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

  useEffect(() => {
    setState(loadLmsState());
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (!email) return;
    const code = loadLmsState().orgCode || "DEMO2026";
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
  }, [email]);

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
          <h2 className="learn-card-title">Cloud roster</h2>
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
              <p className="learn-meta mt-1">
                {orgName || "No org"} · signed in as {email}
              </p>
              {rosterMsg && (
                <p className="learn-meta mt-1 text-amber-800">{rosterMsg}</p>
              )}
              {roster.length === 0 ? (
                <p className="learn-body mt-3">
                  No members yet. Learners join the same code on /learn/org.
                </p>
              ) : (
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
              )}
            </>
          )}
        </section>

        <section className="learn-card lg:col-span-2">
          <h2 className="learn-card-title">Construct colours</h2>
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
        </section>
      </div>
    </LearnShell>
  );
}
