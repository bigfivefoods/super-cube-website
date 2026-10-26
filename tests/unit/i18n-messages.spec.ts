import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { MESSAGES } from "@/lib/i18n/pages/catalogues";
import { messageKey } from "@/lib/i18n/pages/t";
import type { PrefixedLocale } from "@/lib/i18n/config";

const LOCALES = Object.keys(MESSAGES) as PrefixedLocale[];
const PLACEHOLDER = /\{[A-Za-z0-9_]+\}/g;

test.describe("inner-page catalogues", () => {
  test("every language has the same keys", () => {
    const [first, ...rest] = LOCALES;
    const keys = Object.keys(MESSAGES[first]).sort();
    expect(keys.length).toBeGreaterThan(1500);
    for (const locale of rest) {
      expect(Object.keys(MESSAGES[locale]).sort(), locale).toEqual(keys);
    }
  });

  test("Super-Cube® keeps its mark, and Kwaden is never named", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(MESSAGES[locale])) {
        if (key.includes("Super-Cube®")) {
          expect(value, `${locale}: ${key.slice(0, 80)}`).toContain("Super-Cube®");
        }
        expect(value.toLowerCase(), locale).not.toContain("kwaden");
        expect(key.toLowerCase()).not.toContain("kwaden");
      }
    }
  });

  test("placeholders survive translation", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(MESSAGES[locale])) {
        const expected = (key.match(PLACEHOLDER) ?? []).sort();
        const got = (value.match(PLACEHOLDER) ?? []).sort();
        expect(got, `${locale}: ${key.slice(0, 80)}`).toEqual(expected);
      }
    }
  });

  test("the school stays unnamed, and the measured gains stay attributed", () => {
    const school = messageKey(
      "A Super-Cube® field snapshot from a leading high school in South Africa: none of the boarders had a leadership model they actually used, yet 88% want to develop their leadership using a scientific approach.",
    );
    const gains = messageKey(
      "Leaders at Imana Foods and Kerry Foods completed a 12-week, accredited Super-Cube® leadership development intervention. Across the six faces, average assessment scores rose by 32.2% from the start of the course to the end.",
    );
    for (const locale of LOCALES) {
      const schoolLine = MESSAGES[locale][school];
      const gainLine = MESSAGES[locale][gains];
      expect(schoolLine, locale).toBeTruthy();
      expect(gainLine, locale).toBeTruthy();
      expect(schoolLine.toLowerCase(), locale).not.toMatch(/kwaden|westville|hilton|st john/);
      expect(gainLine, locale).toMatch(/Imana Foods/);
      expect(gainLine, locale).toMatch(/Kerry Foods/);
      expect(gainLine, locale).toMatch(/32[,.]2/);
      expect(gainLine, locale).toMatch(/12/);
    }
  });

  test("thesis year and graduation year are not rewritten in the catalogues", () => {
    const raw = readFileSync("src/lib/i18n/messages/fr.json", "utf8");
    expect(raw).toContain("2020");
    expect(raw).toContain("2021");
    for (const locale of LOCALES) {
      const blob = JSON.stringify(MESSAGES[locale]);
      expect(blob, locale).not.toMatch(/graduat\w*\s+2020|graduated in 2020|diplôm\w+ en 2020/i);
    }
  });
});
