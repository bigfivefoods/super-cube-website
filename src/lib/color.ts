/**
 * Small WCAG contrast helpers so brand construct colours stay on-brand while
 * text that uses them meets WCAG 2.x AA (4.5:1 for normal text).
 */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function luminance([r, g, b]: [number, number, number]) {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrastRatio(a: string, b: string) {
  const la = luminance(hexToRgb(a));
  const lb = luminance(hexToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Darken `hex` just enough to reach `min` contrast against `bg` (default white). */
export function readableOn(hex: string, bg = "#ffffff", min = 4.6) {
  let rgb = hexToRgb(hex);
  for (let i = 0; i < 40 && contrastRatio(rgbToHex(rgb), bg) < min; i++) {
    rgb = rgb.map((v) => v * 0.94) as [number, number, number];
  }
  return rgbToHex(rgb);
}

/** White or near-black text, whichever is AA-readable on a solid brand face. */
export function foregroundFor(bg: string) {
  return contrastRatio("#ffffff", bg) >= 4.6 ? "#ffffff" : "#0a0a0a";
}
