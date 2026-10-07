import Link from "next/link";

/** 404 for bad or outdated session and course links inside Learn. */
export default function CourseNotFound() {
  return (
    <div className="container-site pb-16 pt-6 lg:pt-10" data-testid="lesson-not-found">
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-elevated p-6 text-center sm:p-8">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">404 · Session not found</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">We can’t find that session</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate">
          The link may be old or mistyped. Your progress is safe. Pick up from your courses or carry on with your pathway.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/learn/courses" className="inline-flex min-h-11 items-center rounded-full sc-btn-primary px-5 text-sm font-semibold">
            All courses
          </Link>
          <Link href="/learn" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink">
            Back to Today
          </Link>
        </div>
      </div>
    </div>
  );
}
