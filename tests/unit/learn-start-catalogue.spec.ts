import { expect, test } from "@playwright/test";
import { LMS_MESSAGES } from "../../src/lib/i18n/lms/catalogues";
import { LEARN_START_KEYS } from "../../src/lib/i18n/lms/page-keys";
import { pickLmsCatalogue } from "../../src/lib/i18n/lms/slice";

test("guided start embeds only the strings that screen can show", () => {
  const full = JSON.stringify(LMS_MESSAGES.fr);
  const slim = JSON.stringify(pickLmsCatalogue(LMS_MESSAGES.fr, LEARN_START_KEYS));
  expect(full.length).toBeGreaterThan(400_000);
  expect(slim.length).toBeLessThan(80_000);
  expect(pickLmsCatalogue(LMS_MESSAGES.fr, LEARN_START_KEYS).Today).toBeTruthy();
  expect(slim).not.toContain("Strongly disagree");
  expect(LMS_MESSAGES.fr["Start your free baseline"]).toBeTruthy();
  expect(LMS_MESSAGES.fr["Six faces, honest ratings. You can save mid-way and resume."]).toMatch(/Vous/);
  expect(LMS_MESSAGES.ar["Six faces, honest ratings. You can save mid-way and resume."]).not.toMatch(/[A-Za-z]{4}/);
  expect(LMS_MESSAGES.ar["Start your free Super-Cube® leadership baseline in about 5 minutes, no payment needed."]).toContain(
    "Super-Cube®",
  );
});
