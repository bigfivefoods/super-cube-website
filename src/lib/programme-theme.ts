import type { CSSProperties } from "react";
import type { ProgrammeId } from "@/lib/programmes";

/**
 * Colour identity for the three programmes (pricing cards; reusable for
 * programme chips). Chosen to sit apart from the six cube face colours by
 * value and hue: a light sky→lilac for Kids, a vivid rose→violet for
 * Adolescents, and a deep midnight with champagne gold for Adults.
 * Every text colour here passes WCAG AA on every stop of its gradient
 * (checked with src/lib/contrast.ts; see tests/unit/programme-theme.spec.ts).
 */
export type ProgrammeTheme = {
  /** Gradient stops, left → right */
  stops: string[];
  /** Main text on the band */
  ink: string;
  /** Eyebrow / age text on the band */
  accent: string;
  /** Subtle texture layered over the gradient */
  pattern: string;
  /** Solid colour for small chips/dots */
  solid: string;
};

export const PROGRAMME_THEME: Record<ProgrammeId, ProgrammeTheme> = {
  kids: {
    stops: ["#7DD3FC", "#A5B4FC", "#C4B5FD"],
    ink: "#0B1B33",
    accent: "#1E3A5F",
    pattern: "radial-gradient(rgba(255,255,255,0.45) 1.2px, transparent 1.4px) 0 0 / 14px 14px",
    solid: "#7DD3FC",
  },
  adolescents: {
    stops: ["#BE185D", "#A21CAF", "#6D28D9"],
    ink: "#FFFFFF",
    accent: "#FFFFFF",
    pattern: "repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 2px, transparent 2px 12px)",
    solid: "#A21CAF",
  },
  adults: {
    stops: ["#0B1320", "#1F2A44", "#24324F"],
    ink: "#FFFFFF",
    accent: "#E9CF97",
    pattern:
      "linear-gradient(rgba(233,207,151,0.07) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgba(233,207,151,0.07) 1px, transparent 1px) 0 0 / 22px 22px",
    solid: "#1F2A44",
  },
};

/** Background for a programme header band: texture over a gradient. */
export function programmeBandStyle(id: ProgrammeId): CSSProperties {
  const t = PROGRAMME_THEME[id];
  return {
    background: `${t.pattern}, linear-gradient(120deg, ${t.stops.join(", ")})`,
    color: t.ink,
  };
}
