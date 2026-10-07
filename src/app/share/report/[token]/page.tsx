import Link from "next/link";
import { constructs } from "@/lib/content";
import { formatDateZA } from "@/lib/datetime";
import { resolveShare, type ResolvedShare } from "@/lib/lms/server/share-links";
import type { ShareView } from "@/lib/lms/share";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { clientIp, hit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

const NOTICES: Record<Exclude<ResolvedShare["state"], "ok">, { title: string; body: string }> = {
  expired: {
    title: "This link has expired",
    body: "Share links last 7, 30 or 90 days. Ask the learner to create a new one from their growth report.",
  },
  revoked: {
    title: "This link has been turned off",
    body: "The learner (or their parent or guardian) has stopped sharing this report. If you still need it, ask them for a new link.",
  },
  not_found: {
    title: "We can’t find this link",
    body: "Check that the whole link was copied. If it still doesn’t open, ask the learner to send it again.",
  },
  legacy: {
    title: "This link uses an older format",
    body: "To protect learners’ privacy, growth reports are now shared with links that expire and can be turned off, and scores are never kept in the link itself. Ask the learner for a new link from their report.",
  },
  unavailable: {
    title: "Sharing is unavailable right now",
    body: "Please try again in a few minutes.",
  },
};

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Tokens are unguessable; this just stops anyone hammering the lookup.
  const limit = await hit("share-view", [`ip:${clientIp(await headers())}`]);
  const result: ResolvedShare = limit.allowed
    ? await resolveShare(createAdminClient(), safeDecode(token))
    : { state: "unavailable" };

  if (result.state !== "ok") {
    const n = NOTICES[result.state];
    return (
      <section className="pb-20 pt-[calc(6rem+env(safe-area-inset-top,0px))] md:pt-32" data-testid={`share-${result.state}`}>
        <div className="container-site">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">Shared growth report</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{n.title}</h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate">{n.body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/" className="inline-flex min-h-11 items-center rounded-full sc-btn-primary px-5 text-sm font-semibold">
                Super-Cube® home
              </Link>
              <Link href="/learn/report" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink">
                I’m the learner
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <SharedReport view={result.view} />;
}

function safeDecode(t: string | undefined): string {
  try {
    return decodeURIComponent(t || "");
  } catch {
    return "";
  }
}

function SharedReport({ view }: { view: ShareView }) {
  const growth = view.growth;
  return (
    <div data-testid="share-ok">
      <section className="border-b border-line pb-10 pt-[calc(6rem+env(safe-area-inset-top,0px))] md:pt-32">
        <div className="container-site">
          <div className="mx-auto max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">Shared growth report · Super-Cube®</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {view.name ?? "A Super-Cube® learner"}
            </h1>
            <p className="mt-2 text-sm text-slate">{view.programmeName}</p>
            <p className="mt-1 text-xs text-slate">
              Scores as of {formatDateZA(view.snapshotAt)} · Developmental self-report, not a clinical diagnosis
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
              <Stat label="Baseline" value={String(view.preOverall)} />
              <Stat label="After-test" value={view.postOverall != null ? String(view.postOverall) : "Not yet"} />
              <Stat
                label="Change"
                value={growth != null ? `${growth > 0 ? "+" : growth < 0 ? "−" : ""}${Math.abs(growth)}` : "Pending"}
              />
            </dl>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-10">
        <div className="container-site">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate">By face</h2>
            <ul className="mt-4 space-y-2">
              {view.constructs.map((row) => {
                const c = constructs.find((x) => x.id === row.id);
                return (
                  <li key={row.id} className="flex items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-3">
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c?.color ?? "#111" }} />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{row.name}</span>
                    <span className="text-sm tabular-nums text-slate">
                      {row.pre}
                      {row.post != null ? (
                        <>
                          <span aria-hidden> → </span>
                          <span className="sr-only"> to </span>
                          {row.post}
                        </>
                      ) : null}
                    </span>
                    {row.delta != null && (
                      <span
                        className={`min-w-[3rem] text-right text-xs font-semibold tabular-nums ${
                          row.delta > 0 ? "text-emerald-800" : row.delta < 0 ? "text-amber-800" : "text-slate"
                        }`}
                      >
                        {row.delta > 0 ? "+" : row.delta < 0 ? "−" : ""}
                        {Math.abs(row.delta)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {view.certificateId && (
              <p className="mt-8 text-center text-sm text-slate">
                Certificate{" "}
                <Link href={`/verify/${view.certificateId}`} className="font-semibold text-ink underline underline-offset-2">
                  {view.certificateId}
                </Link>
              </p>
            )}

            <p className="mt-8 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-slate">
              Shared by the learner. This link stops working on {formatDateZA(view.expiresAt)}, or sooner if they turn it off.
              Journals and individual answers are never shared.
            </p>

            <div className="mt-10 text-center">
              <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-full sc-btn-primary px-5 text-sm font-semibold">
                Start your own Super-Cube® pathway
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated px-3 py-3">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-ink sm:text-xl">{value}</dd>
    </div>
  );
}
