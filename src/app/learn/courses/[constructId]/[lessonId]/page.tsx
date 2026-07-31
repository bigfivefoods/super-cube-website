"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SessionVideo } from "@/components/learn/CourseVideo";
import { LearnShell } from "@/components/learn/LearnShell";
import { LessonContent } from "@/components/learn/LessonContent";
import { SessionReflection } from "@/components/learn/SessionReflection";
import { constructs, type ConstructId } from "@/lib/content";
import { getLesson } from "@/lib/lms/curriculum";
import { track } from "@/lib/analytics";
import { sessionWinLine } from "@/lib/lms/wins";
import {
  loadLmsState,
  markLessonCompleted,
  markLessonInProgress,
  recordSessionWin,
  type LocalLmsState,
} from "@/lib/lms/store";
import { courseId, type ProgrammeId } from "@/lib/programmes";

const TYPE_LABEL: Record<string, string> = {
  content: "Session",
  practice: "Practice lab",
  quiz: "Quick check",
};

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const constructId = params.constructId as ConstructId;
  const lessonId = params.lessonId as string;
  const [state, setState] = useState<LocalLmsState | null>(null);
  const [winBanner, setWinBanner] = useState<string | null>(null);

  useEffect(() => setState(loadLmsState()), []);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;

  const data = useMemo(
    () => getLesson(courseId(programmeId, constructId), lessonId),
    [programmeId, constructId, lessonId]
  );

  const construct = constructs.find((c) => c.id === constructId);

  // Track resume + in-progress when opening a session
  useEffect(() => {
    if (!data || !construct) return;
    if (state?.lessonProgress[data.lesson.id] === "completed") return;
    setState(markLessonInProgress(data.lesson.id, constructId));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per lesson id
  }, [lessonId, constructId, data?.lesson.id]);

  function markComplete() {
    if (!data) return;
    if (state?.lessonProgress[data.lesson.id] === "completed") {
      continueAfterWin();
      return;
    }
    markLessonCompleted(data.lesson.id, constructId);
    const win = sessionWinLine(
      constructId,
      programmeId,
      data.lesson.title
    );
    recordSessionWin(data.lesson.id, constructId, win);
    setState(loadLmsState());
    setWinBanner(win);
    track("lesson_complete", {
      constructId,
      lessonId: data.lesson.id,
      programmeId,
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

  if (!state) {
    return (
      <LearnShell title="Lesson">
        <p className="learn-meta">Loading…</p>
      </LearnShell>
    );
  }

  if (!data || !construct) {
    return (
      <LearnShell title="Lesson">
        <p className="learn-body">Lesson not found.</p>
      </LearnShell>
    );
  }

  const done = state.lessonProgress[data.lesson.id] === "completed";
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
        className="mb-4 overflow-hidden rounded-2xl border border-black/[0.07]"
        style={{ background: colorSoft }}
      >
        <div className="p-3 sm:p-4">
          <SessionVideo
            lessonId={data.lesson.id}
            poster={data.course.coverPath}
            title={data.lesson.title}
            color={color}
            variant="hero"
          />
        </div>
        <div className="border-t border-black/[0.05] px-3.5 py-3.5 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-white"
              style={{ background: color }}
            >
              {construct.name}
            </span>
            <span className="learn-meta font-medium">
              {TYPE_LABEL[data.lesson.lessonType]}
            </span>
          </div>
          <p className="mt-1.5 text-[0.8125rem] font-medium leading-snug text-ink">
            {data.lesson.outcome}
          </p>
          <div className="mt-2.5 flex gap-1">
            {data.course.lessons.map((l, i) => (
              <Link
                key={l.id}
                href={`/learn/courses/${constructId}/${l.id}`}
                title={l.title}
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
          <p className="learn-meta mt-1.5">
            Path: <strong className="font-semibold text-ink">Read</strong> →{" "}
            <strong className="font-semibold text-ink">Engage</strong> →{" "}
            <strong className="font-semibold text-ink">Apply</strong>
          </p>
        </div>
      </div>

      <LessonContent
        sections={data.lesson.sections}
        color={color}
        colorSoft={colorSoft}
      />

      <SessionReflection
        lessonId={data.lesson.id}
        constructId={constructId}
        color={color}
      />

      {winBanner && (
        <div
          className="mt-5 rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5"
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

      <div className="mt-6 flex flex-col gap-2.5 border-t border-black/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
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
