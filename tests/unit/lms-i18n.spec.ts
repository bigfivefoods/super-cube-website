import { expect, test } from "@playwright/test";
import { buildInstrumentItems } from "@/lib/lms/instruments";
import { scoreAttempt } from "@/lib/lms/scoring";
import { LMS_MESSAGES } from "@/lib/i18n/lms/catalogues";
import { lmsText, localizeDeep, messageKey } from "@/lib/i18n/lms/text";
import { PREFIXED_LOCALES } from "@/lib/i18n/config";
import { LIKERT_LABELS } from "@/lib/lms/assessment-items";

test("translated questionnaire items keep ids and scores", () => {
  const items = buildInstrumentItems("adults", "v1");
  expect(items).toHaveLength(28);
  const responses = Object.fromEntries(items.map((item, i) => [item.id, ((i % 5) + 1)]));
  const english = scoreAttempt(items, responses);
  for (const locale of PREFIXED_LOCALES) {
    const shown = localizeDeep(locale, items);
    expect(shown.map((item) => item.id)).toEqual(items.map((item) => item.id));
    expect(shown.map((item) => item.reverse ?? false)).toEqual(items.map((item) => item.reverse ?? false));
    expect(scoreAttempt(shown, responses)).toEqual(english);
    expect(lmsText(locale, "Strongly disagree")).not.toBe("Strongly disagree");
    expect(lmsText(locale, shown[0].prompt) === shown[0].prompt || shown[0].prompt !== items[0].prompt).toBe(true);
  }
});

test("Learn catalogues share keys, keep Super-Cube®, and never name Kwaden", () => {
  const [first, ...rest] = PREFIXED_LOCALES;
  const keys = Object.keys(LMS_MESSAGES[first]).sort();
  expect(keys.length).toBeGreaterThan(500);
  for (const locale of rest) {
    expect(Object.keys(LMS_MESSAGES[locale]).sort(), locale).toEqual(keys);
  }
  const prompts = buildInstrumentItems("adults", "v1").map((item) => messageKey(item.prompt));
  for (const locale of PREFIXED_LOCALES) {
    for (const prompt of prompts) {
      expect(LMS_MESSAGES[locale][prompt], `${locale} missing ${prompt}`).toBeTruthy();
      expect(LMS_MESSAGES[locale][prompt]).not.toBe(prompt);
    }
    for (const [key, value] of Object.entries(LMS_MESSAGES[locale])) {
      if (key.includes("Super-Cube®")) expect(value, locale).toContain("Super-Cube®");
      expect(value.toLowerCase(), locale).not.toContain("kwaden");
      const expected = (key.match(/\{[A-Za-z0-9_]+\}/g) ?? []).sort();
      const got = (value.match(/\{[A-Za-z0-9_]+\}/g) ?? []).sort();
      expect(got, `${locale}: ${key.slice(0, 80)}`).toEqual(expected);
    }
    for (const label of LIKERT_LABELS) {
      expect(lmsText(locale, label)).not.toBe(label);
    }
  }
});
