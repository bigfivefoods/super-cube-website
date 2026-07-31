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

export default function VerifyCertificatePage() {
  const params = useParams();
  const id = String(params.id || "")
    .trim()
    .toUpperCase();
  const formatValid = /^SC-\d{8}-[0-9A-F]{6,12}$/i.test(id);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [cert, setCert] = useState<CertRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    void fetch(`/api/certificates/register?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((j) => {
        setFound(Boolean(j.found));
        setCert(j.certificate ?? null);
        setMessage(j.message ?? null);
      })
      .catch(() => setMessage("Could not reach registry"))
      .finally(() => setLoading(false));
  }, [id]);

  const programme = cert?.programme_id
    ? getProgramme(cert.programme_id as "kids" | "adolescents" | "adults")
    : null;

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

      {loading && (
        <p className="mt-6 text-sm text-muted">Checking registry…</p>
      )}

      {!loading && found && cert && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="font-semibold">Registered certificate</p>
          <p className="mt-2">
            <strong>{cert.learner_name}</strong>
            {programme ? ` · ${programme.name}` : ""}
          </p>
          {cert.post_overall != null && (
            <p className="mt-1 tabular-nums">
              Growth: {cert.pre_overall ?? "—"} → {cert.post_overall}
              {cert.growth != null
                ? ` (${cert.growth > 0 ? "+" : ""}${cert.growth} pts)`
                : ""}
            </p>
          )}
          <p className="mt-1 text-emerald-900/80">
            Issued{" "}
            {new Date(cert.issued_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {cert.org_code ? ` · Cohort ${cert.org_code}` : ""}
          </p>
        </div>
      )}

      {!loading && !found && formatValid && (
        <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
          <p className="font-semibold">Format looks valid</p>
          <p className="mt-1.5 leading-relaxed">
            ID matches Super-Cube® certificate pattern. It is not yet in the
            cloud registry (learner may have generated offline, or{" "}
            <code className="text-xs">SUPABASE_RUN_THIS_ORGS_COACH.sql</code>{" "}
            not applied). Ask the learner to re-download from Learn → Report
            while signed in.
          </p>
          {message && <p className="mt-2 text-xs opacity-80">{message}</p>}
        </div>
      )}

      {!loading && !formatValid && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">Unrecognised format</p>
          <p className="mt-1.5">
            Expected like{" "}
            <code className="rounded bg-white/80 px-1">SC-20260731-A1B2C3D4</code>
            .
          </p>
        </div>
      )}

      <ul className="mt-8 space-y-2 text-sm text-slate">
        <li>· Certificates are developmental, not clinical credentials.</li>
        <li>· Registry is privacy-preserving (name + scores, no journals).</li>
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
