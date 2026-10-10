"use client";

import Link from "next/link";
import Image from "next/image";
import { LearnShell } from "@/components/learn/LearnShell";
import { PaywallCard } from "@/components/learn/PaywallCard";
import { useLmsState } from "@/components/learn/useLearnState";
import { constructs } from "@/lib/content";
import { faceTagline } from "@/lib/lms/face-taglines";
import { getCoursesForProgramme } from "@/lib/lms/curriculum-meta";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { faceInkStyle } from "@/lib/contrast";
import { programmeCopy } from "@/lib/lms/programme-copy";

export default function CoursesPage() {
  const state = useLmsState();

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const courses = getCoursesForProgramme(programmeId);

  return (
    <LearnShell
      title="Step 4 of 6 · Develop the six faces"
      subtitle={programmeCopy("courses.subtitle", programmeId, { programme: programme?.name ?? "Programme" })}
    >
      <PaywallCard />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5 xl:grid-cols-3">
        {courses.map((course) => {
          const construct = constructs.find((c) => c.id === course.constructId);
          const done = course.lessons.filter(
            (l) => state?.lessonProgress[l.id] === "completed",
          ).length;
          const pct = Math.round((done / course.lessons.length) * 100);
          const color = construct?.color ?? "#111";
          const soft = construct?.colorSoft ?? "#f4f4f4";
          return (
            <article
              key={course.id}
              className="card-lift group flex gap-3 overflow-hidden rounded-2xl border border-line bg-elevated p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-3.5"
              style={{
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              {/* Cover only: the 15s intro plays on the module page, not in a tiny card */}
              <Link
                href={`/learn/courses/${course.constructId}`}
                tabIndex={-1}
                aria-hidden
                className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-16"
                style={{ background: soft }}
              >
                <Image src={course.coverPath} alt="" fill sizes="64px" className="object-cover" />
              </Link>

              <Link
                href={`/learn/courses/${course.constructId}`}
                className="min-w-0 flex-1 py-0.5 outline-none"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <h2 className="truncate text-[0.875rem] font-semibold tracking-tight text-ink group-hover:underline">
                    {construct?.name}
                  </h2>
                </div>
                <p
                  className="face-ink mt-0.5 line-clamp-2 text-[0.7rem] font-medium"
                  style={faceInkStyle(color)}
                >
                  {construct ? faceTagline(construct.id, programmeId) : null}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[0.75rem] leading-snug text-slate">
                  {course.promise}
                </p>
                <div className="learn-progress mt-2.5">
                  <div style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="learn-meta mt-1">
                  {done}/{course.lessons.length} sessions · {pct}%
                </p>
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-elevated p-4 sm:p-5" data-testid="review-card">
        <p className="learn-eyebrow">Make it stick</p>
        <p className="mt-1 text-sm font-semibold text-ink">Spaced review on Day 3, 7 and 21, then the capstone</p>
        <p className="learn-meta mt-0.5">
          Three short mixed reviews bring back what you learned just as you start to forget it. The capstone
          brings all six faces together in one case and a personal leadership plan.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/learn/review" className="text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline">
            Spaced review →
          </Link>
          <Link
            href="/learn/review/capstone"
            className="text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Capstone
          </Link>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-elevated p-4 sm:p-5">
        <p className="learn-eyebrow">After the full programme</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          Steps 5 and 6 of 6 · Re-measure, then see your report
        </p>
        <p className="learn-meta mt-0.5">
          {programmeCopy("courses.after", programmeId)}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/learn/assessment/post"
            className="text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Post-assessment →
          </Link>
          <Link
            href="/learn/report"
            className="text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            View report
          </Link>
        </div>
      </div>
    </LearnShell>
  );
}
