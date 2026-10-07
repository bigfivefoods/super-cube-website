/**
 * Super-Cube® languages: config (locales, URL helpers), the English source dictionary and the
 * key maps the chrome uses. Per-language dictionaries live in ./dict and load one at a time.
 */
import en, { type Dict, type I18nKey } from "./dict/en";
import { translate, type Vars } from "./translate";

export * from "./config";
export type { Dict, I18nKey } from "./dict/en";
export { translate } from "./translate";

/** English string for `key` (server code, JSON-LD and other English-only surfaces). */
export function tEn(key: I18nKey, vars?: Vars): string {
  return translate(en as Dict, key, vars);
}

/** Map main nav href → translation key */
export const mainNavI18n: Record<string, I18nKey> = {
  "/organisations": "nav.organisations",
  "/schools": "nav.schools",
  "/speaking": "nav.speaking",
  "/research": "nav.research",
  "/the-model": "nav.model",
  "/constructs": "nav.sixFaces",
  "/what": "nav.programmes",
  "/how": "nav.how",
  "/pricing": "nav.pricing",
  "/learn/start": "nav.learn",
};

export const moreLinkI18n: Record<string, I18nKey> = {
  "/why": "nav.why",
  "/leadership-challenges": "nav.leadershipChallenges",
  "/how": "nav.how",
  "/research": "nav.research",
  "/about": "nav.about",
  "/sample-report": "nav.sampleReport",
  "/impact": "nav.impact",
  "/practices": "nav.practices",
  "/insights": "nav.insights",
  "/news": "nav.news",
  "/pilot-pack": "nav.pilotPack",
  "/facilitator": "nav.facilitator",
  "/team": "nav.team",
  "/certify": "nav.certify",
  "/community": "nav.community",
  "/contact": "nav.contact",
  "/media": "nav.media",
  "/faq": "nav.faq",
  "/login": "nav.signIn",
  "/pricing#pilot": "cta.bookPilot",
};

export const moreGroupI18n: Record<string, I18nKey> = {
  Understand: "nav.group.understand",
  Practice: "nav.group.practice",
  Organisations: "nav.group.orgs",
  Explore: "nav.group.explore",
  // Legacy titles
  Story: "nav.group.story",
  "Proof & practice": "nav.group.proof",
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
  Understand: "footer.understand",
  Practice: "footer.practice",
  Organisations: "footer.orgs",
  // Legacy titles
  Proof: "footer.proof",
  Company: "footer.company",
};
