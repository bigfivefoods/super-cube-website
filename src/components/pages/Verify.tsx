import Link from "next/link";
import { ShareCertificate } from "@/components/verify/ShareCertificate";
import {
  credentialName,
  formatIssuedDate,
  linkedInAddToProfileUrl,
  verifyUrl,
  DEFAULT_ORIGIN,
} from "@/lib/lms/certificate";
import { VERIFY_ISSUER, type LookupResult } from "@/lib/lms/verify";
import type { OpenBadgeState } from "@/lib/lms/open-badges/document";
import { DEFAULT_LOCALE, localizedPath, type Locale } from "@/lib/i18n/config";
import { fill } from "@/lib/i18n/pages/format";
import { pageI18n } from "@/lib/i18n/pages/t";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  path: "/verify",
  title: "Check a certificate",
  description:
    "Check that a Super-Cube® leadership certificate is genuine: enter the certificate ID printed on it to see the holder, programme, issue date and status.",
} satisfies PageMetaInput;

function issuedOn(iso: string, locale: Locale) {
  if (locale === DEFAULT_LOCALE) return formatIssuedDate(iso);
  const tag =
    locale === "pt" ? "pt-PT" : locale === "sw" ? "sw-KE" : locale === "zu" ? "zu-ZA" : locale === "af" ? "af-ZA" : locale === "fr" ? "fr-FR" : locale;
  return new Date(iso).toLocaleDateString(tag, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}

export async function VerifySearch({
  locale = DEFAULT_LOCALE,
  submitted,
  error,
}: {
  locale?: Locale;
  submitted?: string;
  error: string | null;
}) {
  const { t, L } = await pageI18n(locale);
  return (
    <section className="bg-surface pb-16 pt-32 sm:pb-20 lg:pt-36">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">{t("Certificate check")}</p>
        <h1 className="heading-lg mt-2.5 text-ink">{t("Check a Super-Cube® certificate")}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
          {t(
            "Every Super-Cube® certificate carries a unique ID and QR code. Enter the ID to confirm who it was issued to, for which programme, when, and whether it is still valid.",
          )}
        </p>

        <form action={localizedPath(locale, "/verify")} method="get" className="sc-card mt-8 p-5 sm:p-6" role="search" noValidate>
          <label htmlFor="cert-id" className="block text-sm font-semibold text-ink">
            {t("Certificate ID")}
          </label>
          <p id="cert-id-hint" className="mt-1 text-sm text-muted">
            {t("For example")} <span className="font-mono" dir="ltr">SC-20261004-1A2B3C4D5E</span>
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
              {t("Check certificate")}
            </button>
          </div>
          {error && (
            <p id="cert-id-error" role="alert" className="mt-3 text-sm font-medium text-red-800">
              {t(error)}
            </p>
          )}
        </form>

        <ul className="mt-8 space-y-2 text-sm leading-relaxed text-slate">
          <li>
            · {t("Certificates are issued by")} {VERIFY_ISSUER} {t("for its leadership programmes.")}
          </li>
          <li>· {t("The check shows only what is printed on the certificate. Scores, journals and contact details are never shown.")}</li>
          <li>· {t("A certificate that is not in the registry should not be accepted.")}</li>
        </ul>
        <p className="mt-8 text-sm">
          <Link href={L("/certify")} className="font-semibold text-ink underline underline-offset-4">
            {t("About Super-Cube® certification")}
          </Link>
        </p>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="text-[0.9375rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

export async function VerifyResult({
  locale = DEFAULT_LOCALE,
  id,
  status,
  certificate,
  openBadge = "none",
}: {
  locale?: Locale;
  id: string;
  status: "found" | "revoked" | "unavailable";
  certificate?: Extract<LookupResult, { status: "found" | "revoked" }>["certificate"];
  openBadge?: OpenBadgeState;
}) {
  const { t, L } = await pageI18n(locale);
  const url = verifyUrl(id, DEFAULT_ORIGIN);
  return (
    <section className="bg-surface pb-16 pt-32 sm:pb-20 lg:pt-36">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">{t("Certificate check")}</p>
        <h1 className="heading-lg mt-2.5 text-ink">{t("Super-Cube® certificate")}</h1>

        {status === "unavailable" && (
          <div
            data-testid="verify-status"
            data-status="unavailable"
            className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          >
            <p className="font-semibold">{t("Registry unavailable")}</p>
            <p className="mt-1.5 leading-relaxed">
              {t("We could not reach the Super-Cube® certificate registry just now, so ID")}{" "}
              <span className="font-mono" dir="ltr">{id}</span>{" "}
              {t("is not verified. Please try again later.")}
            </p>
          </div>
        )}

        {(status === "found" || status === "revoked") && certificate && (
          <>
            <div
              data-testid="verify-status"
              data-status={status}
              className={`mt-8 flex items-start gap-3 rounded-2xl border px-5 py-4 ${
                status === "found"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-red-300 bg-red-50 text-red-950"
              }`}
            >
              <span aria-hidden className="mt-0.5 text-lg leading-none">
                {status === "found" ? "✓" : "✕"}
              </span>
              <div>
                <p className="font-semibold">{status === "found" ? t("Valid certificate") : t("Certificate revoked")}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {status === "found"
                    ? fill(t("This certificate is in the Super-Cube® registry and was issued by {issuer}."), {
                        issuer: VERIFY_ISSUER,
                      })
                    : t("This certificate was withdrawn by the issuer and is no longer valid.")}
                </p>
              </div>
            </div>

            <dl className="sc-card mt-6 px-5 py-2 sm:px-6">
              <Row label={t("Holder")}>{certificate.holderName}</Row>
              <Row label={t("Programme")}>{t(credentialName(certificate.programmeId))}</Row>
              <Row label={t("Issued")}>{issuedOn(certificate.issuedAt, locale)}</Row>
              <Row label={t("Status")}>
                {status === "found" ? (
                  <span className="text-emerald-800">{t("Valid")}</span>
                ) : (
                  <span className="text-red-800">
                    {t("Revoked")}
                    {certificate.revokedAt
                      ? ` ${fill(t("on {date}"), { date: issuedOn(certificate.revokedAt, locale) })}`
                      : ""}
                  </span>
                )}
              </Row>
              <Row label={t("Issuer")}>{VERIFY_ISSUER}</Row>
              <Row label={t("Certificate ID")}>
                <span className="break-all font-mono text-sm" dir="ltr">{id}</span>
              </Row>
            </dl>

            <OpenBadgeStatus locale={locale} id={id} state={status === "revoked" ? "revoked" : openBadge} />
            <OpenBadgeDownloads id={id} state={status === "revoked" ? "revoked" : openBadge} locale={locale} />

            {status === "found" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={linkedInAddToProfileUrl(
                    {
                      id,
                      programmeId: certificate.programmeId,
                      issuedAt: certificate.issuedAt,
                      siteOrigin: DEFAULT_ORIGIN,
                    },
                    VERIFY_ISSUER,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sc-btn sc-btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {t("Add to LinkedIn")}
                  <span className="sr-only"> {t("profile (opens in a new tab)")}</span>
                </a>
                <ShareCertificate url={url} title={fill(t("Super-Cube® certificate {id}"), { id })} />
              </div>
            )}
          </>
        )}

        <ul className="mt-10 space-y-2 text-sm leading-relaxed text-slate">
          <li>· {t("Super-Cube® certificates are developmental, not clinical credentials.")}</li>
          <li>· {t("This check shows only what is printed on the certificate. Scores, journals and contact details are never shown.")}</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href={L("/verify")} className="text-ink underline underline-offset-4">
            {t("Check another certificate")}
          </Link>
          <Link href={L("/certify")} className="text-ink underline underline-offset-4">
            {t("About Super-Cube® certification")}
          </Link>
        </div>
      </div>
    </section>
  );
}

async function OpenBadgeStatus({ locale, state }: { locale: Locale; id: string; state: OpenBadgeState }) {
  const { t } = await pageI18n(locale);
  const copy: Record<OpenBadgeState, string> = {
    valid: fill(t("This Open Badge 3.0 credential is signed by {issuer} and matches this certificate check."), {
      issuer: VERIFY_ISSUER,
    }),
    revoked: t("This Open Badge was revoked, in line with this certificate check."),
    unsigned: t("An Open Badge is on file for this certificate, but it is not signed yet."),
    invalid: t("The Open Badge signature does not match the issuer."),
    unchecked: t("An Open Badge is on file. This server cannot check the signature until the issuer key is configured."),
    none: t("No Open Badge has been issued for this certificate yet."),
    unavailable: t("Open Badge status could not be loaded."),
  };
  return (
    <div className="mt-6 rounded-2xl border border-line bg-elevated px-5 py-4" data-testid="open-badge-status" data-status={state}>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{t("Open Badge 3.0")}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink">{copy[state]}</p>
    </div>
  );
}

async function OpenBadgeDownloads({ id, state, locale }: { id: string; state: OpenBadgeState; locale: Locale }) {
  const { t } = await pageI18n(locale);
  if (state !== "valid" && state !== "revoked" && state !== "unsigned" && state !== "unchecked") return null;
  const base = `/credentials/${encodeURIComponent(id)}`;
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <a
        href={`${base}?download=1`}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
      >
        {t("Download Open Badge (JSON-LD)")}
      </a>
      <a
        href={`${base}/image`}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
      >
        {t("Download badge image")}
      </a>
    </div>
  );
}
