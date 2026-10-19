/**
 * Public certificate check (pure helpers shared by /verify and its tests).
 * The page shows only what is printed on the certificate itself: holder name,
 * programme, issue date, status and issuer. Never scores, cohort or contact details.
 */

/** Super-Cube® certificate IDs: SC-YYYYMMDD-<6–12 hex> */
export const CERT_ID_RE = /^SC-\d{8}-[0-9A-F]{6,12}$/;

/** Issuer shown on the public check (Super-Cube® is a Big Five Group programme). */
export const VERIFY_ISSUER = "Big Five Group";

/** Trim, upper-case and drop spaces so a pasted or hand-typed ID still matches. */
export function normaliseCertId(raw: unknown): string {
  let s = String(raw ?? "");
  try {
    s = decodeURIComponent(s);
  } catch {
    // keep the raw value; it will fail the format check
  }
  return s.replace(/\s+/g, "").trim().toUpperCase().slice(0, 40);
}

export function isCertId(id: string): boolean {
  return CERT_ID_RE.test(id);
}

export type PublicCertificate = {
  id: string;
  holderName: string;
  programmeId: string;
  issuedAt: string;
  revoked: boolean;
  revokedAt: string | null;
};

export type LookupResult =
  | { status: "found"; certificate: PublicCertificate }
  | { status: "revoked"; certificate: PublicCertificate }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "unavailable" };

/** Map a registry row (service role or the verify_certificate RPC) to the public shape. */
export function toPublicCertificate(row: {
  id: string;
  learner_name: string;
  programme_id: string | null;
  issued_at: string;
  revoked?: boolean | null;
  revoked_at?: string | null;
}): PublicCertificate {
  return {
    id: row.id,
    holderName: row.learner_name,
    programmeId: row.programme_id || "adults",
    issuedAt: row.issued_at,
    revoked: Boolean(row.revoked),
    revokedAt: row.revoked_at ?? null,
  };
}
