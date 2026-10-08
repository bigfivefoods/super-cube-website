import { test, expect } from "@playwright/test";
import { nextSpacedReview } from "@/lib/lms/review";
import { serverHasRecordedPractice } from "@/lib/lms/rewards";
import { changeBand } from "@/lib/lms/scoring";
import type { LocalLmsState } from "@/lib/lms/store";

const DAY = 24 * 60 * 60 * 1000;

test("spaced review names day 3, 7 and 14 from the baseline", () => {
  const start = new Date("2026-01-01T08:00:00.000Z");
  const before = nextSpacedReview(start.toISOString(), {}, new Date(start.getTime() + 2 * DAY));
  expect(before.status).toBe("upcoming");
  expect(before.day).toBe(3);
  expect(before.href).toBe("/learn/review?day=3");

  const due = nextSpacedReview(start.toISOString(), {}, new Date(start.getTime() + 3 * DAY + 1000));
  expect(due.status).toBe("due");
  expect(due.title).toMatch(/Day 3/);

  const next = nextSpacedReview(start.toISOString(), { "3": "done" }, new Date(start.getTime() + 4 * DAY));
  expect(next.day).toBe(7);
  expect(next.status).toBe("upcoming");

  const finished = nextSpacedReview(
    start.toISOString(),
    { "3": "a", "7": "b", "14": "c" },
    new Date(start.getTime() + 20 * DAY),
  );
  expect(finished.status).toBe("finished");
  expect(nextSpacedReview(null).status).toBe("needs-baseline");
});

test("growth report and certificate wait for a server-recorded after-test", () => {
  const localPost = {
    attempts: [{ phase: "post" as const, serverId: undefined }],
    certificateId: undefined,
  };
  expect(serverHasRecordedPractice(localPost as Pick<LocalLmsState, "attempts" | "certificateId">)).toBe(false);
  expect(
    serverHasRecordedPractice({
      attempts: [{ phase: "post", serverId: "srv-1" } as LocalLmsState["attempts"][number]],
      certificateId: undefined,
    }),
  ).toBe(true);
  expect(
    serverHasRecordedPractice({
      attempts: [],
      certificateId: "SC-20260101-ABCDEFABCD",
    }),
  ).toBe(true);
});

test("change bands stay provisional and do not claim reliable change", () => {
  const rise = changeBand(40, "face");
  const flat = changeBand(0, "face");
  expect(rise?.label.toLowerCase()).toContain("provisional");
  expect(rise?.short.toLowerCase()).not.toContain("real");
  expect(flat?.label.toLowerCase()).toContain("placeholder");
  expect(`${rise?.label} ${flat?.label}`.toLowerCase()).not.toContain("reliable");
});
