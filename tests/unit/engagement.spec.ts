import { test, expect } from "@playwright/test";
import { dayKeyIn } from "@/lib/datetime";
import { earnedBadges, liveStreak } from "@/lib/lms/badges";
import { buildPostAssessmentIcs, postOpensDay } from "@/lib/lms/ics";

test("badges follow the server record", () => {
  expect(earnedBadges({ sessionsDone: 0, baseline: false, post: false, bestStreak: 0, facesComplete: 0 })).toEqual([]);
  expect(earnedBadges({ sessionsDone: 1, baseline: true, post: false, bestStreak: 7, facesComplete: 0 })).toEqual([
    "first-session",
    "baseline-set",
    "streak-3",
    "streak-7",
  ]);
  expect(earnedBadges({ sessionsDone: 46, baseline: true, post: true, bestStreak: 30, facesComplete: 6 })).toHaveLength(7);
});

test("a streak is live today, yesterday, or across a gap covered by freezes", () => {
  const s = { current: 9, best: 9, freezes: 1, lastDay: "2026-10-05" };
  expect(liveStreak({ ...s, lastDay: "2026-10-07" }, "2026-10-07")).toBe(9);
  expect(liveStreak({ ...s, lastDay: "2026-10-06" }, "2026-10-07")).toBe(9);
  expect(liveStreak(s, "2026-10-07")).toBe(9); // one missed day, one freeze
  expect(liveStreak({ ...s, freezes: 0 }, "2026-10-07")).toBe(0);
  expect(liveStreak({ ...s, lastDay: null }, "2026-10-07")).toBe(0);
});

test("learner day is worked out in their time zone", () => {
  const lateUtc = new Date("2026-10-07T23:30:00Z"); // 01:30 on 8 Oct in SAST
  expect(dayKeyIn("Africa/Johannesburg", lateUtc)).toBe("2026-10-08");
  expect(dayKeyIn("UTC", lateUtc)).toBe("2026-10-07");
  expect(dayKeyIn("Not/AZone", lateUtc)).toBe("2026-10-08");
});

test("day-21 invite: valid iCalendar on the day the re-measure opens, 09:00 SAST", () => {
  const pre = "2026-10-07T21:30:00Z"; // 23:30 SAST on 7 Oct
  expect(postOpensDay(pre, 21)).toBe("2026-10-28");
  const ics = buildPostAssessmentIcs({
    preCompletedAt: pre,
    minDays: 21,
    programmeName: "Super-Cube® Adults",
    siteUrl: "https://www.super-cube.me/",
    now: new Date("2026-10-07T21:31:00Z"),
  });
  expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  expect(ics).toContain("DTSTART;TZID=Africa/Johannesburg:20261028T090000");
  expect(ics).toContain("DTEND;TZID=Africa/Johannesburg:20261028T093000");
  expect(ics).toContain("DTSTAMP:20261007T213100Z");
  expect(ics).toContain("URL:https://www.super-cube.me/learn/assessment/post");
  expect(ics).toContain("TRIGGER:-PT12H");
  // Commas and line breaks are escaped; no line is longer than 75 octets
  expect(ics).toContain("\\n");
  for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
});
