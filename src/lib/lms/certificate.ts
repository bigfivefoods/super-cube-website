/**
 * Shared certificate helpers (pure, no DOM): verify URL, QR matrix, LinkedIn
 * links and the copyable credential details. Used by the PDF, the share image
 * and the Certificate panel so every surface prints the same facts.
 */
import qrcode from "qrcode-generator";
import { getProgramme } from "@/lib/programmes";
import type { ConstructScore } from "@/lib/lms/scoring";

export const CERT_ISSUER = "Super-Cube®";
export const CERT_AUTHOR = "Dr Craig R. Muller";
export const CERT_AUTHOR_ROLE = "Author, Super-Cube® Leadership Model";
export const DEFAULT_ORIGIN = "https://www.super-cube.me";

/** The row returned by POST /api/certificates/issue */
export type IssuedCertificateRow = {
  id: string;
  learner_name: string;
  programme_id: string | null;
  pre_overall: number | string | null;
  post_overall: number | string | null;
  growth: number | string | null;
  issued_at: string;
};

export type CertificateData = {
  id: string;
  learnerName: string;
  programmeId: string;
  preOverall: number;
  postOverall: number;
  growth: number;
  issuedAt: string;
  /** Optional per-face before/after for the mini radar (from the learner's attempts) */
  preFaces?: ConstructScore[];
  postFaces?: ConstructScore[];
  /** Origin used for the verify link and QR (defaults to the current site) */
  siteOrigin?: string;
};

export function fromIssuedRow(
  row: IssuedCertificateRow,
  faces?: { pre?: ConstructScore[]; post?: ConstructScore[] },
): CertificateData {
  return {
    id: row.id,
    learnerName: row.learner_name,
    programmeId: row.programme_id || "adults",
    preOverall: Number(row.pre_overall ?? 0),
    postOverall: Number(row.post_overall ?? 0),
    growth: Number(row.growth ?? 0),
    issuedAt: row.issued_at,
    preFaces: faces?.pre,
    postFaces: faces?.post,
  };
}

export function siteOrigin(explicit?: string): string {
  const o = explicit || (typeof window !== "undefined" ? window.location.origin : DEFAULT_ORIGIN);
  return o.replace(/\/$/, "");
}

export function verifyUrl(id: string, origin?: string): string {
  return `${siteOrigin(origin)}/verify/${encodeURIComponent(id)}`;
}

/** Host + path without the scheme, for print ("www.super-cube.me/verify/SC-…") */
export function verifyDisplay(id: string, origin?: string): string {
  return verifyUrl(id, origin).replace(/^https?:\/\//, "");
}

export function programmeName(programmeId: string): string {
  return getProgramme(programmeId)?.name ?? "Super-Cube® Leadership Programme";
}

/** Credential title used on LinkedIn and in the copyable details */
export function credentialName(programmeId: string): string {
  return `${programmeName(programmeId)} · Six-Face Leadership Certificate`;
}

export function formatIssuedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}

/** Year and month (1–12) of issue in SAST, for LinkedIn */
export function issuedYearMonth(iso: string): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "numeric",
    timeZone: "Africa/Johannesburg",
  }).formatToParts(new Date(iso));
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return { year, month };
}

/**
 * LinkedIn "Add licence or certification" deep link. organizationName is used
 * because Super-Cube® has no LinkedIn organisation ID configured yet.
 */
export function linkedInAddToProfileUrl(c: Pick<CertificateData, "id" | "programmeId" | "issuedAt" | "siteOrigin">): string {
  const { year, month } = issuedYearMonth(c.issuedAt);
  const q = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: credentialName(c.programmeId),
    organizationName: CERT_ISSUER,
    issueYear: String(year),
    issueMonth: String(month),
    certUrl: verifyUrl(c.id, c.siteOrigin),
    certId: c.id,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

export function linkedInShareUrl(id: string, origin?: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl(id, origin))}`;
}

/** Plain-text details a learner can paste into LinkedIn or a CV */
export function credentialDetails(c: CertificateData): { label: string; value: string }[] {
  return [
    { label: "Name", value: credentialName(c.programmeId) },
    { label: "Issuing organisation", value: CERT_ISSUER },
    { label: "Issue date", value: formatIssuedDate(c.issuedAt) },
    { label: "Credential ID", value: c.id },
    { label: "Credential URL", value: verifyUrl(c.id, c.siteOrigin) },
  ];
}

export function credentialDetailsText(c: CertificateData): string {
  return credentialDetails(c)
    .map((d) => `${d.label}: ${d.value}`)
    .join("\n");
}

/** QR modules for the verify URL (true = dark). Error correction M survives print wear. */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, col) => qr.isDark(r, col)));
}

export const round1 = (n: number) => Math.round(n * 10) / 10;
export function signed(n: number): string {
  const v = round1(n);
  return v > 0 ? `+${v}` : v < 0 ? `-${Math.abs(v)}` : "0";
}

export function certificateFileBase(id: string): string {
  return `super-cube-certificate-${id}`;
}
