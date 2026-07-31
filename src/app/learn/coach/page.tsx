"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs } from "@/lib/content";
import {
  buildReportSharePayload,
  encodeShareToken,
  shareReportUrl,
} from "@/lib/lms/share";
import {
  loadLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { track } from "@/lib/analytics";

/**
 * Coach / facilitator toolkit on-device:
 * - Create a shareable growth link from the current learner (consent = they share)
 * - Instructions for cohort codes
 */
export default function CoachToolsPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setState(loadLmsState()), []);

  function createShare() {
    const s = state ?? loadLmsState();
    const payload = buildReportSharePayload(s);
    if (!payload) {
      setError("Complete at least the baseline assessment to share growth.");
      setLink(null);
      return;
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
      subtitle="Share consented growth summaries with a private link. Journals and raw reflections never leave the learner’s device unless they export a backup."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="learn-card">
          <h2 className="learn-card-title">Share this learner’s growth</h2>
          <p className="learn-body mt-2">
            Creates a read-only snapshot (pre / post / construct deltas). The
            learner should only share with a coach, parent, or HR partner they
            trust.
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
              <strong className="text-ink">
                {state?.orgCode || "none"}
              </strong>
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
          <h2 className="learn-card-title">Construct colours (quick ref)</h2>
          <ul className="mt-3 space-y-2">
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
          <Link
            href="/learn/org"
            className="mt-4 inline-block text-[0.8125rem] font-semibold text-ink"
          >
            Manage cohort code →
          </Link>
        </section>
      </div>
    </LearnShell>
  );
}
