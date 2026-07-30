"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { courseId, type ProgrammeId } from "@/lib/programmes";
import { getLesson } from "@/lib/lms/curriculum";
import {
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import type { ConstructId } from "@/lib/content";

function renderMd(md: string) {
  // Minimal markdown: headings + paragraphs + lists
  return md.split("\n").map((line, i) => {
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="mt-6 text-base font-semibold text-ink">
          {line.replace(/^### /, "")}
        </h3>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="mt-8 text-xl font-semibold tracking-tight text-ink">
          {line.replace(/^## /, "")}
        </h2>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="ml-5 list-disc text-slate">
          {line.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    if (/^\d+\.\s/.test(line))
      return (
        <li key={i} className="ml-5 list-decimal text-slate">
          {line.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    if (!line.trim()) return <div key={i} className="h-2" />;
    const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <p
        key={i}
        className="text-base leading-relaxed text-slate"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

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

  if (!data) {
    return (
      <LearnShell title="Lesson">
        <p className="text-slate">Lesson not found.</p>
      </LearnShell>
    );
  }

  const done = state.lessonProgress[data.lesson.id] === "completed";
  const idx = data.course.lessons.findIndex((l) => l.id === data.lesson.id);

  return (
    <LearnShell
      title={data.lesson.title}
      subtitle={`Lesson ${idx + 1} of ${data.course.lessons.length} · ${data.lesson.durationMinutes} min · ${data.lesson.lessonType}`}
    >
      <article className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-8">
        <div className="prose-lesson max-w-none space-y-1">
          {renderMd(data.lesson.bodyMd)}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/learn/courses/${constructId}`}
            className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            ← Module outline
          </Link>
          <button
            type="button"
            onClick={markComplete}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            {done ? "Completed · continue" : "Mark complete & continue"}
          </button>
        </div>
      </article>
    </LearnShell>
  );
}
