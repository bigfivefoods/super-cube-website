/**
 * Super-Cube® UI translations.
 * Default locale: English (en). Also: isiZulu (zu), Afrikaans (af).
 * Preference stored in localStorage key `sc_locale`.
 */

export type Locale = "en" | "zu" | "af";

export const LOCALES: Locale[] = ["en", "zu", "af"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zu: "isiZulu",
  af: "Afrikaans",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  zu: "ZU",
  af: "AF",
};

const STORAGE_KEY = "sc_locale";

const en = {
  // Language UI
  "lang.label": "Language",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "Afrikaans",

  // Primary nav
  "nav.model": "Model",
  "nav.sixFaces": "Six faces",
  "nav.programmes": "Programmes",
  "nav.learn": "Learn",
  "nav.pricing": "Pricing",
  "nav.more": "More",
  "nav.contact": "Contact",
  "nav.startFree": "Start free",
  "nav.startFreeBaseline": "Start free baseline",
  "nav.signIn": "Sign in",
  "nav.main": "Main",
  "nav.menu": "Menu",
  "nav.close": "Close menu",
  "nav.open": "Open menu",

  // More menu groups
  "nav.group.story": "Story",
  "nav.group.proof": "Proof & practice",
  "nav.group.orgs": "Organisations",
  "nav.group.connect": "Connect",
  "nav.why": "Why leadership",
  "nav.how": "How it works",
  "nav.research": "Research",
  "nav.about": "About",
  "nav.sampleReport": "Sample report",
  "nav.impact": "Impact",
  "nav.practices": "Practices",
  "nav.insights": "Insights",
  "nav.pilotPack": "Pilot pack",
  "nav.facilitator": "Facilitator kit",
  "nav.team": "Team cube",
  "nav.certify": "Certification",
  "nav.community": "Community",
  "nav.media": "Media kit",

  // Footer
  "footer.product": "Product",
  "footer.proof": "Proof",
  "footer.orgs": "Organisations",
  "footer.company": "Company",
  "footer.sixFaces": "Six faces",
  "footer.allConstructs": "All constructs →",
  "footer.tagline":
    "Human-centric leadership, developed from the core outward.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Start free",
  "footer.contact": "Contact",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.journals": "Journals private · consent for coach share",
  "footer.copyright": "Super-Cube® Leadership Model",

  // CTAs & common
  "cta.tryFree": "Start free baseline",
  "cta.bookPilot": "Book a pilot",
  "cta.exploreModel": "Explore the model",
  "cta.seeProgrammes": "View programmes",
  "cta.sampleReport": "See sample report",
  "cta.continue": "Continue",
  "cta.learnMore": "Learn more",

  // Learn
  "learn.continue": "Continue",
  "learn.baseline": "Baseline",
  "learn.weeklyPlan": "This week’s plan",
  "learn.microPractice": "Today’s micro-practice",
  "learn.shareCoach": "Share progress with my cohort coach",
  "learn.midCheck": "Mid-pathway check-in",
  "learn.doneToday": "Done for today",
  "learn.doneTodayShort": "Done today",
  "learn.peerPulse": "Peer / manager pulse",
  "learn.language": "Language",
  "learn.nextSession": "Next session",
  "learn.continueSession": "Continue session",

  // Faces
  "face.choices": "Choices",
  "face.principles": "Principles",
  "face.mental": "Mental",
  "face.emotional": "Emotional",
  "face.physical": "Physical",
  "face.spiritual": "Spiritual",
  "face.jump": "Faces",
} as const;

export type I18nKey = keyof typeof en;

const zu: Record<I18nKey, string> = {
  "lang.label": "Ulimi",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "isiBhunu",

  "nav.model": "Imodeli",
  "nav.sixFaces": "Ubuso obuyisithupha",
  "nav.programmes": "Izinhlelo",
  "nav.learn": "Funda",
  "nav.pricing": "Amanani",
  "nav.more": "Okuningi",
  "nav.contact": "Xhumana",
  "nav.startFree": "Qala mahhala",
  "nav.startFreeBaseline": "Qala isisekelo samahhala",
  "nav.signIn": "Ngena ngemvume",
  "nav.main": "Okuyinhloko",
  "nav.menu": "Imenyu",
  "nav.close": "Vala imenyu",
  "nav.open": "Vula imenyu",

  "nav.group.story": "Indaba",
  "nav.group.proof": "Ubufakazi nokuzilolonga",
  "nav.group.orgs": "Izinhlangano",
  "nav.group.connect": "Xhumana",
  "nav.why": "Kungani ubuholi",
  "nav.how": "Kusebenza kanjani",
  "nav.research": "Ucwaningo",
  "nav.about": "Mayelana",
  "nav.sampleReport": "Umbiko wesampula",
  "nav.impact": "Umthelela",
  "nav.practices": "Imikhuba",
  "nav.insights": "Ukuqonda",
  "nav.pilotPack": "Iphakethe le-pilot",
  "nav.facilitator": "Ikhithi yomqeqeshi",
  "nav.team": "Ikhyubhu yethimba",
  "nav.certify": "Isitifiketi",
  "nav.community": "Umphakathi",
  "nav.media": "Ikhithi yezindaba",

  "footer.product": "Umkhiqizo",
  "footer.proof": "Ubufakazi",
  "footer.orgs": "Izinhlangano",
  "footer.company": "Inkampani",
  "footer.sixFaces": "Ubuso obuyisithupha",
  "footer.allConstructs": "Zonke izakhi →",
  "footer.tagline":
    "Ubuholi obugxile kumuntu, bukhuliswa kusukela phakathi kuya ngaphandle.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Qala mahhala",
  "footer.contact": "Xhumana",
  "footer.privacy": "Ubumfihlo",
  "footer.terms": "Imigomo",
  "footer.journals":
    "Amadayari ayimfihlo · imvume yokwabelana nomqeqeshi",
  "footer.copyright": "Imodeli yobuholi ye-Super-Cube®",

  "cta.tryFree": "Qala isisekelo samahhala",
  "cta.bookPilot": "Bhuka i-pilot",
  "cta.exploreModel": "Hlola imodeli",
  "cta.seeProgrammes": "Buka izinhlelo",
  "cta.sampleReport": "Buka umbiko wesampula",
  "cta.continue": "Qhubeka",
  "cta.learnMore": "Funda kabanzi",

  "learn.continue": "Qhubeka",
  "learn.baseline": "Isisekelo",
  "learn.weeklyPlan": "Uhlelo lwaleli viki",
  "learn.microPractice": "Umsebenzi omncane wanamuhla",
  "learn.shareCoach": "Yabelana ngentuthuko nomqeqeshi weqembu lami",
  "learn.midCheck": "Ukuhlola maphakathi nendlela",
  "learn.doneToday": "Kuqediwe namuhla",
  "learn.doneTodayShort": "Kuqedile",
  "learn.peerPulse": "Ukuhlola kontanga / umphathi",
  "learn.language": "Ulimi",
  "learn.nextSession": "Iseshini elandelayo",
  "learn.continueSession": "Qhubeka neseshini",

  "face.choices": "Izinketho",
  "face.principles": "Izimiso",
  "face.mental": "Ingqondo",
  "face.emotional": "Imizwa",
  "face.physical": "Umzimba",
  "face.spiritual": "Umoya",
  "face.jump": "Ubuso",
};

const af: Record<I18nKey, string> = {
  "lang.label": "Taal",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "Afrikaans",

  "nav.model": "Model",
  "nav.sixFaces": "Ses vlakke",
  "nav.programmes": "Programme",
  "nav.learn": "Leer",
  "nav.pricing": "Pryse",
  "nav.more": "Meer",
  "nav.contact": "Kontak",
  "nav.startFree": "Begin gratis",
  "nav.startFreeBaseline": "Begin gratis basislyn",
  "nav.signIn": "Meld aan",
  "nav.main": "Hoof",
  "nav.menu": "Kieslys",
  "nav.close": "Maak kieslys toe",
  "nav.open": "Maak kieslys oop",

  "nav.group.story": "Storie",
  "nav.group.proof": "Bewys & oefening",
  "nav.group.orgs": "Organisasies",
  "nav.group.connect": "Skakel",
  "nav.why": "Hoekom leierskap",
  "nav.how": "Hoe dit werk",
  "nav.research": "Navorsing",
  "nav.about": "Oor ons",
  "nav.sampleReport": "Voorbeeldverslag",
  "nav.impact": "Impak",
  "nav.practices": "Praktyke",
  "nav.insights": "Insigte",
  "nav.pilotPack": "Looods-pakket",
  "nav.facilitator": "Fasiliteerder-kit",
  "nav.team": "Spankubus",
  "nav.certify": "Sertifisering",
  "nav.community": "Gemeenskap",
  "nav.media": "Media-kit",

  "footer.product": "Produk",
  "footer.proof": "Bewys",
  "footer.orgs": "Organisasies",
  "footer.company": "Maatskappy",
  "footer.sixFaces": "Ses vlakke",
  "footer.allConstructs": "Alle konstrukte →",
  "footer.tagline":
    "Mensgesentreerde leierskap, ontwikkel van die kern na buite.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Begin gratis",
  "footer.contact": "Kontak",
  "footer.privacy": "Privaatheid",
  "footer.terms": "Bepalings",
  "footer.journals":
    "Joernale privaat · toestemming vir afrigter-deling",
  "footer.copyright": "Super-Cube® Leierskapmodel",

  "cta.tryFree": "Begin gratis basislyn",
  "cta.bookPilot": "Bespreek ’n loods",
  "cta.exploreModel": "Verken die model",
  "cta.seeProgrammes": "Sien programme",
  "cta.sampleReport": "Sien voorbeeldverslag",
  "cta.continue": "Gaan voort",
  "cta.learnMore": "Leer meer",

  "learn.continue": "Gaan voort",
  "learn.baseline": "Basislyn",
  "learn.weeklyPlan": "Hierdie week se plan",
  "learn.microPractice": "Vandag se mikro-oefening",
  "learn.shareCoach": "Deel vordering met my kohort-afrigter",
  "learn.midCheck": "Middelpad-kontrole",
  "learn.doneToday": "Klaar vir vandag",
  "learn.doneTodayShort": "Klaar",
  "learn.peerPulse": "Portuur- / bestuurder-pols",
  "learn.language": "Taal",
  "learn.nextSession": "Volgende sessie",
  "learn.continueSession": "Gaan voort met sessie",

  "face.choices": "Keuses",
  "face.principles": "Beginsels",
  "face.mental": "Geestelik",
  "face.emotional": "Emosioneel",
  "face.physical": "Fisies",
  "face.spiritual": "Spiritueel",
  "face.jump": "Vlakke",
};

const dictionaries: Record<Locale, Record<I18nKey, string>> = {
  en: en as Record<I18nKey, string>,
  zu,
  af,
};

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "en" || v === "zu" || v === "af";
}

export function t(key: I18nKey, locale: Locale = "en"): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : "en";
  } catch {
    return "en";
  }
}

export function setLocaleInStorage(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang =
      locale === "en" ? "en" : locale === "zu" ? "zu" : "af";
  } catch {
    /* ignore */
  }
}

/** Map main nav href → translation key */
export const mainNavI18n: Record<string, I18nKey> = {
  "/the-model": "nav.model",
  "/constructs": "nav.sixFaces",
  "/what": "nav.programmes",
  "/learn/start": "nav.learn",
  "/pricing": "nav.pricing",
};

export const moreLinkI18n: Record<string, I18nKey> = {
  "/why": "nav.why",
  "/how": "nav.how",
  "/research": "nav.research",
  "/about": "nav.about",
  "/sample-report": "nav.sampleReport",
  "/impact": "nav.impact",
  "/practices": "nav.practices",
  "/insights": "nav.insights",
  "/pilot-pack": "nav.pilotPack",
  "/facilitator": "nav.facilitator",
  "/team": "nav.team",
  "/certify": "nav.certify",
  "/community": "nav.community",
  "/contact": "nav.contact",
  "/media": "nav.media",
  "/login": "nav.signIn",
};

export const moreGroupI18n: Record<string, I18nKey> = {
  Story: "nav.group.story",
  "Proof & practice": "nav.group.proof",
  Organisations: "nav.group.orgs",
  Connect: "nav.group.connect",
};

export const faceI18n: Record<string, I18nKey> = {
  choices: "face.choices",
  principles: "face.principles",
  mental: "face.mental",
  emotional: "face.emotional",
  physical: "face.physical",
  spiritual: "face.spiritual",
};

export const footerColI18n: Record<string, I18nKey> = {
  Product: "footer.product",
  Proof: "footer.proof",
  Organisations: "footer.orgs",
  Company: "footer.company",
};
