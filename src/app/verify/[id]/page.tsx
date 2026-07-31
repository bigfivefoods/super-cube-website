import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify certificate",
  description:
    "Verify a Super-Cube® Leadership Development certificate of completion.",
  robots: { index: false, follow: false },
};

/**
 * Public certificate verify page.
 * Full cryptographic registry can be added server-side later; IDs are printed
 * on PDFs and share payloads so coaches can confirm format + origin.
 */
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw || "").trim().toUpperCase();
  const validFormat = /^SC-\d{8}-[0-9A-F]{6,12}$/i.test(id);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:py-20">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
        Certificate verification
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Super-Cube® completion ID
      </h1>
      <p className="mt-4 break-all rounded-xl border border-black/[0.08] bg-[#fafafa] px-4 py-3 font-mono text-sm font-semibold text-ink">
        {id || "—"}
      </p>

      {validFormat ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="font-semibold">Format looks valid</p>
          <p className="mt-1.5 leading-relaxed text-emerald-900/90">
            This matches the Super-Cube® certificate ID pattern issued after a
            learner completes the pathway and post-assessment. For full audit
            trails (org cohorts), contact{" "}
            <a className="underline" href="mailto:hello@super-cube.me">
              hello@super-cube.me
            </a>{" "}
            with this ID.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">Unrecognised format</p>
          <p className="mt-1.5">
            Expected pattern like{" "}
            <code className="rounded bg-white/80 px-1">SC-20260731-A1B2C3D4</code>
            . Ask the learner to re-download their certificate from Learn →
            Report.
          </p>
        </div>
      )}

      <ul className="mt-8 space-y-2 text-sm text-slate">
        <li>· Certificates are developmental, not clinical credentials.</li>
        <li>· IDs are generated when the post-assessment pathway is complete.</li>
        <li>· Shared growth reports may also include this ID.</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          Super-Cube® home
        </Link>
        <Link
          href="/learn"
          className="rounded-full border border-black/[0.12] bg-white px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Open Learn
        </Link>
      </div>
    </main>
  );
}
