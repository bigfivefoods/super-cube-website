import { jsPDF } from "jspdf";
import type { LocalLmsState, LocalAttempt } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";
import { constructs } from "@/lib/content";

/**
 * Landscape certificate of completion after full pathway + post-assessment.
 */
export function downloadCompletionCertificate(opts: {
  state: LocalLmsState;
  pre: LocalAttempt;
  post: LocalAttempt;
}): string {
  const { state, pre, post } = opts;
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const programmeId =
    post.programmeId ||
    state.subscription?.programmeId ||
    state.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const name =
    state.user?.fullName?.trim() ||
    state.user?.email?.trim() ||
    "Super-Cube® Learner";
  const growth =
    Math.round((post.result.overall - pre.result.overall) * 10) / 10;
  const date = new Date(post.completedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
  doc.text(name, w / 2, 74, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const body = doc.splitTextToSize(
    `has completed the ${programme?.name ?? "Super-Cube®"} pathway—including orientation, six-face baseline and post assessments, and deliberate practice across Choices, Principles, Mental, Emotional, Physical, and Spiritual leadership.`,
    w - 50
  );
  doc.text(body, w / 2, 86, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(10, 10, 10);
  doc.text(
    `Overall growth: ${pre.result.overall} → ${post.result.overall}  (${growth > 0 ? "+" : ""}${growth} pts)`,
    w / 2,
    108,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Awarded ${date}`, w / 2, 120, { align: "center" });

  doc.setFontSize(9);
  doc.text(
    "Developmental achievement within the Super-Cube® Leadership Model · Not a clinical credential",
    w / 2,
    h - 22,
    { align: "center" }
  );

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `super-cube-certificate-${programmeId ?? "learn"}-${stamp}.pdf`;
  doc.save(filename);
  return filename;
}
