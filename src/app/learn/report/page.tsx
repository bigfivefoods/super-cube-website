"use client";

import { formatDateZA } from "@/lib/datetime";
import { useEffect, useMemo, useState } from "react";
import { ConstructDeepDive } from "@/components/learn/ConstructDeepDive";
import { DownloadReportButton } from "@/components/learn/DownloadReportButton";
import { GrowthStoryCard } from "@/components/learn/GrowthStoryCard";
import { LearnShell } from "@/components/learn/LearnShell";
import { LongitudinalPanel } from "@/components/learn/LongitudinalPanel";
import { RadarChart } from "@/components/learn/RadarChart";
import { ReportMeta } from "@/components/learn/ReportMeta";
import { Button } from "@/components/ui";
import { downloadCompletionCertificate } from "@/lib/lms/certificate-pdf";
import {
  changeBand,
  compareAttempts,
  recommendations,
  reliableChangeThreshold,
  type ChangeBand,
} from "@/lib/lms/scoring";
import { issueCertificate, syncFromServer } from "@/lib/lms/cloud";
import { depthLabel } from "@/lib/lms/orientation";
import { ShareLinksPanel } from "@/components/learn/ShareLinksPanel";
import { isMinorProfile } from "@/lib/lms/consent";
import type { ProgrammeId } from "@/lib/programmes";
import {
  loadLmsState,
  setCertificateMeta,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";
import { track } from "@/lib/analytics";

export default function ReportPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [certBusy, setCertBusy] = useState(false);
  const [certNote, setCertNote] = useState<string | null>(null);
  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const pid = s.subscription?.programmeId || s.user?.programmeId || "adults";
    void syncFromServer(pid).then((r) => {
      if (r.kind === "ok") setState(loadLmsState());
    });
  }, []);

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

  const recs = pre ? recommendations(post?.result ?? pre.result) : [];

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
        title="Step 6 of 6 · See your growth report"
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

  // Capture after null guards so nested handlers satisfy LocalLmsState (not null)
  const liveState = state;

  const overallBand = changeBand(growth, "overall");

  async function downloadCertificate() {
    if (!post || !programmeId || certBusy) return;
    setCertBusy(true);
    setCertNote(null);
    try {
      const r = await issueCertificate(
        programmeId,
        liveState.profile?.displayName || liveState.user?.fullName || undefined,
        liveState.orgCode,
      );
      if (r.kind === "ok") {
        const c = r.data.certificate;
        setState(setCertificateMeta(c.id, c.issued_at));
        downloadCompletionCertificate({
          id: c.id,
          learnerName: c.learner_name,
          programmeId: c.programme_id,
          preOverall: Number(c.pre_overall),
          postOverall: Number(c.post_overall),
          growth: Number(c.growth),
          issuedAt: c.issued_at,
        });
        track("certificate_download", { certificateId: c.id });
        return;
      }
      if (r.kind === "signed_out" || r.kind === "unavailable") {
        setCertNote(
          "Sign in to get a verifiable certificate. Certificates are issued by the server from your recorded baseline and after-test.",
        );
        return;
      }
      const code = String(r.body.error || "");
      setCertNote(
        code === "payment_required"
          ? "Certificates are part of the full pathway (one-off payment or a cohort seat)."
          : code === "not_eligible"
            ? "The server has no recorded baseline and after-test for you yet. Take both while signed in."
            : `Could not issue the certificate (${code || r.status}).`,
      );
    } finally {
      setCertBusy(false);
    }
  }

  return (
    <LearnShell
      title="Step 6 of 6 · See your growth report"
      subtitle={`${programme?.name ?? "Super-Cube®"} · Developmental profile (not a clinical diagnosis)${
        post
          ? "—pre to post growth after your programme."
          : "—baseline view. The after-test opens after the practice period and enough completed sessions."
      }`}
    >
      <div className="report-print-root">
        <ReportMeta state={state} />

        <GrowthStoryCard state={state} />

        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          <DownloadReportButton state={state} pre={pre} post={post} />
          <a href="#share-growth" className="learn-btn learn-btn-primary">
            Share growth link
          </a>
          <Button
            href="/learn/feedback"
            variant="ghost"
            className="!min-h-9 !py-1.5 !text-[0.8125rem]"
          >
            Narrative + lit cube
          </Button>
          <Button
            href="/learn/practice"
            variant="ghost"
            className="!min-h-9 !py-1.5 !text-[0.8125rem]"
          >
            Micro-practice
          </Button>
          <Button
            href="/learn/account"
            variant="ghost"
            className="!min-h-9 !py-1.5 !text-[0.8125rem]"
          >
            You / profile
          </Button>
          <button
            type="button"
            className="learn-btn learn-btn-ghost"
            onClick={() => window.print()}
          >
            Print / PDF view
          </button>
        </div>

        {!post && (
          <div className="mb-4 rounded-2xl border border-ink bg-elevated p-4 sm:flex sm:items-center sm:justify-between sm:p-5 print:hidden">
            <div>
              <p className="learn-eyebrow">Step 5 of 6 · After practice</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                The after-test measures change against your locked baseline
              </p>
              <p className="learn-meta mt-0.5">
                It opens after the minimum practice period and enough completed
                sessions, so any change has had time to happen.
              </p>
            </div>
            <Button
              href="/learn/assessment/post"
              variant="primary"
              className="mt-3 !min-h-10 shrink-0 !text-[0.8125rem] sm:mt-0"
            >
              Check after-test status →
            </Button>
          </div>
        )}

        <section className="mb-4 grid gap-2 sm:mb-5 sm:grid-cols-3 print:break-inside-avoid">
          <div className="learn-card !p-4">
            <p className="learn-eyebrow">Pre · baseline</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {pre.result.overall}
            </p>
            <p className="learn-meta mt-0.5">
              {formatDateZA(pre.completedAt)}
            </p>
          </div>
          <div className="learn-card !p-4">
            <p className="learn-eyebrow">Post · after programme</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {post ? post.result.overall : "—"}
            </p>
            <p className="learn-meta mt-0.5">
              {post
                ? formatDateZA(post.completedAt)
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
              {growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}`}
              {growth !== null && (
                <span className="ml-1 text-sm font-medium text-muted">pts</span>
              )}
            </p>
            <p className="learn-meta mt-0.5">
              {post ? "Pre → post change" : "After-test not taken yet"}
            </p>
            {overallBand && <BandBadge band={overallBand} />}
          </div>
        </section>

        {post && (
          <div className="mb-4 rounded-2xl border border-ink bg-elevated p-4 sm:flex sm:items-center sm:justify-between sm:p-5 print:hidden">
            <div>
              <p className="learn-eyebrow">Pathway complete</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Certificate of completion
              </p>
              <p className="learn-meta mt-0.5">
                Issued by the server from your recorded baseline and after-test,
                with an ID anyone can verify.
              </p>
              {certNote && (
                <p className="mt-1.5 text-[0.8125rem] font-medium text-amber-900" role="status">
                  {certNote}
                </p>
              )}
            </div>
            <button
              type="button"
              className="learn-btn learn-btn-primary mt-3 sm:mt-0"
              disabled={certBusy}
              onClick={() => void downloadCertificate()}
            >
              Download certificate (PDF)
            </button>
          </div>
        )}

        {orientation && (
          <section className="learn-card mb-4 sm:mb-5 print:break-inside-avoid">
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

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 print:break-inside-avoid">
          <div className="learn-card">
            <h2 className="learn-card-title">
              {post ? "Growth radar" : "Profile radar"}
            </h2>
            <p className="learn-meta mt-1">
              {post
                ? "Grey dashed = pre · Coloured solid = post"
                : "Colours = constructs"}
            </p>
            <div className="mt-3">
              <RadarChart
                scores={pre.result.constructScores}
                compareScores={post?.result.constructScores}
                preLabel="Pre"
                postLabel="Post"
              />
            </div>
          </div>

          <div className="learn-card">
            <h2 className="learn-card-title">
              {post ? "Scores by construct" : "Baseline construct scores"}
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[16rem] text-left text-[0.8125rem]">
                <thead>
                  <tr className="border-b border-line text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">
                    <th className="py-2 pr-2 font-semibold">Construct</th>
                    <th className="py-2 px-1 text-right font-semibold">Pre</th>
                    {post && (
                      <>
                        <th className="py-2 px-1 text-right font-semibold">
                          Post
                        </th>
                        <th className="py-2 pl-1 text-right font-semibold">
                          Change
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparison?.map((row) => (
                    <tr
                      key={row.constructId}
                      className="border-b border-line last:border-0"
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
                          <td className="py-2.5 pl-1 text-right font-semibold tabular-nums text-ink">
                            {row.delta === null
                              ? "—"
                              : `${row.delta > 0 ? "+" : ""}${row.delta}`}
                            <BandBadge band={changeBand(row.delta, "face")} compact />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="border-t border-line-strong bg-surface">
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
                          <BandBadge band={overallBand} compact />
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            {post && (
              <p className="learn-meta mt-3" data-testid="change-bands-note">
                How to read change: self-report scores move a little between any
                two sittings. A face needs about ±{reliableChangeThreshold("face")} points
                (overall ±{reliableChangeThreshold("overall")}) before we call it real
                change at 95% confidence. Smaller moves are shown as possible
                change or normal noise. These thresholds are provisional until the
                instrument&apos;s reliability is measured on Super-Cube® data.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <LongitudinalPanel state={state} />
        </div>

        <ConstructDeepDive state={state} pre={pre} post={post} />

        <section className="learn-card mt-4 sm:mt-5 print:break-inside-avoid">
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
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center print:hidden">
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
              <Button
                href="/learn/courses"
                variant="ghost"
                className="!min-h-9 !py-1.5 !text-[0.8125rem]"
              >
                Revisit courses
              </Button>
            )}
          </div>
        </section>

        <div id="share-growth" className="mt-4 scroll-mt-24 sm:mt-5 print:hidden">
          <ShareLinksPanel
            key={isMinorProfile(state.profile) ? "minor" : "adult"}
            programmeId={(programmeId || "adults") as ProgrammeId}
            minor={isMinorProfile(state.profile)}
            hasBaseline={Boolean(pre)}
          />
        </div>

        <p className="learn-meta mt-5">
          This report is for developmental use within the Super-Cube® model.
          Scores reflect self-report on this instrument only.
        </p>
      </div>
    </LearnShell>
  );
}

function BandBadge({ band, compact = false }: { band: ChangeBand | null; compact?: boolean }) {
  if (!band) return null;
  const tone =
    band.tone === "good"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : band.tone === "bad"
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-line bg-surface text-slate";
  return (
    <span
      className={`${compact ? "ml-1.5" : "mt-1.5"} inline-block rounded-full border px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${tone}`}
      title={`${band.label} · reliable change index ${band.rci} · real change needs ±${band.threshold} pts`}
      data-band={band.id}
    >
      {compact ? band.short : band.label}
    </span>
  );
}
