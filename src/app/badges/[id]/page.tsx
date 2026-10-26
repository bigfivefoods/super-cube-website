import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ISSUER_NAME } from "@/lib/lms/open-badges/document";
import { isCredentialId, lookupOpenBadge } from "@/lib/lms/server/open-badges";
import { isCertId } from "@/lib/lms/verify";
import { createAdminClient } from "@/lib/supabase/admin";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return pageMeta({
    title: "Open Badge check",
    description: "Check a Super-Cube® Open Badge 3.0 credential. Contact details are not shown.",
    path: `/badges/${encodeURIComponent(id)}`,
    noIndex: true,
  });
}

export default async function BadgeCheckPage({ params }: Props) {
  const raw = decodeURIComponent((await params).id);
  if (isCertId(raw)) redirect(`/verify/${encodeURIComponent(raw)}`);
  if (!isCredentialId(raw)) notFound();
  const { check } = await lookupOpenBadge(createAdminClient(), raw);
  if (check.state === "none") notFound();

  const issued = check.validFrom
    ? new Date(check.validFrom).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Africa/Johannesburg",
      })
    : null;

  const summary: Record<Exclude<typeof check.state, "none">, string> = {
    valid: `This Open Badge 3.0 credential is signed by ${ISSUER_NAME}.`,
    revoked: "This Open Badge was revoked by the issuer and is no longer valid.",
    unsigned: "This Open Badge is on file, but it is not signed yet.",
    invalid: "The Open Badge signature does not match the issuer.",
    unchecked: "This Open Badge is on file. This server cannot check the signature until the issuer key is configured.",
    unavailable: "Open Badge status could not be loaded. Please try again later.",
  };

  return (
    <section className="bg-surface pb-16 pt-32 sm:pb-20 lg:pt-36">
      <div className="container-site max-w-2xl">
        <p className="eyebrow">Open Badge 3.0</p>
        <h1 className="heading-lg mt-2.5 text-ink">Super-Cube® badge</h1>
        <div
          className="mt-8 rounded-2xl border border-line bg-elevated px-5 py-4"
          data-testid="badge-status"
          data-status={check.state}
          role="status"
        >
          <p className="font-semibold text-ink">{check.name ?? "Super-Cube® badge"}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate">{summary[check.state]}</p>
        </div>
        <dl className="sc-card mt-6 px-5 py-2 sm:px-6">
          <div className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Issuer</dt>
            <dd className="text-[0.9375rem] font-medium text-ink">{ISSUER_NAME}</dd>
          </div>
          {issued && (
            <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Awarded</dt>
              <dd className="text-[0.9375rem] font-medium text-ink">{issued}</dd>
            </div>
          )}
          <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Credential ID</dt>
            <dd className="break-all font-mono text-sm text-ink" dir="ltr">
              {raw}
            </dd>
          </div>
        </dl>
        {check.state !== "unavailable" && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={`/credentials/${encodeURIComponent(raw)}?download=1`}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-void px-5 text-sm font-semibold text-void-fg"
            >
              Download Open Badge (JSON-LD)
            </a>
            <a
              href={`/credentials/${encodeURIComponent(raw)}/image`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink"
            >
              Download badge image
            </a>
          </div>
        )}
        <p className="mt-8 text-sm leading-relaxed text-slate">
          This check shows the badge and the issuer. It does not show a name, an email address, scores or journals.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/issuer/super-cube" className="font-semibold text-ink underline underline-offset-4">
            Issuer profile
          </Link>
        </p>
      </div>
    </section>
  );
}
