import { expect, test } from "@playwright/test";
import { cleanJoinUrl, expandSchedule, formatInZone, zonedToUtc } from "@/lib/lms/cohorts";

test("a Johannesburg session is stored in UTC and shown in the cohort zone", () => {
  const utc = zonedToUtc("2026-11-04", "09:00", "Africa/Johannesburg");
  expect(utc.toISOString()).toBe("2026-11-04T07:00:00.000Z");
  expect(formatInZone(utc.toISOString(), "Africa/Johannesburg")).toContain("09:00");
  expect(formatInZone(utc.toISOString(), "Africa/Johannesburg")).toContain("4 Nov 2026");
});

test("a weekly schedule expands without sharing a join secret", () => {
  const sessions = expandSchedule({
    startOn: "2026-11-04",
    time: "09:00",
    timeZone: "Africa/Johannesburg",
    count: 3,
    intervalDays: 7,
    durationMinutes: 90,
    title: "Live lab",
    joinUrl: "https://meet.example.com/super-cube",
  });
  expect(sessions.map((session) => session.title)).toEqual(["Live lab 1", "Live lab 2", "Live lab 3"]);
  expect(sessions[1].startsAt).toBe("2026-11-11T07:00:00.000Z");
  expect(sessions[0].endsAt).toBe("2026-11-04T08:30:00.000Z");
  expect(sessions[0].joinUrl).toBe("https://meet.example.com/super-cube");
  expect(() => cleanJoinUrl("http://meet.example.com/room")).toThrow(/https/);
  expect(() => cleanJoinUrl("https://user:secret@meet.example.com/room")).toThrow(/password/);
  expect(cleanJoinUrl("  ")).toBeNull();
});

test("schedule limits stay small", () => {
  expect(() =>
    expandSchedule({
      startOn: "2026-11-04",
      time: "09:00",
      timeZone: "Africa/Johannesburg",
      count: 40,
      intervalDays: 7,
      durationMinutes: 60,
      title: "Too many",
    }),
  ).toThrow(/16/);
});
