import { jsPDF } from "jspdf";
import { getProgramme } from "@/lib/programmes";
import { constructs } from "@/lib/content";
import { changeBand } from "@/lib/lms/scoring";

/**
 * jsPDF's built-in Helvetica only covers WinAnsi. Characters outside it (e.g. the
 * arrow "→") were printed as garbage ("!'"), so map them to plain text first.
 */
export function pdfSafe(text: string): string {
  return text
    .replace(/\s*[→⇒➜]\s*/g, " to ")
    .replace(/\s*←\s*/g, " from ")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/Δ/g, "change ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\xFF\u2013\u2014\u2022\u2026\u20AC\u2122]/g, "");
}

export type CertificatePdfInput = {
  /** Server-issued certificate (from /api/certificates/issue) */
  id: string;
  learnerName: string;
  programmeId: string;
  preOverall: number;
  postOverall: number;
  growth: number;
  issuedAt: string;
  /** Origin used for the verify link (defaults to the current site) */
  siteOrigin?: string;
};

/**
 * Landscape certificate of completion. Only called with a server-issued
 * certificate, so the ID printed on it can be verified at /verify/{id}.
 */
export function downloadCompletionCertificate(cert: CertificatePdfInput): string {
  const certificateId = cert.id;
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const programmeId = cert.programmeId;
  const programme = getProgramme(programmeId);
  const name = cert.learnerName?.trim() || "Super-Cube® Learner";
  const growth = Math.round(Number(cert.growth) * 10) / 10;
  const band = changeBand(growth, "overall");
  const date = new Date(cert.issuedAt).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Johannesburg",
  });
  const origin = (
    cert.siteOrigin ||
    (typeof window !== "undefined" ? window.location.origin : "https://www.super-cube.me")
  ).replace(/\/$/, "");
  const verifyHost = origin.replace(/^https?:\/\//, "");

  // Border
  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, w - 16, h - 16);
  doc.setLineWidth(0.3);
  doc.rect(11, 11, w - 22, h - 22);

  // Rainbow accent line (construct colours)
  const colors = constructs.map((c) => c.color);
  const bandY = 18;
  const bandH = 3;
  const bandW = (w - 40) / colors.length;
  colors.forEach((hex, i) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
    doc.rect(20 + i * bandW, bandY, bandW + 0.2, bandH, "F");
  });

  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("SUPER-CUBE® LEADERSHIP DEVELOPMENT", w / 2, 32, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Certificate of Completion", w / 2, 48, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text("This certifies that", w / 2, 62, { align: "center" });

  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(pdfSafe(name), w / 2, 74, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const body = doc.splitTextToSize(
    pdfSafe(
      `has completed the ${programme?.name ?? "Super-Cube®"} pathway: a locked six-face baseline, practice sessions across Choices, Principles, Mental, Emotional, Physical and Spiritual leadership, and a re-measure after the minimum practice period.`,
    ),
    w - 50
  );
  doc.text(body, w / 2, 86, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(10, 10, 10);
  doc.text(
    pdfSafe(
      `Overall score: ${cert.preOverall} → ${cert.postOverall}  (${growth > 0 ? "+" : ""}${growth} pts${band ? `, ${band.label.toLowerCase()}` : ""})`,
    ),
    w / 2,
    108,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Awarded ${date}`, w / 2, 118, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(10, 10, 10);
  doc.text(`Certificate ID: ${certificateId}`, w / 2, 128, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Verify at ${verifyHost}/verify/${certificateId}`,
    w / 2,
    135,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.text(
    "Developmental achievement within the Super-Cube® Leadership Model · Not a clinical credential",
    w / 2,
    h - 22,
    { align: "center" }
  );

  const filename = `super-cube-certificate-${certificateId}.pdf`;
  doc.save(filename);
  return filename;
}
