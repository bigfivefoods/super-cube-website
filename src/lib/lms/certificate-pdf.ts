import { jsPDF } from "jspdf";
import { constructs } from "@/lib/content";
import {
  CERT_AUTHOR,
  CERT_AUTHOR_ROLE,
  certificateFileBase,
  formatIssuedDate,
  programmeName,
  qrMatrix,
  round1,
  signed,
  verifyDisplay,
  verifyUrl,
  type CertificateData,
} from "@/lib/lms/certificate";
import { drawPdfRadar, drawPdfRadarLegend, hexToRgb } from "@/lib/lms/pdf-radar";

/**
 * jsPDF's built-in fonts only cover WinAnsi. Characters outside it (e.g. the
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

/** Raster logo for the header (PNG bytes plus pixel size). Optional: a vector mark is drawn without it. */
export type CertificateLogo = { data: Uint8Array; width: number; height: number };

export type CertificatePdfInput = CertificateData & { logo?: CertificateLogo | null };

const INK: [number, number, number] = [20, 20, 22];
const MUTED: [number, number, number] = [92, 90, 86];
const HAIR: [number, number, number] = [201, 195, 181];
const PAPER: [number, number, number] = [252, 251, 248];

/** The cube mark: six triangles in the logo's face layout, drawn as vectors. */
function drawCubeMark(doc: jsPDF, cx: number, cy: number, r: number) {
  // Logo order clockwise from top-left: Choices, Spiritual, Physical, Principles, Emotional, Mental
  const order = ["choices", "spiritual", "physical", "principles", "emotional", "mental"];
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  order.forEach((id, i) => {
    // Triangle i spans from vertex (i+5)%6 to vertex i, so Choices sits top-left
    const a = pts[(i + 5) % 6];
    const b = pts[i];
    const hex = constructs.find((c) => c.id === id)?.color ?? "#333333";
    doc.setFillColor(...hexToRgb(hex));
    doc.triangle(cx, cy, a.x, a.y, b.x, b.y, "F");
  });
}

function drawQr(doc: jsPDF, text: string, x: number, y: number, size: number) {
  const m = qrMatrix(text);
  const n = m.length;
  const cell = size / n;
  doc.setFillColor(255, 255, 255);
  doc.rect(x - cell * 2, y - cell * 2, size + cell * 4, size + cell * 4, "F");
  doc.setFillColor(...INK);
  for (let r = 0; r < n; r++) {
    // Merge horizontal runs into one rect: smaller file, no hairline seams when printed
    let c = 0;
    while (c < n) {
      if (!m[r][c]) {
        c++;
        continue;
      }
      let e = c;
      while (e + 1 < n && m[r][e + 1]) e++;
      doc.rect(x + c * cell, y + r * cell, (e - c + 1) * cell + 0.02, cell + 0.02, "F");
      c = e + 1;
    }
  }
}

function spaced(doc: jsPDF, text: string, x: number, y: number, charSpace: number) {
  // Centre letter-spaced text: jsPDF's align ignores charSpace, so measure it ourselves
  const w = doc.getTextWidth(text) + charSpace * (text.length - 1);
  doc.text(text, x - w / 2, y, { charSpace });
}

/**
 * A4 landscape certificate of completion, fully vector apart from the optional
 * logo bitmap. Only built from a server-issued certificate, so the ID and QR
 * resolve at /verify/{id}.
 */
export function buildCertificatePdf(cert: CertificatePdfInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape", compress: true });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const cx = w / 2;
  const name = pdfSafe(cert.learnerName?.trim() || "Super-Cube® Learner");
  const programme = pdfSafe(programmeName(cert.programmeId));
  const growth = round1(Number(cert.growth));
  const date = formatIssuedDate(cert.issuedAt);
  const url = verifyUrl(cert.id, cert.siteOrigin);

  doc.setProperties({
    title: `${programme} certificate · ${name}`,
    subject: "Super-Cube® certificate of completion",
    author: CERT_AUTHOR,
    creator: "Super-Cube®",
    keywords: `Super-Cube®, certificate, ${cert.id}`,
  });

  // Paper and frames
  doc.setFillColor(...PAPER);
  doc.rect(0, 0, w, h, "F");
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.7);
  doc.rect(9, 9, w - 18, h - 18);
  doc.setDrawColor(...HAIR);
  doc.setLineWidth(0.25);
  doc.rect(12.5, 12.5, w - 25, h - 25);

  // Face-colour corner accents on the inner frame
  const faceColors = constructs.map((c) => hexToRgb(c.color));
  const tick = 11;
  const corners: [number, number, number, number][] = [
    [12.5, 12.5, 1, 1],
    [w - 12.5, 12.5, -1, 1],
    [12.5, h - 12.5, 1, -1],
    [w - 12.5, h - 12.5, -1, -1],
  ];
  corners.forEach(([x, y, dx, dy], i) => {
    doc.setDrawColor(...faceColors[i % faceColors.length]);
    doc.setLineWidth(0.9);
    doc.line(x, y, x + dx * tick, y);
    doc.setDrawColor(...faceColors[(i + 3) % faceColors.length]);
    doc.line(x, y, x, y + dy * tick);
  });

  // Logo
  const logoW = 64;
  if (cert.logo) {
    const lh = (logoW * cert.logo.height) / cert.logo.width;
    doc.addImage(cert.logo.data, "PNG", cx - logoW / 2, 20, logoW, lh, "sc-logo", "SLOW");
  } else {
    drawCubeMark(doc, cx, 27, 7.5);
  }

  // Six-colour rule
  const ruleW = 66;
  const seg = ruleW / faceColors.length;
  faceColors.forEach((c, i) => {
    doc.setFillColor(...c);
    doc.rect(cx - ruleW / 2 + i * seg, 42, seg + 0.05, 1.1, "F");
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  spaced(doc, "CERTIFICATE OF COMPLETION", cx, 53, 1.4);

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...MUTED);
  doc.text("This certifies that", cx, 64, { align: "center" });

  // Learner name: large serif, shrunk to fit long names
  doc.setFont("times", "bold");
  doc.setTextColor(...INK);
  let nameSize = 36;
  doc.setFontSize(nameSize);
  while (doc.getTextWidth(name) > 210 && nameSize > 20) {
    nameSize -= 1;
    doc.setFontSize(nameSize);
  }
  doc.text(name, cx, 80, { align: "center" });
  doc.setDrawColor(...HAIR);
  doc.setLineWidth(0.3);
  doc.line(cx - 80, 85, cx + 80, 85);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  const lead = "has completed the ";
  const tail = " programme";
  doc.setFont("helvetica", "normal");
  const wLead = doc.getTextWidth(lead);
  const wTail = doc.getTextWidth(tail);
  doc.setFont("helvetica", "bold");
  const wProg = doc.getTextWidth(programme);
  let x = cx - (wLead + wProg + wTail) / 2;
  doc.setFont("helvetica", "normal");
  doc.text(lead, x, 95);
  x += wLead;
  doc.setFont("helvetica", "bold");
  doc.text(programme, x, 95);
  x += wProg;
  doc.setFont("helvetica", "normal");
  doc.text(tail, x, 95);

  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const body = doc.splitTextToSize(
    "A locked six-face baseline, guided practice across Choices, Principles, Mental, Emotional, Physical and Spiritual leadership, and a re-measure after at least 21 days of practice.",
    190,
  );
  doc.text(body, cx, 102, { align: "center", lineHeightFactor: 1.35 });

  // —— Lower band: radar (left) · scores + signature (centre) · QR (right) ——
  const top = 120;
  doc.setDrawColor(...HAIR);
  doc.setLineWidth(0.2);
  doc.line(28, top - 3, w - 28, top - 3);

  const hasFaces = Boolean(cert.preFaces?.length && cert.postFaces?.length);
  const leftCx = 66;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  spaced(doc, hasFaces ? "SIX-FACE GROWTH" : "THE SIX FACES", leftCx, top + 4, 0.8);
  if (hasFaces) {
    drawPdfRadar(doc, leftCx, top + 31, 19, cert.preFaces!, cert.postFaces!, {
      numbers: false,
      labelSize: 6.2,
      ringLabels: false,
    });
    drawPdfRadarLegend(doc, leftCx - 24, top + 60, 6.2, ["Before", "After"]);
  } else {
    drawCubeMark(doc, leftCx, top + 31, 17);
  }

  // Scores
  const scoreY = top + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  spaced(doc, "OVERALL SCORE", cx, scoreY, 0.8);
  const cols: [string, string][] = [
    ["Before", String(round1(Number(cert.preOverall)))],
    ["After", String(round1(Number(cert.postOverall)))],
    ["Growth", signed(growth)],
  ];
  cols.forEach(([label, value], i) => {
    const colX = cx + (i - 1) * 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(...INK);
    doc.text(value, colX, scoreY + 13, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label, colX, scoreY + 19, { align: "center" });
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Self-rated, on a 0-100 scale across the six faces", cx, scoreY + 26, { align: "center" });

  // Signature block
  const sigY = top + 50;
  doc.setFont("times", "italic");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(CERT_AUTHOR, cx, sigY, { align: "center" });
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.3);
  doc.line(cx - 36, sigY + 3, cx + 36, sigY + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(pdfSafe(CERT_AUTHOR_ROLE), cx, sigY + 8, { align: "center" });
  doc.text(`Awarded ${date}`, cx, sigY + 13, { align: "center" });

  // QR and verification
  const qrSize = 30;
  const qrCx = w - 66;
  drawQr(doc, url, qrCx - qrSize / 2, top + 9, qrSize);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  spaced(doc, "SCAN TO VERIFY", qrCx, top + 4, 0.8);
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(cert.id, qrCx, top + 46, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.textWithLink(verifyDisplay(cert.id, cert.siteOrigin), qrCx - doc.getTextWidth(verifyDisplay(cert.id, cert.siteOrigin)) / 2, top + 51, { url });
  doc.link(qrCx - qrSize / 2, top + 9, qrSize, qrSize, { url });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(130, 127, 120);
  doc.text(
    "Developmental achievement within the Super-Cube® Leadership Model · Not a clinical credential",
    cx,
    h - 17,
    { align: "center" },
  );

  return doc;
}

/** Fetch the brand logo in the browser (null if it cannot be loaded; the vector mark is used instead). */
export async function loadCertificateLogo(src = "/brand/logo.png"): Promise<CertificateLogo | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const data = new Uint8Array(await res.arrayBuffer());
    // PNG IHDR: width and height are big-endian at bytes 16–23
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return { data, width: dv.getUint32(16), height: dv.getUint32(20) };
  } catch {
    return null;
  }
}

/** Build and save the certificate PDF. Returns the file name. */
export async function downloadCompletionCertificate(cert: CertificatePdfInput): Promise<string> {
  const logo = cert.logo === undefined ? await loadCertificateLogo() : cert.logo;
  const doc = buildCertificatePdf({ ...cert, logo });
  const filename = `${certificateFileBase(cert.id)}.pdf`;
  doc.save(filename);
  return filename;
}
