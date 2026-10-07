"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProgramme } from "@/lib/programmes";

type CertRow = {
  id: string;
  learner_name: string;
  programme_id: string | null;
  pre_overall: number | null;
  post_overall: number | null;
  growth: number | null;
  issued_at: string;
  org_code: string | null;
};

type VerifyStatus = "loading" | "found" | "not_found" | "revoked" | "invalid" | "unavailable";

export default function VerifyCertificatePage() {
  const params = useParams();
  const id = decodeURIComponent(String(params.id || ""))
    .trim()
    .toUpperCase();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [cert, setCert] = useState<CertRow | null>(null);

  useEffect(() => {
    if (!id) {
      setStatus("invalid");
      return;
    }
    // Always ask the server: the ID format alone proves nothing.
    void fetch(`/api/certificates/register?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as {
          status?: VerifyStatus;
          certificate?: CertRow;
        };
        const st = j.status ?? (r.status === 503 ? "unavailable" : "not_found");
        setStatus(st);
        setCert(st === "found" ? (j.certificate ?? null) : null);
      })
      .catch(() => setStatus("unavailable"));
  }, [id]);

  const programme = cert?.programme_id
    ? getProgramme(cert.programme_id as "kids" | "adolescents" | "adults")
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 pb-16 pt-28 sm:pb-20 lg:pt-32">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
        Certificate verification
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Super-Cube® completion ID
      </h1>
      <p className="mt-4 break-all rounded-xl border border-line bg-surface px-4 py-3 font-mono text-sm font-semibold text-ink">
        {id || "—"}
      </p>

      <div aria-live="polite" data-testid="verify-status" data-status={status}>
        {status === "loading" && (
          <p className="mt-6 text-sm text-muted">Checking the Super-Cube® registry…</p>
        )}

        {status === "found" && cert && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
            <p className="font-semibold">Verified: issued by Super-Cube®</p>
            <p className="mt-2">
              <strong>{cert.learner_name}</strong>
              {programme ? ` · ${programme.name}` : ""}
            </p>
            {cert.post_overall != null && (
              <p className="mt-1 tabular-nums">
                Overall score: {cert.pre_overall ?? "—"} to {cert.post_overall}
                {cert.growth != null
                  ? ` (${cert.growth > 0 ? "+" : ""}${cert.growth} pts)`
                  : ""}
              </p>
            )}
            <p className="mt-1 text-emerald-900/80">
              Issued{" "}
              {new Date(cert.issued_at).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Africa/Johannesburg",
              })}
              {cert.org_code ? ` · Cohort ${cert.org_code}` : ""}
            </p>
          </div>
        )}

        {(status === "not_found" || status === "invalid") && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950">
            <p className="font-semibold">Certificate not found</p>
            <p className="mt-1.5 leading-relaxed">
              There is no Super-Cube® certificate with this ID. Check it was typed
              exactly as printed (for example SC-20261004-1A2B3C4D5E). A certificate
              that is not in the registry should not be accepted.
            </p>
          </div>
        )}

        {status === "revoked" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950">
            <p className="font-semibold">Certificate revoked</p>
            <p className="mt-1.5">This certificate was withdrawn and is no longer valid.</p>
          </div>
        )}

        {status === "unavailable" && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p className="font-semibold">Registry unavailable</p>
            <p className="mt-1.5">
              We could not reach the certificate registry just now, so this ID is
              not verified. Please try again later.
            </p>
          </div>
        )}
      </div>

      <ul className="mt-8 space-y-2 text-sm text-slate">
        <li>· Certificates are developmental, not clinical credentials.</li>
        <li>· The registry shows only the name, programme and scores on the certificate. Journals are never shared.</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full sc-btn-primary px-5 py-2.5 text-sm font-semibold "
        >
          Super-Cube® home
        </Link>
        <Link
          href="/learn"
          className="rounded-full border border-line-strong bg-elevated px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Open Learn
        </Link>
      </div>
    </main>
  );
}
