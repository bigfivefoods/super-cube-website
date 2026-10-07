import { test, expect } from "@playwright/test";
import { jsPDF } from "jspdf";
import { constructs } from "@/lib/content";
import { formatDelta, orderScoresForRadar, RADAR_ORDER } from "@/components/learn/RadarChart";
import { drawPdfRadar, drawPdfRadarLegend, hexToRgb } from "@/lib/lms/pdf-radar";

const scores = constructs.map((c, i) => ({ constructId: c.id, name: c.name, color: c.color, score: 40 + i * 5, rawMean: 3, itemCount: 4 }));

test("radar order keeps Choices on top and Principles opposite", () => {
  expect(RADAR_ORDER[0]).toBe("choices");
  expect(RADAR_ORDER[3]).toBe("principles");
  expect(orderScoresForRadar(scores).map((s) => s.constructId)).toEqual(RADAR_ORDER);
  // Missing faces become zero rather than breaking the chart
  expect(orderScoresForRadar(scores.slice(0, 2))[5].score).toBe(0);
});

test("deltas are signed with a real minus sign and one decimal at most", () => {
  expect(formatDelta(12)).toBe("+12");
  expect(formatDelta(4.26)).toBe("+4.3");
  expect(formatDelta(-3)).toBe("−3");
  expect(formatDelta(0.04)).toBe("±0");
});

test("PDF radar draws without throwing for one and two series", () => {
  expect(hexToRgb("#B32026")).toEqual([179, 32, 38]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawPdfRadar(doc, 100, 100, 30, scores);
  drawPdfRadar(doc, 100, 200, 30, scores, scores.map((s) => ({ ...s, score: s.score + 8 })));
  drawPdfRadarLegend(doc, 40, 250);
  expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(2000);
});
