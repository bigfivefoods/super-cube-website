/**
 * Six-face radar for jsPDF documents (growth report and certificate).
 * Vector output, so it stays crisp at any zoom and in print. Mirrors the
 * on-screen RadarChart: BEFORE is a dashed neutral outline with hollow
 * markers, AFTER is filled in face colours with solid markers. Meaning never
 * depends on colour alone (line style, marker shape and the labelled numbers).
 */
import type { jsPDF } from "jspdf";
import { RADAR_ORDER } from "@/components/learn/RadarChart";
import type { ConstructScore } from "@/lib/lms/scoring";

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [100, 100, 100];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

type Doc = jsPDF & {
  GState?: new (o: { opacity?: number; "stroke-opacity"?: number }) => unknown;
  setGState?: (g: unknown) => jsPDF;
};

function withOpacity(doc: Doc, opacity: number, draw: () => void) {
  const G = (doc as unknown as { GState?: new (o: object) => unknown }).GState;
  if (G && doc.setGState) {
    doc.setGState(new G({ opacity }));
    draw();
    doc.setGState(new G({ opacity: 1 }));
  } else {
    draw();
  }
}

function ordered(scores: ConstructScore[]): ConstructScore[] {
  return RADAR_ORDER.map(
    (id) => scores.find((s) => s.constructId === id) ?? { constructId: id, name: id, color: "#999999", rawMean: 0, score: 0, itemCount: 0 },
  );
}

export type PdfRadarOptions = {
  /** Show "pre → post" numbers under each face label */
  numbers?: boolean;
  /** Label font size (pt) */
  labelSize?: number;
  /** Ring labels 20–80 */
  ringLabels?: boolean;
};

/** Draw the radar centred at (cx, cy) with the given radius (document units). */
export function drawPdfRadar(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  before: ConstructScore[],
  after?: ConstructScore[] | null,
  opts: PdfRadarOptions = {},
) {
  const d = doc as Doc;
  const { numbers = true, labelSize = 7.5, ringLabels = true } = opts;
  const n = RADAR_ORDER.length;
  const pre = ordered(before);
  const post = after ? ordered(after) : null;
  const main = post ?? pre;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = (Math.min(100, Math.max(0, v)) / 100) * radius;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v));
  const pathOf = (pts: { x: number; y: number }[]) => {
    const segs = pts.slice(1).map((p, i) => [p.x - pts[i].x, p.y - pts[i].y] as [number, number]);
    segs.push([pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y]);
    return segs;
  };

  // Background disc
  doc.setFillColor(248, 247, 244);
  doc.setDrawColor(226, 224, 218);
  doc.setLineWidth(0.25);
  const outer = poly(Array(n).fill(100));
  doc.lines(pathOf(outer), outer[0].x, outer[0].y, [1, 1], "FD", true);

  // Rings
  doc.setLineWidth(0.15);
  for (const g of [20, 40, 60, 80]) {
    const ring = poly(Array(n).fill(g));
    doc.setDrawColor(222, 220, 214);
    doc.lines(pathOf(ring), ring[0].x, ring[0].y, [1, 1], "S", true);
    if (ringLabels) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(Math.max(4.5, labelSize - 2.5));
      doc.setTextColor(150, 148, 142);
      // On the edge midpoint between Choices and Spiritual (matches the web radar), clear of the markers
      const a = -Math.PI / 2 - Math.PI / n;
      const rr = (g / 100) * radius * Math.cos(Math.PI / n);
      doc.text(String(g), cx + rr * Math.cos(a), cy + rr * Math.sin(a), { align: "center", baseline: "middle" });
    }
  }

  // Face-coloured spokes
  main.forEach((s, i) => {
    const rim = pt(i, 100);
    const [r, g, b] = hexToRgb(s.color).map((c) => Math.round(c + (255 - c) * 0.55));
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.25);
    doc.line(cx, cy, rim.x, rim.y);
  });

  // AFTER (or the single series): soft face-coloured wedges, then a coloured edge
  const mainPts = poly(main.map((s) => s.score));
  main.forEach((s, i) => {
    const a = mainPts[i];
    const b = mainPts[(i + 1) % n];
    const [r, g, bl] = hexToRgb(s.color);
    withOpacity(d, 0.2, () => {
      doc.setFillColor(r, g, bl);
      doc.triangle(cx, cy, a.x, a.y, b.x, b.y, "F");
    });
  });

  // BEFORE: dashed neutral outline with hollow markers (only when comparing)
  if (post) {
    const prePts = poly(pre.map((s) => s.score));
    doc.setDrawColor(95, 95, 95);
    doc.setLineWidth(0.45);
    doc.setLineDashPattern([1.2, 0.9], 0);
    doc.lines(pathOf(prePts), prePts[0].x, prePts[0].y, [1, 1], "S", true);
    doc.setLineDashPattern([], 0);
    prePts.forEach((p) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(95, 95, 95);
      doc.setLineWidth(0.35);
      doc.circle(p.x, p.y, radius * 0.022 + 0.35, "FD");
    });
  }

  main.forEach((s, i) => {
    const a = mainPts[i];
    const b = mainPts[(i + 1) % n];
    const [r, g, bl] = hexToRgb(s.color);
    doc.setDrawColor(r, g, bl);
    doc.setLineWidth(0.8);
    doc.line(a.x, a.y, b.x, b.y);
  });
  main.forEach((s, i) => {
    const p = mainPts[i];
    const [r, g, b] = hexToRgb(s.color);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.55);
    doc.circle(p.x, p.y, radius * 0.03 + 0.5, "FD");
    doc.setFillColor(r, g, b);
    doc.circle(p.x, p.y, radius * 0.016 + 0.3, "F");
  });

  // Labels: face name (face colour) and numbers (dark grey, never colour-only)
  const gap = labelSize * 0.42;
  main.forEach((s, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const vertical = Math.abs(cos) < 0.01;
    const rr = radius * (vertical ? 1.1 : 1.13);
    const lx = cx + rr * cos;
    const ly = cy + rr * sin;
    const align: "left" | "center" | "right" = vertical ? "center" : cos > 0 ? "left" : "right";
    // Two lines (name, numbers): above the rim at the top, below it at the bottom, centred on the sides
    const nameY = vertical ? (sin < 0 ? ly - (numbers ? gap * 1.6 : gap * 0.6) : ly + gap * 0.9) : ly - (numbers ? gap * 0.5 : 0);
    const [r, g, b] = hexToRgb(s.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(labelSize);
    doc.setTextColor(Math.round(r * 0.8), Math.round(g * 0.8), Math.round(b * 0.8));
    doc.text(s.name, lx, nameY, { align, baseline: "middle" });
    if (numbers) {
      const preV = Math.round(pre[i].score);
      const txt = post ? `${preV} -> ${Math.round(s.score)}` : String(Math.round(s.score));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(labelSize - 1);
      doc.setTextColor(70, 70, 70);
      doc.text(txt, lx, nameY + gap * 1.05, { align, baseline: "middle" });
    }
  });
}

/** One-line legend under the radar (before/after styles). */
export function drawPdfRadarLegend(
  doc: jsPDF,
  x: number,
  y: number,
  size = 7,
  labels: [string, string] = ["Before (dashed, hollow markers)", "After (solid, filled markers)"],
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(70, 70, 70);
  doc.setDrawColor(95, 95, 95);
  doc.setLineWidth(0.45);
  doc.setLineDashPattern([1.2, 0.9], 0);
  doc.line(x, y, x + 7, y);
  doc.setLineDashPattern([], 0);
  doc.setFillColor(255, 255, 255);
  doc.circle(x + 3.5, y, 0.9, "FD");
  doc.text(labels[0], x + 9, y, { baseline: "middle" });
  const x2 = x + 9 + doc.getTextWidth(labels[0]) + 6;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.8);
  doc.line(x2, y, x2 + 7, y);
  doc.setFillColor(40, 40, 40);
  doc.circle(x2 + 3.5, y, 0.9, "F");
  doc.text(labels[1], x2 + 9, y, { baseline: "middle" });
}
