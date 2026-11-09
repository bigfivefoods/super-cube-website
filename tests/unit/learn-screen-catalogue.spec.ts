import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { LMS_MESSAGES } from "../../src/lib/i18n/lms/catalogues";
import { LEARN_CHROME_KEYS } from "../../src/lib/i18n/lms/page-keys";
import { assessmentScreenKeys, collectLmsKeys, lessonScreenKeys } from "../../src/lib/i18n/lms/screen-keys";
import { pickLmsCatalogue } from "../../src/lib/i18n/lms/slice";
import { messageKey } from "../../src/lib/i18n/lms/text";
import { getLesson } from "../../src/lib/lms/curriculum";
import { courseId } from "../../src/lib/programmes";

test("the browser translator does not import the language catalogues", () => {
  const src = readFileSync("src/lib/i18n/lms/text.ts", "utf8");
  expect(src).not.toMatch(/require\(\s*["']\.\/catalogues/);
  expect(src).not.toMatch(/messages\/(?:fr|ar|pt|sw|zu|af)\.json/);
  const client = readFileSync("src/lib/i18n/lms/use-lms-t.ts", "utf8");
  expect(client).not.toMatch(/catalogues/);
});

test("one lesson embeds its own copy, not every other lesson", () => {
  const full = JSON.stringify(LMS_MESSAGES.fr);
  const keys = lessonScreenKeys("choices", "kids-choices-overview");
  const slim = JSON.stringify(pickLmsCatalogue(LMS_MESSAGES.fr, keys));
  expect(full.length).toBeGreaterThan(400_000);
  expect(slim.length).toBeLessThan(120_000);
  expect(slim.length).toBeLessThan(full.length / 3);

  const overview = getLesson(courseId("kids", "choices"), "kids-choices-overview");
  expect(overview).toBeTruthy();
  const kept = new Set(keys.map(messageKey));
  let translated = 0;
  for (const key of collectLmsKeys(overview)) {
    if (LMS_MESSAGES.fr[key]) {
      translated += 1;
      expect(kept.has(key), key).toBe(true);
    }
  }
  expect(translated).toBeGreaterThan(5);
  expect(Object.keys(LMS_MESSAGES.fr).length).toBeGreaterThan(2000);
  expect(Object.keys(pickLmsCatalogue(LMS_MESSAGES.fr, keys)).length).toBeLessThan(800);
});

test("the questionnaire slice covers its items and skips lesson bodies", () => {
  const full = JSON.stringify(LMS_MESSAGES.fr);
  const keys = assessmentScreenKeys();
  const slim = JSON.stringify(pickLmsCatalogue(LMS_MESSAGES.fr, keys));
  expect(slim.length).toBeLessThan(full.length / 2);
  expect(keys.map(messageKey)).toContain(messageKey("Strongly disagree"));
  const lessonOnly = messageKey("Meet the Choices face and try one small thing.");
  if (LMS_MESSAGES.fr[lessonOnly]) {
    expect(keys.map(messageKey)).not.toContain(lessonOnly);
  }
  expect(LEARN_CHROME_KEYS.length).toBeGreaterThan(20);
});
