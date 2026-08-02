/**
 * Lightweight UI string scaffold (EN + isiZulu labels for key Learn paths).
 * Full translation can expand later; this unblocks bilingual kids/school demos.
 */

export type Locale = "en" | "zu";

const dict = {
  en: {
    learn: "Learn",
    continue: "Continue",
    baseline: "Baseline",
    weeklyPlan: "This week’s plan",
    microPractice: "Today’s micro-practice",
    shareCoach: "Share progress with my cohort coach",
    tryFree: "Start free baseline",
    bookPilot: "Book a pilot",
    sixFaces: "Six faces of leadership",
    privacy: "Privacy",
    terms: "Terms",
  },
  zu: {
    learn: "Funda",
    continue: "Qhubeka",
    baseline: "Isisekelo",
    weeklyPlan: "Uhlelo lwaleli viki",
    microPractice: "Umsebenzi omncane wanamuhla",
    shareCoach: "Yabelana ngentuthuko nomqeqeshi",
    tryFree: "Qala isisekelo samahhala",
    bookPilot: "Bhuka i-pilot",
    sixFaces: "Ubuso obuyisithupha bobuholi",
    privacy: "Ubumfihlo",
    terms: "Imigomo",
  },
} as const;

export type I18nKey = keyof (typeof dict)["en"];

export function t(key: I18nKey, locale: Locale = "en"): string {
  return dict[locale][key] ?? dict.en[key] ?? key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem("sc_locale");
    return v === "zu" ? "zu" : "en";
  } catch {
    return "en";
  }
}

export function setLocaleInStorage(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sc_locale", locale);
  } catch {
    /* ignore */
  }
}
