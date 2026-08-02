/**
 * Unique hero photography for marketing pages (not the homepage landing image).
 * Each theme has its own asset under /public/images/hero/hero-*.jpg
 */

export type HeroTheme =
  | "leadership"
  | "sdg"
  | "research"
  | "about"
  | "model"
  | "programs"
  | "impact"
  | "none";

export const heroThemes: Record<
  Exclude<HeroTheme, "none">,
  { src: string; alt: string; position?: string }
> = {
  leadership: {
    src: "/images/hero/hero-leadership.jpg",
    alt: "Diverse professionals collaborating in a modern leadership workshop",
    position: "object-[70%_center] sm:object-center",
  },
  sdg: {
    src: "/images/hero/hero-sdg.jpg",
    alt: "Mentor and young people learning outdoors — quality education and development",
    position: "object-[65%_center] sm:object-center",
  },
  research: {
    src: "/images/hero/hero-research.jpg",
    alt: "University research library desk with books and laptop",
    position: "object-[75%_center] sm:object-center",
  },
  about: {
    src: "/images/hero/hero-about.jpg",
    alt: "Leader overlooking a modern African city skyline at dawn",
    position: "object-[70%_center] sm:object-[60%_center]",
  },
  model: {
    src: "/images/hero/hero-model.jpg",
    alt: "Abstract luminous multidimensional cube representing Super-Cube®",
    position: "object-[70%_center] sm:object-center",
  },
  programs: {
    src: "/images/hero/hero-programs.jpg",
    alt: "Multi-age leadership learning studio for kids, teens, and adults",
    position: "object-[60%_center] sm:object-center",
  },
  impact: {
    src: "/images/hero/hero-impact.jpg",
    alt: "Professionals connecting on a campus courtyard — organisational impact",
    position: "object-[65%_center] sm:object-center",
  },
};
