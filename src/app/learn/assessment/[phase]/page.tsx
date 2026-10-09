"use client";

import Link from "next/link";
import { AddToCalendar } from "@/components/learn/AddToCalendar";
import { formatDateTimeZA, formatDateZA } from "@/lib/datetime";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { LikertQuestion, SjtQuestion } from "@/components/learn/AssessmentItems";
import {
  buildInstrumentItems,
  honestyItem,
  isInstrumentV2EnabledClient,
  scaleLabelsFor,
  versionOfResponses,
  type InstrumentVersion,
} from "@/lib/lms/instruments";
import { SJT_INSTRUCTIONS } from "@/lib/lms/instruments/v2-bank";
import { scoreAttempt } from "@/lib/lms/scoring";
import {
  clearAssessmentDraft,
  loadLmsState,
  markFirstRunStep,
  saveAssessmentDraft,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { constructs } from "@/lib/content";
import { faceTagline } from "@/lib/lms/face-taglines";
import { track } from "@/lib/analytics";
import { pushCoachProgressIfConsented } from "@/lib/lms/push-coach-progress";
import { submitAttempt, syncFromServer, toLocalAttempt } from "@/lib/lms/cloud";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { evaluatePostGate, type PostGate } from "@/lib/lms/gates";
import { attentionItem, isStraightLining, itemsForFace, newSeed } from "@/lib/lms/integrity";
import { programmeCopy } from "@/lib/lms/programme-copy";

export default function AssessmentRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const raw = String(params.phase || "pre");
  const phase = (raw === "post" ? "post" : raw === "mid" ? "mid" : "pre") as
    "pre" | "post" | "mid";

  const [state, setState] = useState<LocalLmsState | null>(null);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [serverGate, setServerGate] = useState<PostGate | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [confirmSame, setConfirmSame] = useState(false);
  const [fromOrientation, setFromOrientation] = useState(false);

  useEffect(() => {
    const s = loadLmsState();
    setState(s);
    const pid = (s.subscription?.programmeId || s.user?.programmeId || "adults") as ProgrammeId;
    void syncFromServer(pid).then((r) => {
      if (r.kind === "ok") {
        setSignedIn(true);
        setServerGate(r.data.postGate);
        setState(loadLmsState());
      } else {
        setSignedIn(false);
      }
    });
    setFromOrientation(new URLSearchParams(window.location.search).get("from") === "orientation");
    if (s.assessmentDraft?.phase === phase) {
      setResponses(s.assessmentDraft.responses ?? {});
      setStep(s.assessmentDraft.step ?? 0);
      setSeed(s.assessmentDraft.seed ?? newSeed());
      setStartedAt(s.assessmentDraft.startedAt ?? new Date().toISOString());
      setSavedNote("Resumed your saved answers.");
    } else {
      setSeed(newSeed());
      setStartedAt(new Date().toISOString());
    }
  }, [phase]);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  // Instrument version: the baseline's version for re-measures; otherwise v1
  // (standard form) unless v2 is switched on for this deployment.
  const preForVersion = state?.attempts.find((a) => a.phase === "pre" && a.programmeId === programmeId);
  const draftVersion =
    state?.assessmentDraft?.phase === phase ? versionOfResponses(state.assessmentDraft.responses) : null;
  const version: InstrumentVersion = preForVersion
    ? versionOfResponses(preForVersion.responses)
    : draftVersion === "v2" || (phase === "pre" && isInstrumentV2EnabledClient())
      ? "v2"
      : "v1";
  const items = useMemo(() => buildInstrumentItems(programmeId, version), [programmeId, version]);
  const honesty = version === "v2" ? honestyItem(programmeId) : null;

  const constructIds = constructs.map((c) => c.id);
  const currentConstruct = constructIds[step];
  const attention = useMemo(() => attentionItem(programmeId, version), [programmeId, version]);
  // Item order is randomised within each face (stable for this attempt via its seed)
  const stepItems = useMemo(
    () => (seed == null ? [] : itemsForFace(items, constructIds, currentConstruct, seed, attention)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, currentConstruct, seed, attention],
  );
  const totalItems = items.length + 1 + (honesty ? 1 : 0); // + the attention (and v2 honesty) check
  const constructMeta = constructs.find((c) => c.id === currentConstruct);
  const answered = Object.keys(responses).filter(
    (k) => responses[k] >= 1 && responses[k] <= 5,
  ).length;
  const pct = totalItems ? Math.round((answered / totalItems) * 100) : 0;

  function setValue(itemId: string, value: number) {
    setResponses((r) => ({ ...r, [itemId]: value }));
  }

  function canContinue() {
    return stepItems.length > 0 && stepItems.every((i) => responses[i.id] >= 1 && responses[i.id] <= 5);
  }

  function draftExtras() {
    return { seed: seed ?? undefined, startedAt: startedAt ?? undefined };
  }

  function saveDraft() {
    saveAssessmentDraft({
      phase,
      programmeId,
      responses,
      step,
      updatedAt: new Date().toISOString(),
      ...draftExtras(),
    });
    setSavedNote("Progress saved on this device. You can leave and return.");
    track("assessment_draft_save", { phase, step, answered });
  }

  const existingPre = state?.attempts.find(
    (a) => a.phase === "pre" && a.programmeId === programmeId,
  );
  const existingPost = state?.attempts.find(
    (a) => a.phase === "post" && a.programmeId === programmeId,
  );
  const localGate = state
    ? evaluatePostGate({
        programmeId,
        preCompletedAt: existingPre?.completedAt ?? null,
        completedLessonIds: Object.entries(state.lessonProgress)
          .filter(([, v]) => v === "completed")
          .map(([k]) => k),
      })
    : null;
  // Signed in: the server's own records decide. Otherwise the same rules run locally.
  const gate = signedIn && serverGate ? serverGate : localGate;
  const paid = state ? hasFullPathwayAccess(state) : false;

  function finish(next: LocalLmsState, overall: number) {
    clearAssessmentDraft();
    void pushCoachProgressIfConsented(next);
    if (phase === "pre") {
      markFirstRunStep("pre");
      track("pre_complete", { overall });
      setState(loadLmsState());
      router.push("/learn/feedback");
    } else if (phase === "mid") {
      track("mid_complete", { overall });
      setState(loadLmsState());
      router.push("/learn/feedback?mode=mid");
    } else {
      track("post_complete", { overall });
      setState(next);
      router.push("/learn/report");
    }
  }

  async function submit(confirmed = false) {
    if (busy) return;
    setSubmitError(null);
    if (phase === "pre" && existingPre) return;
    if (phase === "post" && (existingPost || !gate?.ok || !paid)) return;
    // Same answer to (almost) everything: fine if true, but offer a second look first
    if (!confirmed && isStraightLining(items.filter((i) => i.itemType !== "sjt").map((i) => responses[i.id]))) {
      setConfirmSame(true);
      return;
    }
    setConfirmSame(false);
    const durationMs = startedAt ? Date.now() - Date.parse(startedAt) : undefined;
    const meta = {
      seed: seed ?? undefined,
      durationMs,
      instrument: version,
      ...(honesty ? { honesty: responses[honesty.id] } : {}),
    };
    setBusy(true);
    try {
      const server = await submitAttempt(phase, programmeId, responses, meta);
      if (server.kind === "ok") {
        const next = loadLmsState();
        const local = toLocalAttempt(server.data.attempt);
        next.attempts = [
          ...next.attempts.filter(
            (a) => phase === "mid" || !(a.phase === phase && a.programmeId === programmeId),
          ),
          local,
        ];
        saveLmsState(next);
        finish(next, local.result.overall);
        return;
      }
      if (server.kind === "error") {
        const code = String(server.body.error || "");
        setSubmitError(
          code === "baseline_locked"
            ? "Your baseline is already recorded and locked."
            : code === "post_gate"
              ? "The after-test is not open yet. See the checklist above."
              : code === "payment_required"
                ? "The after-test needs the full pathway (payment or cohort seat)."
                : code === "post_locked"
                  ? "Your after-test is already recorded."
                  : code === "consent_required"
                    ? "A parent or guardian needs to record consent on their own account before this can be saved."
                    : `Could not save: ${code || server.status}`,
        );
        if (server.status === 403 && server.body.gate) setServerGate(server.body.gate as PostGate);
        return;
      }
      // Signed out or cloud unavailable: keep on this device with the same rules.
      const result = scoreAttempt(items, responses);
      const next = loadLmsState();
      next.attempts = [
        ...next.attempts.filter(
          (a) => phase === "mid" || !(a.phase === phase && a.programmeId === programmeId),
        ),
        { phase, programmeId, responses, result, completedAt: new Date().toISOString(), seed: meta.seed, durationMs },
      ];
      saveLmsState(next);
      finish(next, result.overall);
    } finally {
      setBusy(false);
    }
  }

  if (!state) {
    return (
      <LearnShell title="Assessment">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  if (phase === "pre" && existingPre) {
    return (
      <LearnShell title="Your baseline is locked" subtitle={`${programme?.name ?? "Programme"} · recorded ${formatDateZA(existingPre.completedAt)}`}>
        <div className="learn-card" data-testid="baseline-locked">
          <p className="learn-body">
            Your baseline was recorded on{" "}
            <strong>{formatDateTimeZA(existingPre.completedAt)}</strong> (overall{" "}
            {Math.round(existingPre.result.overall)}). It stays fixed so your growth can be
            measured honestly against it. Retaking it is not possible.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/learn/feedback" className="learn-btn learn-btn-primary">See your baseline narrative</Link>
            <Link href="/learn/courses" className="learn-btn learn-btn-ghost">Continue sessions</Link>
          </div>
        </div>
      </LearnShell>
    );
  }

  if (phase === "post" && existingPost) {
    return (
      <LearnShell title="After-test recorded" subtitle={programme?.name ?? "Programme"}>
        <div className="learn-card" data-testid="post-locked">
          <p className="learn-body">
            Your after-test was recorded on {formatDateTimeZA(existingPost.completedAt)}.
            Each programme has one after-test, so your report stays comparable.
          </p>
          <Link href="/learn/report" className="learn-btn learn-btn-primary mt-3">View your report</Link>
        </div>
      </LearnShell>
    );
  }

  if (phase === "post" && (!paid || !gate?.ok)) {
    return (
      <LearnShell title="After-test not open yet" subtitle={`${programme?.name ?? "Programme"} · growth needs time and practice`}>
        <div className="learn-card" data-testid="post-gate">
          <p className="learn-body">
            The after-test compares you with your baseline. To make that comparison mean
            something, it opens only after real practice time.
          </p>
          <ul className="mt-3 space-y-1.5 text-[0.8125rem] text-ink">
            {!paid && <li>· Unlock the full pathway (one-off payment or a cohort seat).</li>}
            {(gate?.reasons ?? []).map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          {gate?.unlocksOn && gate.daysRemaining > 0 && (
            <p className="learn-meta mt-3">
              Earliest date: {formatDateZA(gate.unlocksOn)}.
              Sessions done: {gate.sessionsDone} of {gate.sessionsRequired} needed.
            </p>
          )}
          {signedIn === false && (
            <p className="learn-meta mt-2">Sign in so the server can verify your progress for a certificate.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/learn/courses" className="learn-btn learn-btn-primary">Continue sessions</Link>
            {existingPre && gate?.daysRemaining ? (
              <AddToCalendar preCompletedAt={existingPre.completedAt} programmeName={programme?.name ?? "Super-Cube®"} />
            ) : null}
            {!paid && <Link href="/pricing" className="learn-btn learn-btn-ghost">View pricing</Link>}
          </div>
        </div>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title={
        phase === "pre"
          ? "Step 3 of 6 · Measure your baseline"
          : phase === "mid"
            ? "Mid-pathway check-in"
            : "Step 5 of 6 · Re-measure after the programme"
      }
      subtitle={
        phase === "pre"
          ? programmeCopy("assessment.pre.subtitle", programmeId, {
                programme: programme?.name ?? "Programme",
                n: items.length,
                checks: honesty ? "two quick checks" : "one quick check",
              })
          : phase === "mid"
            ? programmeCopy("assessment.mid.subtitle", programmeId, { programme: programme?.name ?? "Programme" })
            : programmeCopy("assessment.post.subtitle", programmeId, { programme: programme?.name ?? "Programme" })
      }
    >
      {fromOrientation && phase === "pre" && state?.orientation && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:px-4" role="status">
          <p className="text-[0.8125rem] font-semibold text-emerald-900">
            Step 2 done · {state.orientation.result.label}
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-emerald-900/85">
            Now your baseline: one honest snapshot across the six faces. Your answers save as you go, so you can
            stop and come back.
          </p>
        </div>
      )}

      {/* Progress + credibility */}
      <div className="mb-4 rounded-xl border border-line bg-elevated p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.75rem] font-semibold text-ink">
            Progress · {answered}/{totalItems} answered ({pct}%)
          </p>
          <button
            type="button"
            onClick={saveDraft}
            className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Save & resume later
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
          Instrument note: a short developmental self-report with a few items
          per face. Its reliability for this version has not yet been
          established, so small changes between baseline and after-test can be
          noise. Your baseline is recorded once and cannot be retaken. Journals
          stay separate and private.
        </p>
        {savedNote && (
          <p className="mt-1.5 text-[0.75rem] font-medium text-emerald-800">
            {savedNote}
          </p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {constructs.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition ${
              i === step
                ? "bg-void text-void-fg"
                : "border border-line bg-elevated text-slate hover:text-ink"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="learn-card !p-4 sm:!p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: constructMeta?.color }}
          />
          <div>
            <h2 className="learn-card-title">{constructMeta?.name}</h2>
            <p className="learn-meta mt-0.5">{constructMeta ? faceTagline(constructMeta.id, programmeId) : null}</p>
          </div>
        </div>

        <div className="space-y-6">
          {stepItems.map((item) =>
            item.itemType === "sjt" && item.options ? (
              <SjtQuestion
                key={item.id}
                id={item.id}
                scenario={item.prompt}
                options={item.options}
                value={responses[item.id]}
                onChange={(v) => setValue(item.id, v)}
                instruction={SJT_INSTRUCTIONS[programmeId]}
                color={constructMeta?.color}
              />
            ) : (
              <LikertQuestion
                key={item.id}
                id={item.id}
                prompt={item.prompt}
                value={responses[item.id]}
                onChange={(v) => setValue(item.id, v)}
                labels={scaleLabelsFor(item)}
              />
            ),
          )}
          {honesty && step === constructs.length - 1 && (
            <LikertQuestion
              id={honesty.id}
              prompt={honesty.prompt}
              value={responses[honesty.id]}
              onChange={(v) => setValue(honesty.id, v)}
              labels={honesty.labels}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="learn-btn learn-btn-ghost disabled:opacity-40"
          >
            Back
          </button>
          {step < constructs.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => {
                saveAssessmentDraft({
                  phase,
                  programmeId,
                  responses,
                  step: step + 1,
                  updatedAt: new Date().toISOString(),
                  ...draftExtras(),
                });
                setStep((s) => s + 1);
              }}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              Next construct
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || !canContinue() || answered < totalItems}
              onClick={() => void submit()}
              className="learn-btn learn-btn-primary disabled:opacity-40"
            >
              {busy
                ? "Saving…"
                : phase === "pre"
                ? "Submit & see your narrative"
                : phase === "mid"
                  ? "Submit mid check-in"
                  : "Submit & view report"}
            </button>
          )}
        </div>
        {confirmSame && (
          <div className="mt-4 rounded-xl border border-line-strong bg-surface p-4" role="alertdialog" aria-labelledby="same-h" aria-describedby="same-d">
            <p id="same-h" className="text-[0.875rem] font-semibold text-ink">You gave nearly every statement the same answer</p>
            <p id="same-d" className="mt-1 text-[0.8125rem] text-slate">
              That’s fine if it’s how you see yourself. If you were moving quickly, take another look: an honest
              baseline makes your growth report meaningful.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="learn-btn learn-btn-ghost" onClick={() => { setConfirmSame(false); setStep(0); }}>
                Review my answers
              </button>
              <button type="button" className="learn-btn learn-btn-primary" onClick={() => void submit(true)}>
                Submit as it is
              </button>
            </div>
          </div>
        )}
        {submitError && (
          <p className="mt-3 text-[0.8125rem] font-medium text-red-700" role="alert">
            {submitError}
          </p>
        )}
        <p className="learn-meta mt-3">
          Step {step + 1} of {constructs.length} · Answer all items on this face
          to continue.
        </p>
      </div>
    </LearnShell>
  );
}
