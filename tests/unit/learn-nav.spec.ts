import { expect, test } from "@playwright/test";
import { getNavItem, isLearnNavActive, LEARN_PRIMARY_NAV } from "@/lib/lms/nav";

function activeFor(path: string): string[] {
  return LEARN_PRIMARY_NAV.filter((n) => isLearnNavActive(path, n)).map((n) => n.id);
}

test("orientation and baseline sit under Today (the pathway), not Progress", () => {
  expect(activeFor("/learn/assessment/orientation")).toEqual(["today"]);
  expect(activeFor("/learn/assessment/pre")).toEqual(["today"]);
  expect(activeFor("/learn/start")).toEqual(["today"]);
  expect(activeFor("/learn")).toEqual(["today"]);
});

test("Progress covers progress, report, reviews and the after-test", () => {
  expect(getNavItem("progress").href).toBe("/learn/progress");
  for (const p of ["/learn/progress", "/learn/report", "/learn/review", "/learn/review/capstone", "/learn/assessment/post", "/learn/assessment/mid"]) {
    expect(activeFor(p)).toEqual(["progress"]);
  }
});

test("exactly one tab is active on the main Learn pages", () => {
  for (const p of ["/learn/courses", "/learn/courses/choices/adults-choices-overview", "/learn/pulse", "/learn/practice", "/learn/account", "/learn/welcome", "/learn/feedback"]) {
    expect(activeFor(p)).toHaveLength(1);
  }
});
