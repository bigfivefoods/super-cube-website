import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MIN_GROUP, type FaceImpact, type PairedResult, type funnel } from "@/lib/lms/cohort-stats";

/**
 * Cohort ROI pack (PDF) for sponsors: aggregate only, no learner names.
 * Per-face before/after with 95% CIs and Cohen's d, the completion funnel and the method.
 */
export interface RoiPackInput {
  cohortName: string;
  cohortCode: string;
  generatedAt: string;
  learners: number;
  faces: FaceImpact[];
  overall: PairedResult | null;
  funnel: ReturnType<typeof funnel>;
  atRiskCount: number;
}

const ink: [number, number, number] = [17, 17, 17];
const slate: [number, number, number] = [80, 80, 80];
const line: [number, number, number] = [220, 220, 220];

const f1 = (v: number) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : "—");
const sign = (v: number) => (v > 0 ? `+${f1(v)}` : f1(v));

function row(name: string, r: PairedResult | null): string[] {
  if (!r) return [name, `< ${MIN_GROUP}`, "—", "—", "—", "—"];
  return [
    name,
    String(r.n),
    `${f1(r.before.mean)} (${f1(r.before.low)}–${f1(r.before.high)})`,
    `${f1(r.after.mean)} (${f1(r.after.low)}–${f1(r.after.high)})`,
    `${sign(r.change.mean)} (${sign(r.change.low)} to ${sign(r.change.high)})`,
    r.d == null ? "—" : `${r.d.toFixed(2)} · ${r.label}`,
  ];
}

export function buildRoiPackPdf(input: RoiPackInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ink);
  doc.text("Super-Cube cohort impact", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...slate);
  doc.text(`${input.cohortName} · code ${input.cohortCode} · ${input.learners} learners · generated ${input.generatedAt} (SAST)`, margin, y);
  y += 10;

  // Headline
  const o = input.overall;
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const headline = o
    ? `Overall: ${sign(o.change.mean)} points (95% CI ${sign(o.change.low)} to ${sign(o.change.high)}), Cohen's d ${o.d?.toFixed(2) ?? "—"} (${o.label ?? "n/a"}), n = ${o.n}`
    : `Overall change appears once at least ${MIN_GROUP} learners have a baseline and a re-measure.`;
  const lines = doc.splitTextToSize(headline, width);
  doc.text(lines, margin, y);
  y += lines.length * 5.5 + 4;

  autoTable(doc, {
    startY: y,
    head: [["Face", "n", "Before (95% CI)", "After (95% CI)", "Change (95% CI)", "Cohen's d"]],
    body: [...input.faces.map((f) => row(f.name, f.result)), row("Overall", input.overall)],
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: ink, lineColor: line, lineWidth: 0.2 },
    headStyles: { fillColor: ink, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === input.faces.length) data.cell.styles.fontStyle = "bold";
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Completion funnel", margin, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Step", "Learners", "% of joined"]],
    body: input.funnel.map((s) => [s.label, String(s.count), `${s.pct}%`]),
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: ink, lineColor: line, lineWidth: 0.2 },
    headStyles: { fillColor: ink, textColor: [255, 255, 255], fontStyle: "bold" },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...ink);
  doc.text(`${input.atRiskCount} learner${input.atRiskCount === 1 ? "" : "s"} currently flagged for a supportive check-in (names stay in the coach dashboard).`, margin, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Method", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slate);
  const method = [
    "Scores are self-report on a 0–100 scale across the six Super-Cube faces. Only learners who consented to share progress with their coach are included, and journals are never used.",
    "Before/after is paired: a learner counts only with both a baseline and a re-measure (at least 21 days apart, after the required sessions). 95% confidence intervals use Student's t.",
    `Cohen's d is d_av: the mean change divided by the average of the before and after standard deviations (0.2 small, 0.5 medium, 0.8 large). Groups smaller than ${MIN_GROUP} are suppressed to protect privacy.`,
    "There is no control group, so changes show association, not proof of cause. The instrument's reliability for this version is still being established; treat small changes with care.",
  ];
  for (const p of method) {
    const l = doc.splitTextToSize(p, width);
    doc.text(l, margin, y);
    y += l.length * 4 + 2;
  }
  return doc;
}

export function downloadRoiPackPdf(input: RoiPackInput) {
  const safe = input.cohortCode.replace(/[^A-Za-z0-9-]/g, "") || "cohort";
  buildRoiPackPdf(input).save(`super-cube-roi-${safe}.pdf`);
}
