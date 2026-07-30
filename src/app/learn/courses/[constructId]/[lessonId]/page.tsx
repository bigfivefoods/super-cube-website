"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { LessonContent } from "@/components/learn/LessonContent";
import { constructs, type ConstructId } from "@/lib/content";
import { getLesson } from "@/lib/lms/curriculum";
import {
  loadLmsState,
  saveLmsState,
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

  useEffect(() => setState(loadLmsState()), []);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;

  const data = useMemo(
    () => getLesson(courseId(programmeId, constructId), lessonId),
    [programmeId, constructId, lessonId]
  );

  const construct = constructs.find((c) => c.id === constructId);

  function markComplete() {
    if (!data) return;
    const next = loadLmsState();
    next.lessonProgress[data.lesson.id] = "completed";
    saveLmsState(next);
    setState(next);

    const idx = data.course.lessons.findIndex((l) => l.id === data.lesson.id);
    const nextLesson = data.course.lessons[idx + 1];
    if (nextLesson) {
      router.push(`/learn/courses/${constructId}/${nextLesson.id}`);
    } else {
      router.push(`/learn/courses/${constructId}`);
    }
  }

  if (!state) {
    return (
      <LearnShell title="Lesson">
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  if (!data || !construct) {
    return (
      <LearnShell title="Lesson">
        <p className="text-slate">Lesson not found.</p>
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
      {/* Session header strip */}
      <div
        className="mb-5 overflow-hidden rounded-2xl border border-black/[0.07]"
        style={{ background: colorSoft }}
      >
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white"
              style={{ background: color }}
            >
              {construct.name}
            </span>
            <span className="text-xs font-medium text-muted">
              {TYPE_LABEL[data.lesson.lessonType]}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-ink">
            {data.lesson.outcome}
          </p>
          <div className="mt-3 flex gap-1.5">
            {data.course.lessons.map((l, i) => (
              <Link
                key={l.id}
                href={`/learn/courses/${constructId}/${l.id}`}
                title={l.title}
                className="h-1.5 flex-1 rounded-full transition"
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
          <p className="mt-2 text-[0.7rem] text-muted">
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

      <div className="mt-8 flex flex-col gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
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
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
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
