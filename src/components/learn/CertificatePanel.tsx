"use client";

import Image from "next/image";
import { useState } from "react";
import { issueCertificate } from "@/lib/lms/cloud";
import { isMinorProfile } from "@/lib/lms/consent";
import {
  CERT_AUTHOR,
  certificateFileBase,
  credentialDetails,
  credentialDetailsText,
  formatIssuedDate,
  fromIssuedRow,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  programmeName,
  verifyUrl,
  type CertificateData,
  type IssuedCertificateRow,
} from "@/lib/lms/certificate";
import { setCertificateMeta, type LocalAttempt, type LocalLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";
import { track } from "@/lib/analytics";

const CERT_KEY = "supercube_certificate_v1";

function readStoredRow(id?: string): IssuedCertificateRow | null {
  try {
    const raw = localStorage.getItem(CERT_KEY);
    if (!raw) return null;
    const row = JSON.parse(raw) as IssuedCertificateRow;
    if (!row?.id || (id && row.id !== id)) return null;
    return row;
  } catch {
    return null;
  }
}

function storeRow(row: IssuedCertificateRow) {
  try {
    localStorage.setItem(CERT_KEY, JSON.stringify(row));
  } catch {
    /* private mode: the panel still works for this visit */
  }
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

type Props = {
  state: LocalLmsState;
  pre: LocalAttempt;
  post: LocalAttempt;
  programmeId: ProgrammeId;
  onStateChange: (s: LocalLmsState) => void;
};

/**
 * Certificate of completion: issue (server), then PDF, share image, LinkedIn
 * and copyable credential details. The certificate is always the server's
 * record, so every ID here resolves at /verify/{id}.
 */
export function CertificatePanel({ state, pre, post, programmeId, onStateChange }: Props) {
  // Restore the last issued certificate on this device (persisted right after issue).
  // The report renders only on the client, so localStorage is available here.
  const [row, setRow] = useState<IssuedCertificateRow | null>(() =>
    typeof window === "undefined" ? null : readStoredRow(state.certificateId),
  );
  const [busy, setBusy] = useState<null | "issue" | "pdf" | "png">(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const minor = isMinorProfile(state.profile) || programmeId !== "adults";
  const cert: CertificateData | null = row
    ? fromIssuedRow(row, { pre: pre.result.constructScores, post: post.result.constructScores })
    : null;

  async function issue(): Promise<IssuedCertificateRow | null> {
    const r = await issueCertificate(
      programmeId,
      state.profile?.displayName || state.user?.fullName || undefined,
      state.orgCode,
    );
    if (r.kind === "ok") {
      const c = r.data.certificate as IssuedCertificateRow;
      storeRow(c);
      setRow(c);
      onStateChange(setCertificateMeta(c.id, c.issued_at));
      return c;
    }
    if (r.kind === "signed_out" || r.kind === "unavailable") {
      setNote("Sign in to get a verifiable certificate. Certificates are issued by the server from your recorded baseline and after-test.");
      return null;
    }
    const code = String(r.body.error || "");
    setNote(
      code === "payment_required"
        ? "Certificates are part of the full pathway (one-off payment for lifetime access, or a cohort seat)."
        : code === "not_eligible"
          ? "The server has no recorded baseline and after-test for you yet. Take both while signed in."
          : `Could not issue the certificate (${code || r.status}).`,
    );
    return null;
  }

  async function downloadPdf() {
    if (busy) return;
    setBusy(cert ? "pdf" : "issue");
    setNote(null);
    try {
      const c = cert ?? (await issue().then((r) => (r ? fromIssuedRow(r, { pre: pre.result.constructScores, post: post.result.constructScores }) : null)));
      if (!c) return;
      setBusy("pdf");
      const { downloadCompletionCertificate } = await import("@/lib/lms/certificate-pdf");
      await downloadCompletionCertificate(c);
      track("certificate_download", { certificateId: c.id });
    } catch {
      setNote("Could not create the PDF on this device. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadImage() {
    if (!cert || busy) return;
    setBusy("png");
    setNote(null);
    try {
      const { renderCertificateShareImage } = await import("@/lib/lms/certificate-image");
      const blob = await renderCertificateShareImage(cert);
      saveBlob(blob, `${certificateFileBase(cert.id)}.png`);
      track("certificate_share_image", { certificateId: cert.id });
    } catch {
      setNote("Could not create the image on this device. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 2000);
    } catch {
      setNote("Copy is blocked in this browser. Select the text and copy it instead.");
    }
  }

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl border border-ink bg-elevated print:hidden"
      aria-labelledby="cert-title"
      data-testid="certificate-panel"
    >
      <div className="h-1.5 w-full" aria-hidden style={{ background: "linear-gradient(90deg,#B32026 0 16.66%,#5D1F5E 16.66% 33.33%,#ED8F20 33.33% 50%,#367638 50% 66.66%,#16979A 66.66% 83.33%,#26408C 83.33%)" }} />
      <div className="p-4 sm:p-5">
        <p className="learn-eyebrow">Pathway complete</p>
        <h2 id="cert-title" className="mt-1 text-base font-semibold text-ink">
          Your Super-Cube® certificate of completion
        </h2>
        <p className="learn-meta mt-0.5">
          Issued by the server from your recorded baseline and after-test, with an ID and QR code anyone can verify.
        </p>

        {cert && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Preview: always on paper colours, like the printed certificate */}
            <div
              className="relative rounded-xl border border-[#d8d2c4] bg-[#fcfbf8] px-5 py-6 text-center text-[#141416] shadow-sm"
              aria-label="Certificate preview"
              role="group"
            >
              <Image src="/brand/logo.png" alt="Super-Cube®" width={160} height={34} className="mx-auto h-auto w-[140px]" />
              <p className="mt-4 text-[0.625rem] font-bold uppercase tracking-[0.28em] text-[#5c5a56]">Certificate of completion</p>
              <p className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-[1.75rem]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {cert.learnerName}
              </p>
              <p className="mt-2 text-sm">
                has completed the <strong>{programmeName(cert.programmeId)}</strong> programme
              </p>
              <p className="mt-3 text-xs text-[#5c5a56] tabular-nums">
                Overall {cert.preOverall} → {cert.postOverall} · Awarded {formatIssuedDate(cert.issuedAt)}
              </p>
              <p className="mt-3 text-sm italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{CERT_AUTHOR}</p>
              <p className="mt-2 font-mono text-[0.6875rem] font-semibold tracking-wide">{cert.id}</p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="learn-btn learn-btn-primary" onClick={() => void downloadPdf()} disabled={busy !== null}>
                  {busy === "pdf" ? "Preparing PDF…" : "Download PDF (A4)"}
                </button>
                <button type="button" className="learn-btn learn-btn-ghost" onClick={() => void downloadImage()} disabled={busy !== null}>
                  {busy === "png" ? "Preparing image…" : "Download share image"}
                </button>
                <a className="learn-btn learn-btn-ghost" href={verifyUrl(cert.id)} target="_blank" rel="noopener">
                  Open verify page
                </a>
              </div>

              {!minor && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="learn-btn learn-btn-ghost"
                    href={linkedInAddToProfileUrl(cert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("certificate_linkedin_add", { certificateId: cert.id })}
                  >
                    Add to LinkedIn profile
                  </a>
                  <a
                    className="learn-btn learn-btn-ghost"
                    href={linkedInShareUrl(cert.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("certificate_linkedin_share", { certificateId: cert.id })}
                  >
                    Share on LinkedIn
                  </a>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.8125rem] font-semibold text-ink">Credential details</p>
                  <button type="button" className="text-[0.8125rem] font-semibold text-ink underline underline-offset-2" onClick={() => void copy(credentialDetailsText(cert), "all")}>
                    {copied === "all" ? "Copied" : "Copy all"}
                  </button>
                </div>
                <dl className="mt-2 space-y-2 text-[0.8125rem]">
                  {credentialDetails(cert).map((d) => (
                    <div key={d.label} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <dt className="text-[0.75rem] text-muted">{d.label}</dt>
                        <dd className="font-medium text-ink [overflow-wrap:anywhere]">{d.value}</dd>
                      </div>
                      <button
                        type="button"
                        className="mt-3 shrink-0 text-[0.75rem] font-semibold text-muted underline underline-offset-2 hover:text-ink"
                        onClick={() => void copy(d.value, d.label)}
                        aria-label={`Copy ${d.label}`}
                      >
                        {copied === d.label ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </dl>
                {!minor && (
                  <p className="learn-meta mt-2">
                    LinkedIn opens with these filled in. If a field is empty, paste it from here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!cert && (
          <button type="button" className="learn-btn learn-btn-primary mt-3" disabled={busy !== null} onClick={() => void downloadPdf()}>
            {busy ? "Issuing your certificate…" : "Get my certificate"}
          </button>
        )}

        {note && (
          <p className="mt-2 text-[0.8125rem] font-medium text-amber-900 dark:text-amber-200" role="status">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
