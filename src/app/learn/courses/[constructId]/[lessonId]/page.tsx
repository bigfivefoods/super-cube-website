"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { useLmsState } from "@/components/learn/useLearnState";
import { LessonContent } from "@/components/learn/LessonContent";
import { SessionReflection } from "@/components/learn/SessionReflection";
import { SessionArc } from "@/components/learn/session/SessionArc";
import { PracticeLabView } from "@/components/learn/session/PracticeLabView";
import { FaceCheckView } from "@/components/learn/session/FaceCheckView";
import { MasteryPanel, type MasteryPrompt } from "@/components/learn/session/MasteryPanel";
import { LockedSessionCard } from "@/components/learn/LockedSessionCard";
import { getCheckAnswers, getCheckRound, resetCheck } from "@/components/learn/session/check-store";
import { gradeAnswers, masteryVerdict, mayComplete, recordAttempt } from "@/lib/lms/mastery";
import { constructs, type ConstructId } from "@/lib/content";
import { getLesson } from "@/lib/lms/curriculum";
import { recordCompletion, recordLessonOpen } from "@/lib/lms/cloud";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { isSampleLesson } from "@/lib/lms/gates";
import { track } from "@/lib/analytics";
import { sessionWinLine } from "@/lib/lms/wins";
import {
  loadLmsState,
  markLessonCompleted,
  markLessonInProgress,
  recordSessionWin,
  saveMasteryRecord,
} from "@/lib/lms/store";
import { courseId, type ProgrammeId } from "@/lib/programmes";

const TYPE_LABEL: Record<string, string> = {
  content: "Session",
  practice: "Practice lab",
  quiz: "Face check",
};

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const constructId = params.constructId as ConstructId;
  const lessonId = params.lessonId as string;
  const state = useLmsState();
  const [winBanner, setWinBanner] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [masteryPrompt, setMasteryPrompt] = useState<MasteryPrompt | null>(null);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;

  // The learner's programme first; otherwise the programme named in the lesson id
  const data = useMemo(() => {
    const own = getLesson(courseId(programmeId, constructId), lessonId);
    if (own) return own;
    const prefix = lessonId.split("-")[0] as ProgrammeId;
    return (["kids", "adolescents", "adults"] as ProgrammeId[]).includes(prefix)
      ? getLesson(courseId(prefix, constructId), lessonId)
      : undefined;
  }, [programmeId, constructId, lessonId]);

  const construct = constructs.find((c) => c.id === constructId);

  // Track resume + in-progress when opening a session
  const locked = Boolean(
    data && !isSampleLesson(data.lesson.id) && !hasFullPathwayAccess(state),
  );
  const lessonStatus = data ? state.lessonProgress[data.lesson.id] : undefined;
  const openedId = useRef<string | null>(null);

  useEffect(() => {
    if (!data || !construct || locked) return;
    if (openedId.current !== data.lesson.id) {
      openedId.current = data.lesson.id;
      void recordLessonOpen(programmeId, constructId, data.lesson.id);
    }
    if (lessonStatus === "completed" || lessonStatus === "in_progress") return;
    markLessonInProgress(data.lesson.id, constructId);
  }, [lessonId, constructId, data, construct, locked, programmeId, lessonStatus]);

  function markComplete() {
    if (!data || locked) return;
    if (state?.lessonProgress[data.lesson.id] === "completed") {
      continueAfterWin();
      return;
    }
    const id = data.lesson.id;
    // Mastery: about two-thirds of the check right first time (half for Kids),
    // or one more go after reading the explanations. The server enforces the same rule.
    const questions = data.lesson.arc?.check ?? data.lesson.faceCheck ?? [];
    const answers = getCheckAnswers(id);
    const retried = getCheckRound(id) > 0;
    let checkPayload: { answers: (number | null)[]; retry: boolean } | undefined;
    if (questions.length > 0) {
      const missing = questions.filter((_, i) => answers[i] == null).length;
      if (missing > 0) {
        setMasteryPrompt({ kind: "answer-first", missing });
        return;
      }
      const verdict = masteryVerdict(gradeAnswers(questions, answers), questions.length, data.course.programmeId);
      const prior = loadLmsState().mastery?.[id];
      const allowed = mayComplete(verdict, prior?.attempts ?? 0, retried);
      saveMasteryRecord(id, recordAttempt(prior, verdict, { retried, completed: allowed }));
      track("mastery_check", { lessonId: id, passed: String(verdict.passed), retry: String(retried), correct: String(verdict.correct), total: String(verdict.total) });
      if (!allowed) {
        setMasteryPrompt({ kind: "retry", verdict, missed: questions.filter((q, i) => answers[i] !== q.answer) });
        return;
      }
      checkPayload = { answers, retry: retried };
    }
    setMasteryPrompt(null);
    markLessonCompleted(id, constructId);
    const win = sessionWinLine(constructId, programmeId, data.lesson.title);
    recordSessionWin(id, constructId, win);
    setWinBanner(win);
    // Server record (signed-in learners): this is what the after-test gate counts.
    const report = (r: Awaited<ReturnType<typeof recordCompletion>>) => {
      if (r.kind === "error" && r.status === 402) {
        setSyncNote("Saved on this device only: the server needs a verified purchase or cohort seat for this session.");
      } else if (r.kind === "error" && r.status === 403) {
        setSyncNote("Saved on this device. A parent or guardian needs to record consent on their own account before this session counts.");
      } else if (r.kind === "signed_out") {
        setSyncNote("Saved on this device. Sign in so your progress counts towards a verifiable after-test and certificate.");
      } else if (r.kind === "ok" && r.data.countsForGate === false) {
        setSyncNote("Saved on this device. It counts towards your after-test once the session has been open for a short while. Mark it complete again in a moment.");
      }
    };
    void recordCompletion(programmeId, constructId, id, checkPayload).then((r) => {
      // The first try happened before sign-in, so the server has no record of it:
      // it has now stored this attempt, and the retry it asks for is the one just made.
      if (r.kind === "error" && r.status === 422 && checkPayload && retried) {
        return recordCompletion(programmeId, constructId, id, { ...checkPayload, retry: true }).then(report);
      }
      report(r);
    });
    track("lesson_complete", {
      constructId,
      lessonId: id,
      programmeId,
    });
  }

  function retryCheck() {
    if (!data) return;
    resetCheck(data.lesson.id);
    setMasteryPrompt(null);
    track("mastery_retry", { lessonId: data.lesson.id });
    requestAnimationFrame(() => {
      document.getElementById(data.lesson.arc ? "step-check" : "face-check")?.scrollIntoView({ block: "start" });
    });
  }

  function continueAfterWin() {
    if (!data) return;
    setWinBanner(null);
    const i = data.course.lessons.findIndex((l) => l.id === data.lesson.id);
    const nextLesson = data.course.lessons[i + 1];
    if (nextLesson) {
      router.push(`/learn/courses/${constructId}/${nextLesson.id}`);
    } else {
      router.push(`/learn/courses/${constructId}`);
    }
  }

  if (!data || !construct) {
    return (
      <LearnShell title="Session not found">
        <p className="learn-body">This session isn’t part of your programme.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={construct ? `/learn/courses/${constructId}` : "/learn/courses"} className="learn-btn learn-btn-primary">
            Back to module
          </Link>
          <Link href="/learn/courses" className="learn-btn learn-btn-ghost">All courses</Link>
        </div>
      </LearnShell>
    );
  }

  if (locked) {
    return (
      <LearnShell title={data.lesson.title} subtitle={`Part of the full pathway · ~${data.lesson.durationMinutes} min`}>
        <LockedSessionCard
          lesson={data.lesson}
          programmeId={data.course.programmeId}
          constructId={constructId}
          color={construct.color}
          colorSoft={construct.colorSoft}
        />
      </LearnShell>
    );
  }

  const done = lessonStatus === "completed";
  const faceIndex = Math.max(0, constructs.findIndex((c) => c.id === constructId));
  const idx = data.course.lessons.findIndex((l) => l.id === data.lesson.id);
  const prev = data.course.lessons[idx - 1];
  const next = data.course.lessons[idx + 1];
  const color = construct.color;
  const colorSoft = construct.colorSoft;

  return (
    <LearnShell
      title={data.lesson.title}
      subtitle={`${TYPE_LABEL[data.lesson.lessonType] ?? "Session"} ${idx + 1} of ${data.course.lessons.length} · ~${data.lesson.durationMinutes} min`}
    >
      <div
        className="mb-4 overflow-hidden rounded-2xl border border-line"
        style={{ background: colorSoft }}
      >
        <div className="px-3.5 py-3.5 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-white"
              style={{ background: color }}
            >
              {construct.name}
            </span>
            <span className="learn-meta font-medium">
              Face {faceIndex + 1} of {constructs.length}
            </span>
          </div>
          <ol className="mt-2.5 flex flex-wrap gap-1" aria-label="The six faces">
            {constructs.map((c, i) => {
              const here = c.id === constructId;
              return (
                <li key={c.id}>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                      here ? "text-white" : "bg-white/70 text-ink"
                    }`}
                    style={here ? { background: c.color } : undefined}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: here ? "#fff" : c.color }} aria-hidden />
                    {i + 1} {c.shortName}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-ink">
            {data.lesson.outcome}
          </p>
          <div className="mt-2.5 flex gap-1" aria-hidden="true">
            {data.course.lessons.map((l, i) => (
              <span
                key={l.id}
                className="h-1 flex-1 rounded-full transition"
                style={{
                  background:
                    i === idx
                      ? color
                      : state.lessonProgress[l.id] === "completed"
                        ? `${color}99`
                        : "rgba(0,0,0,0.08)",
                }}
              />
            ))}
          </div>
          <p className={`learn-meta mt-2${data.lesson.arc ? " hidden sm:block" : ""}`}>
            {data.lesson.arc
              ? "8 steps: hook, core idea, example, reflect, micro-practice, if–then plan, check and journal. The 15-second face intro plays on the module page."
              : data.lesson.lab
                ? "Challenge → WOOP plan → checklist → reflect"
                : data.lesson.faceCheck
                  ? "Recall every skill → teach it back → lock one habit"
                  : "Read → Engage → Apply"}
          </p>
          {data.lesson.arc && (
            <Link
              href={`/learn/courses/${constructId}`}
              className="mt-2 inline-block text-[0.8125rem] font-semibold underline-offset-2 hover:underline"
              style={{ color }}
            >
              Play the {construct.name} intro
            </Link>
          )}
        </div>
      </div>

      {data.lesson.arc ? (
        <SessionArc
          arc={data.lesson.arc}
          lessonId={data.lesson.id}
          color={color}
          colorSoft={colorSoft}
          programmeId={data.course.programmeId}
          constructId={constructId}
        />
      ) : data.lesson.lab ? (
        <PracticeLabView
          lab={data.lesson.lab}
          lessonId={data.lesson.id}
          color={color}
          colorSoft={colorSoft}
          programmeId={data.course.programmeId}
          constructId={constructId}
        />
      ) : data.lesson.faceCheck ? (
        <FaceCheckView
          questions={data.lesson.faceCheck}
          lessonId={data.lesson.id}
          color={color}
          programmeId={data.course.programmeId}
          constructId={constructId}
          faceName={construct.name}
        />
      ) : (
        <>
          <LessonContent sections={data.lesson.sections} color={color} colorSoft={colorSoft} />
          <SessionReflection lessonId={data.lesson.id} constructId={constructId} color={color} />
        </>
      )}

      {syncNote && (
        <p className="learn-meta mt-4 rounded-xl border border-line bg-elevated px-3 py-2" role="status">
          {syncNote}
        </p>
      )}

      {masteryPrompt && !winBanner && (
        <MasteryPanel
          prompt={masteryPrompt}
          programmeId={data.course.programmeId}
          color={color}
          checkAnchor={data.lesson.arc ? "step-check" : "face-check"}
          onRetry={retryCheck}
        />
      )}

      {winBanner && (
        <div
          className="mt-5 rounded-2xl border border-line bg-elevated p-4 sm:p-5"
          style={{ boxShadow: `inset 3px 0 0 ${color}` }}
          role="status"
        >
          <p className="learn-eyebrow" style={{ color }}>
            Win of the day
          </p>
          <p className="mt-1 text-[0.9375rem] font-semibold leading-snug text-ink">
            {winBanner}
          </p>
          <button
            type="button"
            onClick={continueAfterWin}
            className="learn-btn learn-btn-primary mt-3 text-white"
            style={{ background: color }}
          >
            {next ? "Continue to next session →" : "Back to module →"}
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-[0.8125rem] font-semibold">
          <Link
            href={`/learn/courses/${constructId}`}
            className="text-ink underline-offset-2 hover:underline"
          >
            ← Module outline
          </Link>
          {prev && (
            <Link
              href={`/learn/courses/${constructId}/${prev.id}`}
              className="text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Previous
            </Link>
          )}
          {next && (
            <Link
              href={`/learn/courses/${constructId}/${next.id}`}
              className="text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Skip ahead
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={markComplete}
          className="learn-btn text-white shadow-sm transition hover:opacity-95"
          style={{ background: color }}
        >
          {done
            ? next
              ? "Completed · next session"
              : "Completed · back to module"
            : next
              ? "Mark complete & continue"
              : "Mark complete · finish module"}
        </button>
      </div>
    </LearnShell>
  );
}
