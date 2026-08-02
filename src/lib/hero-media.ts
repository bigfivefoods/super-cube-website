/**
 * Shared hero photography for marketing pages (not the homepage).
 * Keep typography in PageHero; these only supply imagery + alt text.
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
  { src: string; alt: string }
> = {
  leadership: {
    src: "/images/hero/leadership-hero.jpg",
    alt: "Modern leadership development",
  },
  sdg: {
    src: "/images/sdgs/goal-04.jpg",
    alt: "UN Sustainable Development Goal 4 — Quality education",
  },
  research: {
    src: "/images/hero/einstein.jpg",
    alt: "Curiosity and scientific enquiry",
  },
  about: {
    src: "/images/hero/nelson-mandela.jpg",
    alt: "Human-centred leadership and dignity",
  },
  model: {
    src: "/images/hero/leadership-hero.jpg",
    alt: "Whole-person leadership framework",
  },
  programs: {
    src: "/images/programs/mental-cover.jpg",
    alt: "Leadership learning programmes",
  },
  impact: {
    src: "/images/sdgs/goal-16.jpg",
    alt: "Peace, justice and strong institutions — SDG 16",
  },
};
