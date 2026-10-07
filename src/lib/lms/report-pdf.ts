import { jsPDF } from "jspdf";
import { formatDateZA } from "@/lib/datetime";
import autoTable from "jspdf-autotable";
import { drawPdfRadar, drawPdfRadarLegend } from "@/lib/lms/pdf-radar";
import { depthLabel } from "@/lib/lms/orientation";
import type { LocalLmsState, LocalAttempt } from "@/lib/lms/store";
import {
  compareAttempts,
  recommendations,
} from "@/lib/lms/scoring";
import { getProgramme } from "@/lib/programmes";

export type ReportPdfInput = {
  state: LocalLmsState;
  pre: LocalAttempt;
  post?: LocalAttempt | null;
};

function stripMd(s: string) {
  return s.replace(/\*\*(.*?)\*\*/g, "$1");
}

function fmtDate(iso: string) {
  try {
    return formatDateZA(iso, iso);
  } catch {
    return iso;
  }
}

/**
 * Build a shareable Super-Cube® personal development PDF (pre / post / growth).
 */
export function buildGrowthReportPdf({
  state,
  pre,
  post,
}: ReportPdfInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  const programmeId =
    pre.programmeId ||
    state.subscription?.programmeId ||
    state.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const learner =
    state.user?.fullName?.trim() ||
    state.user?.email?.trim() ||
    "Super-Cube® learner";
  const comparison = compareAttempts(pre.result, post?.result);
  const recs = recommendations(post?.result ?? pre.result);
  const orientation = state.orientation;

  const growth =
    post != null
      ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
      : null;

  const ink: [number, number, number] = [10, 10, 10];
  const slate: [number, number, number] = [92, 92, 92];
  const line: [number, number, number] = [220, 220, 220];

  function ensureSpace(need: number) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + need > pageH - 18) {
      doc.addPage();
      y = margin;
    }
  }

  function drawFooter(n: number, total: number) {
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text(
      "Super-Cube® · Developmental use only · Not a clinical diagnosis",
      margin,
      pageH - 10
    );
    doc.text(`Page ${n} of ${total}`, pageW - margin, pageH - 10, { align: "right" });
  }

  // —— Header band ——
  doc.setFillColor(...ink);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Super-Cube® Personal Development Report", margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    post
      ? "Pre- and post-programme growth profile"
      : "Baseline developmental profile",
    margin,
    22
  );
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated ${fmtDate(new Date().toISOString())}`, margin, 30);
  y = 46;

  // —— Learner / programme ——
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(learner, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(
    [
      programme?.name ?? "Super-Cube® programme",
      programme?.ageLabel,
      state.user?.email && state.user.email !== learner
        ? state.user.email
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    margin,
    y
  );
  y += 10;

  // —— Overall scores ——
  ensureSpace(28);
  doc.setDrawColor(...line);
  doc.setFillColor(248, 249, 251);
  doc.roundedRect(margin, y, contentW, 24, 2, 2, "FD");

  const colW = contentW / (post ? 3 : 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text("PRE (BASELINE)", margin + 6, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ink);
  doc.text(String(pre.result.overall), margin + 6, y + 18);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text(fmtDate(pre.completedAt), margin + 6 + 22, y + 17);

  if (post) {
    doc.text("POST (AFTER PROGRAMME)", margin + colW + 6, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...ink);
    doc.text(String(post.result.overall), margin + colW + 6, y + 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text(fmtDate(post.completedAt), margin + colW + 6 + 22, y + 17);

    doc.text("OVERALL GROWTH", margin + colW * 2 + 6, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...ink);
    const gLabel =
      growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}`;
    doc.text(gLabel, margin + colW * 2 + 6, y + 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text("points", margin + colW * 2 + 6 + 22, y + 17);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text(
      "Post-assessment not completed yet. Take it after all courses for full growth.",
      margin + colW + 6,
      y + 12,
      { maxWidth: colW - 10 }
    );
  }
  y += 32;

  // —— Growth radar ——
  ensureSpace(78);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(post ? "Your growth across the six faces" : "Your six-face profile", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(
    post
      ? "Before = dashed outline, hollow markers. After = filled shape, solid markers. Numbers show before -> after."
      : "Your baseline score on each face (0-100).",
    margin,
    y
  );
  y += 6;
  const radarR = 33;
  const radarCx = pageW / 2;
  const radarCy = y + radarR + 8;
  drawPdfRadar(doc, radarCx, radarCy, radarR, pre.result.constructScores, post?.result.constructScores, { labelSize: 8 });
  y = radarCy + radarR + 17;
  if (post) {
    drawPdfRadarLegend(doc, pageW / 2 - 52, y);
    y += 8;
  }

  // —— Orientation ——
  if (orientation) {
    ensureSpace(36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text("Leadership knowledge frame", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    const oLines = doc.splitTextToSize(
      `${orientation.result.label}. ${orientation.result.summary}`,
      contentW
    );
    doc.text(oLines, margin, y);
    y += oLines.length * 4.2 + 2;
    doc.text(
      `Philosophy: ${depthLabel(orientation.result.depth.philosophy)} · Theory: ${depthLabel(orientation.result.depth.theory)} · Model: ${depthLabel(orientation.result.depth.model)}`,
      margin,
      y
    );
    y += 8;
  }

  // —— Construct table ——
  ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(
    post
      ? "Scores by construct — pre, post, and growth"
      : "Construct scores — baseline",
    margin,
    y
  );
  y += 4;

  const head = post
    ? [["Construct", "Pre", "Post", "Growth"]]
    : [["Construct", "Pre score", "Level"]];

  const body = comparison.map((row) => {
    if (post) {
      return [
        row.name,
        String(row.pre),
        row.post === null ? "—" : String(row.post),
        row.delta === null
          ? "—"
          : `${row.delta > 0 ? "+" : ""}${row.delta}`,
      ];
    }
    const level =
      row.pre >= 75 ? "Strong" : row.pre >= 50 ? "Developing" : "Priority";
    return [row.name, String(row.pre), level];
  });

  if (post) {
    body.push([
      "Overall",
      String(pre.result.overall),
      String(post.result.overall),
      growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}`,
    ]);
  } else {
    body.push(["Overall", String(pre.result.overall), "—"]);
  }

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      textColor: ink,
      lineColor: line,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: ink,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
    columnStyles: post
      ? {
          0: { cellWidth: contentW * 0.4 },
          1: { cellWidth: contentW * 0.2, halign: "right" },
          2: { cellWidth: contentW * 0.2, halign: "right" },
          3: { cellWidth: contentW * 0.2, halign: "right", fontStyle: "bold" },
        }
      : {
          0: { cellWidth: contentW * 0.45 },
          1: { cellWidth: contentW * 0.25, halign: "right" },
          2: { cellWidth: contentW * 0.3 },
        },
  });

  const tablePlugin = doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  };
  y = (tablePlugin.lastAutoTable?.finalY ?? y) + 10;

  // —— Recommendations ——
  ensureSpace(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text(
    post ? "Recommendations after growth" : "Recommendations from baseline",
    margin,
    y
  );
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);

  recs.forEach((r, i) => {
    const text = `${i + 1}. ${stripMd(r)}`;
    const lines = doc.splitTextToSize(text, contentW);
    ensureSpace(lines.length * 4.2 + 3);
    doc.text(lines, margin, y);
    y += lines.length * 4.2 + 3;
  });

  // —— Disclaimer ——
  y += 4;
  ensureSpace(22);
  doc.setDrawColor(...line);
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  const disc = doc.splitTextToSize(
    "This report is for developmental use within the Super-Cube® Leadership Model. Scores reflect self-report on this instrument only and are not a clinical, medical, or psychometric diagnosis. Share at your discretion.",
    contentW
  );
  doc.text(disc, margin, y);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }

  return doc;
}

export function downloadGrowthReportPdf(input: ReportPdfInput) {
  const doc = buildGrowthReportPdf(input);
  const programmeId =
    input.pre.programmeId ||
    input.state.subscription?.programmeId ||
    input.state.user?.programmeId ||
    "programme";
  const kind = input.post ? "growth" : "baseline";
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `super-cube-${kind}-report-${programmeId}-${stamp}.pdf`;
  doc.save(filename);
  return filename;
}
