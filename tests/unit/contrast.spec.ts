import { expect, test } from "@playwright/test";
import { contrastRatio, inkFor, textOn } from "../../src/lib/contrast";

const FACES = ["#B32026", "#5D1F5E", "#ED8F20", "#367638", "#16979A", "#26408C"];

test("contrast ratio matches WCAG reference values", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
});

test("every face colour gets an AA-safe text shade on light and dark", () => {
  for (const c of FACES) {
    expect(contrastRatio(inkFor(c)!, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(inkFor(c, "#121212")!, "#121212")).toBeGreaterThanOrEqual(4.5);
  }
  // Already-dark colours are left alone.
  expect(inkFor("#26408C")).toBe("#26408C");
});

test("chip text picks the more readable of black and white", () => {
  expect(textOn("#ED8F20")).toBe("#0a0a0a");
  expect(textOn("#26408C")).toBe("#ffffff");
  for (const c of FACES) expect(contrastRatio(textOn(c), c)).toBeGreaterThanOrEqual(4.5);
});
