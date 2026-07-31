"use client";

import { useEffect, useMemo, useState } from "react";
import { DownloadReportButton } from "@/components/learn/DownloadReportButton";
import { LearnShell } from "@/components/learn/LearnShell";
import { RadarChart } from "@/components/learn/RadarChart";
import { Button } from "@/components/ui";
import { downloadCompletionCertificate } from "@/lib/lms/certificate-pdf";
import {
  compareAttempts,
  recommendations,
} from "@/lib/lms/scoring";
import { depthLabel } from "@/lib/lms/orientation";
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
import { getProgramme } from "@/lib/programmes";
import { track } from "@/lib/analytics";

export default function ReportPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  useEffect(() => setState(loadLmsState()), []);

  const orientation = state?.orientation;
  const pre = state?.attempts.find((a) => a.phase === "pre");
  const post = state?.attempts.find((a) => a.phase === "post");
  const programmeId =
    pre?.programmeId ||
    state?.subscription?.programmeId ||
    state?.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;

  const comparison = useMemo(() => {
    if (!pre) return null;
    return compareAttempts(pre.result, post?.result);
  }, [pre, post]);

  const recs = pre
    ? recommendations(post?.result ?? pre.result)
    : [];

  if (!state) {
    return (
      <LearnShell title="Report">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  if (!pre) {
    return (
      <LearnShell
        title="Step 6 · See your growth report"
        subtitle="Complete Steps 2–3 first (orient + baseline) to unlock your Super-Cube® profile."
      >
        <div className="flex flex-wrap gap-2">
          {!orientation && (
            <Button
              href="/learn/assessment/orientation"
              variant="primary"
              className="!min-h-9 !py-1.5 !text-[0.8125rem]"
            >
              Start pre-pre assessment
            </Button>
          )}
          <Button
            href="/learn/assessment/pre"
            variant={orientation ? "primary" : "ghost"}
            className="!min-h-9 !py-1.5 !text-[0.8125rem]"
          >
            Start pre-assessment
          </Button>
        </div>
        {orientation && (
          <p className="learn-body mt-4">
            Orientation complete:{" "}
            <strong className="font-semibold text-ink">
              {orientation.result.label}
            </strong>
            . {orientation.result.summary}
          </p>
        )}
      </LearnShell>
    );
  }

  const growth =
    post != null
      ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
      : null;

  return (
    <LearnShell
      title="Step 6 · See your growth report"
      subtitle={`${programme?.name ?? "Super-Cube®"} · Developmental profile (not a clinical diagnosis)${
        post
          ? "—pre to post growth after your programme."
          : "—baseline view. Complete all courses, then the post-assessment, to see full growth."
      }`}
    >
      {!post && (
        <div className="mb-4 rounded-2xl border border-ink bg-white p-4 sm:flex sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="learn-eyebrow">Step 5 · After the full programme</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              Take the post-assessment to measure how you’ve grown
            </p>
            <p className="learn-meta mt-0.5">
              Same six faces as your baseline. Unlocks pre → post comparison on
              this report and in your PDF download.
            </p>
          </div>
          <Button
            href="/learn/assessment/post"
            variant="primary"
            className="mt-3 !min-h-10 shrink-0 !text-[0.8125rem] sm:mt-0"
          >
            Start post-assessment →
          </Button>
        </div>
      )}

      {/* Overall pre / post / growth */}
      <section className="mb-4 grid gap-2 sm:mb-5 sm:grid-cols-3">
        <div className="learn-card !p-4">
          <p className="learn-eyebrow">Pre · baseline</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {pre.result.overall}
          </p>
          <p className="learn-meta mt-0.5">
            {new Date(pre.completedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="learn-card !p-4">
          <p className="learn-eyebrow">Post · after programme</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {post ? post.result.overall : "—"}
          </p>
          <p className="learn-meta mt-0.5">
            {post
              ? new Date(post.completedAt).toLocaleDateString()
              : "Not taken yet"}
          </p>
        </div>
        <div className="learn-card !p-4">
          <p className="learn-eyebrow">Overall growth</p>
          <p
            className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${
              growth !== null && growth >= 0 ? "text-ink" : "text-slate"
            }`}
          >
            {growth === null
              ? "—"
              : `${growth > 0 ? "+" : ""}${growth}`}
            {growth !== null && (
              <span className="ml-1 text-sm font-medium text-muted">pts</span>
            )}
          </p>
          <p className="learn-meta mt-0.5">
            {post ? "Pre → post change" : "Complete post-assessment"}
          </p>
        </div>
      </section>

      {post && (
        <div className="mb-4 rounded-2xl border border-ink bg-white p-4 sm:flex sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="learn-eyebrow">Pathway complete</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              Certificate of completion + shareable growth PDF
            </p>
            <p className="learn-meta mt-0.5">
              Proof of deliberate practice across all six Super-Cube® faces
            </p>
          </div>
          <button
            type="button"
            className="learn-btn learn-btn-primary mt-3 sm:mt-0"
            onClick={() => {
              const certId = ensureCertificateId(state);
              const next = setCertificateMeta(certId);
              setState(next);
              downloadCompletionCertificate({
                state: next,
                pre,
                post,
                certificateId: certId,
              });
              track("certificate_download", { certificateId: certId });
              void fetch("/api/certificates/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: certId,
                  learnerName:
                    next.user?.fullName || next.user?.email || "Learner",
                  programmeId: programmeId,
                  preOverall: pre.result.overall,
                  postOverall: post.result.overall,
                  growth:
                    Math.round(
                      (post.result.overall - pre.result.overall) * 10
                    ) / 10,
                  orgCode: next.orgCode,
                }),
              });
            }}
          >
            Download certificate (PDF)
          </button>
        </div>
      )}

      {/* Coach-shareable growth link */}
      <div className="mb-4 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
        <p className="learn-eyebrow">Share with a coach (consent)</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          Private growth summary link
        </p>
        <p className="learn-meta mt-0.5">
          Pre/post scores only—journals stay on this device. Only share with
          someone you trust.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="learn-btn learn-btn-primary"
            onClick={() => {
              const payload = buildReportSharePayload(state);
              if (!payload) return;
              if (post) {
                const certId = ensureCertificateId(state);
                setCertificateMeta(certId);
                payload.certificateId = certId;
              }
              const url = shareReportUrl(encodeShareToken(payload));
              setShareUrl(url);
              track("report_share", {
                hasPost: post != null,
              });
            }}
          >
            Generate share link
          </button>
          {shareUrl && (
            <button
              type="button"
              className="learn-btn learn-btn-ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                } catch {
                  /* ignore */
                }
              }}
            >
              {shareCopied ? "Copied" : "Copy link"}
            </button>
          )}
          <Button
            href="/learn/coach"
            variant="ghost"
            className="!min-h-9 !py-1.5 !text-[0.8125rem]"
          >
            Coach tools
          </Button>
        </div>
        {shareUrl && (
          <p className="mt-2 break-all text-[0.7rem] text-slate">{shareUrl}</p>
        )}
        {state.certificateId && (
          <p className="learn-meta mt-2">
            Certificate ID:{" "}
            <a
              href={`/verify/${state.certificateId}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              {state.certificateId}
            </a>
          </p>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {orientation && (
            <span className="learn-chip">{orientation.result.label}</span>
          )}
          <span className="learn-chip-solid">
            Pre {pre.result.overall}
            {post ? ` · Post ${post.result.overall}` : ""}
            {growth !== null && growth !== 0
              ? ` · ${growth > 0 ? "+" : ""}${growth}`
              : ""}
          </span>
        </div>
        <DownloadReportButton state={state} pre={pre} post={post} />
      </div>

      <div className="mb-4 rounded-2xl border border-black/[0.07] bg-[#f8f9fb] px-4 py-3 sm:px-5">
        <p className="text-[0.8125rem] font-semibold text-ink">
          Share your results
        </p>
        <p className="learn-meta mt-0.5">
          {post
            ? "Download a PDF with overall and construct pre/post scores, growth, and recommendations."
            : "Download a baseline PDF now. After the post-assessment, download again for full pre → post growth."}
        </p>
      </div>

      {orientation && (
        <section className="learn-card mb-4 sm:mb-5">
          <h2 className="learn-card-title">Leadership knowledge frame</h2>
          <p className="learn-body mt-2">{orientation.result.summary}</p>
          <p className="learn-body mt-1.5">{orientation.result.guidance}</p>
          <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["Philosophy (high)", orientation.result.depth.philosophy],
                ["Theory (middle)", orientation.result.depth.theory],
                ["Model (applied)", orientation.result.depth.model],
              ] as const
            ).map(([label, level]) => (
              <div key={label} className="learn-card-muted">
                <p className="learn-eyebrow">{label}</p>
                <p className="learn-label mt-1">{depthLabel(level)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Growth radar */}
        <div className="learn-card">
          <h2 className="learn-card-title">
            {post ? "Growth radar" : "Profile radar"}
          </h2>
          <p className="learn-meta mt-1">
            {post
              ? "Grey dashed = pre · Coloured solid = post · Choices top · Principles bottom"
              : "Choices at top · Principles at bottom · colours = constructs"}
          </p>
          <div className="mt-3">
            <RadarChart
              scores={pre.result.constructScores}
              compareScores={post?.result.constructScores}
              preLabel="Pre"
              postLabel="Post"
            />
          </div>
          {post && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[0.7rem] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span
                  className="inline-block h-0.5 w-5 border-t-2 border-dashed border-neutral-400"
                  aria-hidden
                />
                Pre (baseline)
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink">
                <span
                  className="inline-block h-0.5 w-5 bg-ink"
                  aria-hidden
                />
                Post (after programme)
              </span>
            </div>
          )}
        </div>

        {/* Construct pre / post / growth table */}
        <div className="learn-card">
          <h2 className="learn-card-title">
            {post ? "Scores by construct" : "Baseline construct scores"}
          </h2>
          <p className="learn-meta mt-1">
            {post
              ? "Pre, post, and growth for every Super-Cube® face"
              : "Complete the post-assessment to unlock growth columns"}
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[16rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-black/[0.08] text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">
                  <th className="py-2 pr-2 font-semibold">Construct</th>
                  <th className="py-2 px-1 text-right font-semibold">Pre</th>
                  {post && (
                    <>
                      <th className="py-2 px-1 text-right font-semibold">
                        Post
                      </th>
                      <th className="py-2 pl-1 text-right font-semibold">
                        Growth
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparison?.map((row) => (
                  <tr
                    key={row.constructId}
                    className="border-b border-black/[0.05] last:border-0"
                  >
                    <td className="py-2.5 pr-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: row.color }}
                        />
                        {row.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-right tabular-nums text-slate">
                      {row.pre}
                    </td>
                    {post && (
                      <>
                        <td className="py-2.5 px-1 text-right font-semibold tabular-nums text-ink">
                          {row.post ?? "—"}
                        </td>
                        <td
                          className={`py-2.5 pl-1 text-right font-semibold tabular-nums ${
                            row.delta !== null && row.delta > 0
                              ? "text-ink"
                              : row.delta !== null && row.delta < 0
                                ? "text-slate"
                                : "text-muted"
                          }`}
                        >
                          {row.delta === null
                            ? "—"
                            : `${row.delta > 0 ? "+" : ""}${row.delta}`}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {/* Overall row */}
                <tr className="border-t border-black/[0.1] bg-[#fafafa]">
                  <td className="py-2.5 pr-2 font-semibold text-ink">
                    Overall
                  </td>
                  <td className="py-2.5 px-1 text-right font-semibold tabular-nums text-ink">
                    {pre.result.overall}
                  </td>
                  {post && (
                    <>
                      <td className="py-2.5 px-1 text-right font-semibold tabular-nums text-ink">
                        {post.result.overall}
                      </td>
                      <td className="py-2.5 pl-1 text-right font-semibold tabular-nums text-ink">
                        {growth === null
                          ? "—"
                          : `${growth > 0 ? "+" : ""}${growth}`}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dual progress bars when post exists */}
          {post && comparison && (
            <ul className="mt-4 space-y-2.5 border-t border-black/[0.06] pt-3.5">
              {comparison.map((row) => (
                <li key={`bar-${row.constructId}`}>
                  <div className="mb-1 flex items-center justify-between text-[0.7rem]">
                    <span className="font-semibold text-ink">{row.name}</span>
                    <span className="tabular-nums text-muted">
                      {row.pre}
                      {row.post !== null ? ` → ${row.post}` : ""}
                      {row.delta !== null
                        ? ` (${row.delta > 0 ? "+" : ""}${row.delta})`
                        : ""}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-black/[0.06]">
                    {/* Pre grey track fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-neutral-400/50"
                      style={{ width: `${row.pre}%` }}
                    />
                    {/* Post colour fill */}
                    {row.post !== null && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-full opacity-90"
                        style={{
                          width: `${row.post}%`,
                          background: row.color,
                        }}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="learn-card mt-4 sm:mt-5">
        <h2 className="learn-card-title">Recommendations</h2>
        <ul className="mt-3 space-y-2">
          {recs.map((r) => (
            <li
              key={r}
              className="learn-body"
              dangerouslySetInnerHTML={{
                __html: r.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <DownloadReportButton state={state} pre={pre} post={post} />
          {!post ? (
            <>
              <Button
                href="/learn/assessment/post"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Take post-assessment
              </Button>
              <Button
                href="/learn/courses"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Continue courses
              </Button>
            </>
          ) : (
            <>
              <Button
                href="/learn/courses"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Revisit courses
              </Button>
              <Button
                href="/learn/assessment/post"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Retake post-assessment
              </Button>
            </>
          )}
        </div>
      </section>

      <p className="learn-meta mt-5">
        This report is for developmental use within the Super-Cube® model. Scores
        reflect self-report on this instrument only.
      </p>
    </LearnShell>
  );
}
