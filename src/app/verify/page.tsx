import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isCertId, normaliseCertId } from "@/lib/lms/verify";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Check a certificate",
  description:
    "Check that a Super-Cube® leadership certificate is genuine: enter the certificate ID printed on it to see the holder, programme, issue date and status.",
  path: "/verify",
});

type Props = { searchParams: Promise<{ id?: string | string[] }> };

export default async function VerifySearchPage({ searchParams }: Props) {
  const raw = (await searchParams).id;
  const submitted = Array.isArray(raw) ? raw[0] : raw;
  const id = submitted != null ? normaliseCertId(submitted) : "";
  if (id && isCertId(id)) redirect(`/verify/${encodeURIComponent(id)}`);
  const error = submitted != null ? (id ? "That is not a Super-Cube® certificate ID. Check it was typed exactly as printed." : "Enter the certificate ID.") : null;

  return (
    <section className="bg-surface pb-16 pt-32 sm:pb-20 lg:pt-36">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">Certificate check</p>
        <h1 className="heading-lg mt-2.5 text-ink">Check a Super-Cube® certificate</h1>
        <p className="mt-4 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
          Every Super-Cube® certificate carries a unique ID and QR code. Enter the ID to confirm who it was
          issued to, for which programme, when, and whether it is still valid.
        </p>

        <form action="/verify" method="get" className="sc-card mt-8 p-5 sm:p-6" role="search" noValidate>
          <label htmlFor="cert-id" className="block text-sm font-semibold text-ink">
            Certificate ID
          </label>
          <p id="cert-id-hint" className="mt-1 text-sm text-muted">
            For example <span className="font-mono">SC-20261004-1A2B3C4D5E</span>
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="cert-id"
              name="id"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              defaultValue={submitted ?? ""}
              aria-describedby={error ? "cert-id-hint cert-id-error" : "cert-id-hint"}
              aria-invalid={error ? true : undefined}
              className="min-h-11 w-full flex-1 rounded-full border border-line-strong bg-elevated px-5 font-mono text-sm text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              placeholder="SC-YYYYMMDD-XXXXXXXXXX"
            />
            <button
              type="submit"
              className="sc-btn sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Check certificate
            </button>
          </div>
          {error && (
            <p id="cert-id-error" role="alert" className="mt-3 text-sm font-medium text-red-800">
              {error}
            </p>
          )}
        </form>

        <ul className="mt-8 space-y-2 text-sm leading-relaxed text-slate">
          <li>· Certificates are issued by Big Five Group for the Super-Cube® leadership programmes.</li>
          <li>· The check shows only what is printed on the certificate. Scores, journals and contact details are never shown.</li>
          <li>· A certificate that is not in the registry should not be accepted.</li>
        </ul>
        <p className="mt-8 text-sm">
          <Link href="/certify" className="font-semibold text-ink underline underline-offset-4">
            About Super-Cube® certification
          </Link>
        </p>
      </div>
    </section>
  );
}
