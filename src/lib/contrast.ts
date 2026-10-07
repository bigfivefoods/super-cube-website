import type { CSSProperties } from "react";

/**
 * WCAG 2.2 colour-contrast helpers.
 *
 * Brand face colours (orange #ED8F20, teal #16979A, …) are too light to use
 * as small text on white. `inkFor` keeps the hue but darkens it until the
 * text meets AA (4.5:1) against the given background, so pages can keep the
 * face colour cue without failing contrast.
 */

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Same hue, darkened (or, on a dark background, lightened) just enough to reach `min`
 * contrast on `bg`. Returns the input unchanged when it already passes or
 * when it is not a hex colour.
 */
export function inkFor(color: string | undefined, bg = "#ffffff", min = 4.6): string | undefined {
  if (!color) return color;
  const rgb = parseHex(color);
  if (!rgb) return color;
  if (contrastRatio(color, bg) >= min) return color;
  // Light background: mix towards black. Dark background: mix towards white.
  const towards = luminance(bg) > 0.18 ? 0 : 255;
  for (let k = 0.04; k <= 1; k += 0.04) {
    const c = toHex([
      rgb[0] + (towards - rgb[0]) * k,
      rgb[1] + (towards - rgb[1]) * k,
      rgb[2] + (towards - rgb[2]) * k,
    ]);
    if (contrastRatio(c, bg) >= min) return c;
  }
  return towards ? "#ffffff" : "#000000";
}

/** Black or white text, whichever reads better on a solid `bg`. */
export function textOn(bg: string): "#ffffff" | "#0a0a0a" {
  return contrastRatio("#ffffff", bg) >= contrastRatio("#0a0a0a", bg) ? "#ffffff" : "#0a0a0a";
}

/**
 * Inline style for `.face-ink` text: an AA-safe shade of a face colour for the
 * light theme and one for the dark theme (globals.css picks the right one).
 */
export function faceInkStyle(
  color: string | undefined,
  lightBg = "#ffffff",
  darkBg = "#121212",
): CSSProperties {
  if (!color) return {};
  return {
    "--face-ink": inkFor(color, lightBg) ?? color,
    "--face-ink-dark": inkFor(color, darkBg) ?? color,
  } as CSSProperties;
}
