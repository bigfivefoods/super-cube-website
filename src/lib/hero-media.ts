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
  | "constructs"
  | "programs"
  | "impact"
  | "none";

export type HeroTone = "dark" | "light";

export const heroThemes: Record<
  Exclude<HeroTheme, "none">,
  { src: string; alt: string; position?: string; tone?: HeroTone }
> = {
  leadership: {
    src: "/images/hero/hero-leadership.jpg",
    alt: "Diverse professionals collaborating in a modern leadership workshop",
    position: "object-[70%_center] sm:object-center",
    tone: "dark",
  },
  sdg: {
    src: "/images/hero/hero-sdg.jpg",
    alt: "Mentor and young people learning outdoors — quality education and development",
    position: "object-[65%_center] sm:object-center",
    tone: "dark",
  },
  research: {
    src: "/images/hero/hero-research.jpg",
    alt: "University research library desk with books and laptop",
    position: "object-[75%_center] sm:object-center",
    tone: "dark",
  },
  about: {
    src: "/images/hero/hero-about.jpg",
    alt: "Leader overlooking a modern African city skyline at dawn",
    position: "object-[70%_center] sm:object-[60%_center]",
    tone: "dark",
  },
  model: {
    src: "/images/hero/hero-model.jpg",
    alt: "Abstract luminous multidimensional cube representing Super-Cube®",
    position: "object-[70%_center] sm:object-center",
    tone: "dark",
  },
  constructs: {
    src: "/images/hero/hero-constructs.jpg",
    alt: "Multicolour geometric cubes in Super-Cube® face colours — modern construct overview",
    position: "object-[80%_center] sm:object-[70%_center] md:object-center",
    tone: "light",
  },
  programs: {
    src: "/images/hero/hero-programs.jpg",
    alt: "Multi-age leadership learning studio for kids, teens, and adults",
    position: "object-[60%_center] sm:object-center",
    tone: "dark",
  },
  impact: {
    src: "/images/hero/hero-impact.jpg",
    alt: "Professionals connecting on a campus courtyard — organisational impact",
    position: "object-[65%_center] sm:object-center",
    tone: "dark",
  },
};

/** Paths where the fixed header sits over a light media hero (soft grey → white on scroll) */
export const lightHeroPaths = ["/constructs"] as const;

/**
 * Paths where the fixed header is transparent over a dark media hero
 * (hero colour shows through → white on scroll).
 */
export const darkHeroPaths = [
  "/",
  "/the-model",
  "/what",
  "/how",
  "/why-leadership",
  "/why",
  "/research",
  "/about",
  "/pricing",
  "/impact",
  "/sample-report",
  "/practices",
  "/facilitator",
  "/programs",
  "/contact",
  "/insights",
  "/media",
  "/certify",
  "/community",
  "/team",
] as const;
