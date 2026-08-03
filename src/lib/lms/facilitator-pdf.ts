/**
 * Client-side facilitator one-pager PDF for schools/companies.
 */
import { jsPDF } from "jspdf";
import { cohortCalendar } from "@/lib/facilitator";
import { constructs } from "@/lib/content";

export function downloadFacilitatorOnePager(opts?: {
  orgName?: string;
  orgCode?: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const org = opts?.orgName || "Your organisation";
  const code = opts?.orgCode || "COHORT-CODE";
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Super-Cube® Facilitator one-pager", 14, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`${org} · Code: ${code}`, 14, y);
  y += 6;
  doc.text(
    "8-week pattern · consented scores only · journals stay private",
    14,
    y
  );
  y += 10;
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Six faces", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  constructs.forEach((c) => {
    doc.text(`· ${c.name} — ${c.tagline}`, 16, y);
    y += 5;
  });
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Calendar (summary)", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  cohortCalendar.forEach((w) => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
    doc.text(`Week ${w.week}: ${w.title} — ${w.focus}`, 16, y);
    y += 5;
  });
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Safeguarding & consent", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  [
    "No public ranking of scores.",
    "Coach share is opt-in; journals never export.",
    "Follow school/company safeguarding policy.",
    "Verify certificates at /verify/[id].",
  ].forEach((line) => {
    doc.text(`· ${line}`, 16, y);
    y += 5;
  });
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("www.super-cube.me/facilitator · www.super-cube.me/learn/coach", 14, y);

  doc.save(
    `super-cube-facilitator-${(opts?.orgCode || "cohort").toLowerCase()}.pdf`
  );
}
