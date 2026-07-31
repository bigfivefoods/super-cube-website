import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RADAR_ORDER } from "@/components/learn/RadarChart";
import type { ConstructScore } from "@/lib/lms/scoring";
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
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [100, 100, 100];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Draw pre (grey) / post (construct colours) radar onto the PDF canvas. */
function drawGrowthRadar(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  preScores: ConstructScore[],
  postScores?: ConstructScore[] | null
) {
  const n = RADAR_ORDER.length;
  const orderedPre = RADAR_ORDER.map(
    (id) =>
      preScores.find((s) => s.constructId === id) ?? {
        constructId: id,
        name: id,
        color: "#999999",
        rawMean: 0,
        score: 0,
        itemCount: 0,
      }
  );
  const orderedPost = postScores
    ? RADAR_ORDER.map(
        (id) =>
          postScores.find((s) => s.constructId === id) ?? {
            constructId: id,
            name: id,
            color: "#999999",
            rawMean: 0,
            score: 0,
            itemCount: 0,
          }
      )
    : null;

  const pt = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return {
      x: cx + rr * Math.cos(angle),
      y: cy + rr * Math.sin(angle),
    };
  };

  // Grid rings
  doc.setLineWidth(0.2);
  for (const g of [25, 50, 75, 100]) {
    const pts = Array.from({ length: n }, (_, i) => pt(i, g));
    doc.setDrawColor(220, 220, 220);
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      doc.line(a.x, a.y, b.x, b.y);
    }
  }

  // Axes + labels
  orderedPre.forEach((s, i) => {
    const rim = pt(i, 100);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.25);
    doc.line(cx, cy, rim.x, rim.y);
    const lab = pt(i, 118);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const rgb = hexToRgb(s.color);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(s.name, lab.x, lab.y, { align: "center", baseline: "middle" });
  });

  // Pre polygon — grey
  const prePts = orderedPre.map((s, i) => pt(i, s.score));
  doc.setDrawColor(140, 140, 140);
  doc.setLineWidth(0.7);
  for (let i = 0; i < n; i++) {
    const a = prePts[i];
    const b = prePts[(i + 1) % n];
    doc.line(a.x, a.y, b.x, b.y);
  }
  prePts.forEach((p) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(140, 140, 140);
    doc.circle(p.x, p.y, 1.1, "FD");
  });

  // Post polygon — construct colours
  if (orderedPost) {
    const postPts = orderedPost.map((s, i) => pt(i, s.score));
    for (let i = 0; i < n; i++) {
      const s = orderedPost[i];
      const a = postPts[i];
      const b = postPts[(i + 1) % n];
      const rgb = hexToRgb(s.color);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(0.9);
      doc.line(a.x, a.y, b.x, b.y);
    }
    orderedPost.forEach((s, i) => {
      const p = postPts[i];
      const rgb = hexToRgb(s.color);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(0.6);
      doc.circle(p.x, p.y, 1.4, "FD");
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.circle(p.x, p.y, 0.6, "F");
    });
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

  function drawFooter() {
    const pageH = doc.internal.pageSize.getHeight();
    const n = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text(
      "Super-Cube® · Developmental use only · Not a clinical diagnosis",
      margin,
      pageH - 10
    );
    doc.text(`Page ${n}`, pageW - margin, pageH - 10, { align: "right" });
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
  doc.text(
    post ? "Growth radar (pre grey · post coloured)" : "Baseline radar",
    margin,
    y
  );
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(
    post
      ? "Grey = pre-assessment · Coloured = post-assessment · Choices top · Principles bottom"
      : "Construct colours · Choices at top · Principles at bottom",
    margin,
    y
  );
  y += 6;
  const radarR = 28;
  const radarCx = pageW / 2;
  const radarCy = y + radarR + 4;
  drawGrowthRadar(
    doc,
    radarCx,
    radarCy,
    radarR,
    pre.result.constructScores,
    post?.result.constructScores
  );
  y = radarCy + radarR + 10;
  if (post) {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Pre (baseline)", pageW / 2 - 8, y, { align: "right" });
    doc.setTextColor(...ink);
    doc.text("  Post (after programme)", pageW / 2 - 6, y);
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
    drawFooter();
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
