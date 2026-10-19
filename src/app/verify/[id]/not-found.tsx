import Link from "next/link";

/** Unknown or malformed certificate IDs: a real 404 that says nothing about other certificates. */
export default function CertificateNotFound() {
  return (
    <section className="section-pad bg-surface pt-28 lg:pt-32">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">Certificate check</p>
        <h1 className="heading-lg mt-2.5 text-ink">Certificate not found</h1>
        <div data-testid="verify-status" data-status="not_found" className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-950">
          There is no Super-Cube® certificate with this ID. Check it was typed exactly as printed (for
          example SC-20261004-1A2B3C4D5E). A certificate that is not in the registry should not be accepted.
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/verify" className="sc-btn sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold">
            Check another ID
          </Link>
          <Link href="/" className="sc-btn inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-ink">
            Super-Cube® home
          </Link>
        </div>
      </div>
    </section>
  );
}
