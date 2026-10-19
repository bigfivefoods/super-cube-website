import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ShareCertificate } from "@/components/verify/ShareCertificate";
import { credentialName, formatIssuedDate, linkedInAddToProfileUrl, verifyUrl, DEFAULT_ORIGIN } from "@/lib/lms/certificate";
import { lookupCertificate } from "@/lib/lms/server/certificate-lookup";
import { normaliseCertId, VERIFY_ISSUER } from "@/lib/lms/verify";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

const lookup = cache((id: string) => lookupCertificate(id));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = normaliseCertId((await params).id);
  return pageMeta({
    title: `Certificate check ${id}`,
    description: "Check that a Super-Cube® leadership certificate is genuine and still valid.",
    path: `/verify/${encodeURIComponent(id)}`,
    // Holder names stay out of search results; the link still works for anyone who has it.
    noIndex: true,
  });
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="text-[0.9375rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

export default async function VerifyCertificatePage({ params }: Props) {
  const id = normaliseCertId((await params).id);
  const result = await lookup(id);

  if (result.status === "invalid" || result.status === "not_found") notFound();

  const url = verifyUrl(id, DEFAULT_ORIGIN);

  return (
    <section className="bg-surface pb-16 pt-32 sm:pb-20 lg:pt-36">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">Certificate check</p>
        <h1 className="heading-lg mt-2.5 text-ink">Super-Cube® certificate</h1>

        {result.status === "unavailable" && (
          <div
            data-testid="verify-status"
            data-status="unavailable"
            className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          >
            <p className="font-semibold">Registry unavailable</p>
            <p className="mt-1.5 leading-relaxed">
              We could not reach the Super-Cube® certificate registry just now, so ID{" "}
              <span className="font-mono">{id}</span> is not verified. Please try again later.
            </p>
          </div>
        )}

        {(result.status === "found" || result.status === "revoked") && (
          <>
            <div
              data-testid="verify-status"
              data-status={result.status}
              className={`mt-8 flex items-start gap-3 rounded-2xl border px-5 py-4 ${
                result.status === "found"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-red-300 bg-red-50 text-red-950"
              }`}
            >
              <span aria-hidden className="mt-0.5 text-lg leading-none">
                {result.status === "found" ? "✓" : "✕"}
              </span>
              <div>
                <p className="font-semibold">
                  {result.status === "found" ? "Valid certificate" : "Certificate revoked"}
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  {result.status === "found"
                    ? `This certificate is in the Super-Cube® registry and was issued by ${VERIFY_ISSUER}.`
                    : "This certificate was withdrawn by the issuer and is no longer valid."}
                </p>
              </div>
            </div>

            <dl className="sc-card mt-6 px-5 py-2 sm:px-6">
              <Row label="Holder">{result.certificate.holderName}</Row>
              <Row label="Programme">{credentialName(result.certificate.programmeId)}</Row>
              <Row label="Issued">{formatIssuedDate(result.certificate.issuedAt)}</Row>
              <Row label="Status">
                {result.status === "found" ? (
                  <span className="text-emerald-800">Valid</span>
                ) : (
                  <span className="text-red-800">
                    Revoked
                    {result.certificate.revokedAt ? ` on ${formatIssuedDate(result.certificate.revokedAt)}` : ""}
                  </span>
                )}
              </Row>
              <Row label="Issuer">{VERIFY_ISSUER}</Row>
              <Row label="Certificate ID">
                <span className="break-all font-mono text-sm">{id}</span>
              </Row>
            </dl>

            {result.status === "found" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={linkedInAddToProfileUrl(
                    {
                      id,
                      programmeId: result.certificate.programmeId,
                      issuedAt: result.certificate.issuedAt,
                      siteOrigin: DEFAULT_ORIGIN,
                    },
                    VERIFY_ISSUER,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sc-btn sc-btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Add to LinkedIn<span className="sr-only"> profile (opens in a new tab)</span>
                </a>
                <ShareCertificate url={url} title={`Super-Cube® certificate ${id}`} />
              </div>
            )}
          </>
        )}

        <ul className="mt-10 space-y-2 text-sm leading-relaxed text-slate">
          <li>· Super-Cube® certificates are developmental, not clinical credentials.</li>
          <li>· This check shows only what is printed on the certificate. Scores, journals and contact details are never shown.</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/verify" className="underline underline-offset-4 text-ink">
            Check another certificate
          </Link>
          <Link href="/certify" className="underline underline-offset-4 text-ink">
            About Super-Cube® certification
          </Link>
        </div>
      </div>
    </section>
  );
}
