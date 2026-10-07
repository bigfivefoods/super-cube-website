import type { Metadata } from "next";
import Link from "next/link";
import { requireLmsAdmin } from "@/lib/admin/auth";
import { isNonProductionDeploy } from "@/lib/deploy-env";
import { INSTRUMENT_LABELS, isInstrumentV2EnabledServer } from "@/lib/lms/instruments";
import { SignInForm } from "@/app/newsletter/admin/SignInForm";
import { InstrumentV2Preview } from "./InstrumentV2Preview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Instrument v2 preview · Super-Cube® admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/**
 * Admin-only preview of instrument v2 (draft). Open on Vercel preview and
 * development deployments so reviewers can try it; on production it needs the
 * Super-Cube® admin sign-in. Nothing here writes to the learner database.
 */
export default async function InstrumentV2PreviewPage() {
  const open = isNonProductionDeploy();
  const ctx = open ? null : await requireLmsAdmin();
  const allowed = open || Boolean(ctx?.ok);
  const live = isInstrumentV2EnabledServer();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 lg:pt-32">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Super-Cube® admin · preview</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Assessment instrument v2</h1>
      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-slate">
        A draft for Dr Craig R. Muller&apos;s sign-off: behaviourally anchored statements (about one-third reverse-keyed),
        situational judgement items, Kids and Teens forms, and a parallel observer form. Learners still take{" "}
        <strong>{INSTRUMENT_LABELS.v1}</strong>. v2 is <strong>{live ? "ON" : "OFF"}</strong> for new baselines on this
        deployment ({live ? "LMS_INSTRUMENT_V2=on" : "set LMS_INSTRUMENT_V2=on and NEXT_PUBLIC_LMS_INSTRUMENT_V2=on to switch it on"}).
        Anything you answer here stays in this browser tab and never creates a baseline.
      </p>
      {allowed ? (
        <div className="mt-6">
          <InstrumentV2Preview />
        </div>
      ) : (
        <div className="mt-6 max-w-md rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-lg font-semibold text-ink">Admin sign-in</h2>
          <p className="mt-1 text-sm text-slate">
            Sign in with your Super-Cube® admin account. After signing in you will return to this preview.
          </p>
          <SignInForm next="/admin/instrument-v2" />
          <p className="mt-4 text-sm">
            <Link href="/admin" className="underline">
              Back to the admin console
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
