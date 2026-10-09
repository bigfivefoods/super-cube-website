import { expect, test } from "@playwright/test";
import { addDays, advanceStreak, dayDiff, localDayKey, localDayOfIso, weekStartKey } from "@/lib/lms/day";

// Learners are in South Africa (UTC+2): the UTC day lags the local day from 00:00 to 02:00.
process.env.TZ = "Africa/Johannesburg";

test.describe("local day keys (SAST)", () => {
  test("00:00–02:00 SAST is already the new local day, though UTC is still yesterday", () => {
    for (const utc of ["2026-10-08T22:00:00Z", "2026-10-08T22:30:00Z", "2026-10-08T23:59:59Z"]) {
      const d = new Date(utc); // 00:00, 00:30 and 01:59:59 SAST on 9 October
      expect(d.toISOString().slice(0, 10)).toBe("2026-10-08");
      expect(localDayKey(d)).toBe("2026-10-09");
    }
    expect(localDayKey(new Date("2026-10-09T00:00:00Z"))).toBe("2026-10-09"); // 02:00 SAST
    expect(localDayKey(new Date("2026-10-08T21:59:59Z"))).toBe("2026-10-08"); // 23:59:59 SAST
  });

  test("local day of an ISO timestamp", () => {
    expect(localDayOfIso("2026-10-08T23:15:00.000Z")).toBe("2026-10-09");
    expect(localDayOfIso(null)).toBeNull();
    expect(localDayOfIso("nonsense")).toBeNull();
  });

  test("day arithmetic crosses months and years", () => {
    expect(dayDiff("2026-10-08", "2026-10-09")).toBe(1);
    expect(dayDiff("2026-12-31", "2027-01-01")).toBe(1);
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
    expect(addDays("2026-10-09", -9)).toBe("2026-09-30");
    expect(weekStartKey("2026-10-09")).toBe("2026-10-05"); // Friday → Monday
    expect(weekStartKey("2026-10-11")).toBe("2026-10-05"); // Sunday → Monday
    expect(weekStartKey("2026-10-12")).toBe("2026-10-12");
  });
});

test.describe("advanceStreak", () => {
  test("late-evening then just-after-midnight SAST counts as two days in a row", () => {
    const evening = localDayKey(new Date("2026-10-08T20:30:00Z")); // 22:30 SAST, 8 Oct
    const night = localDayKey(new Date("2026-10-08T22:45:00Z")); // 00:45 SAST, 9 Oct
    const a = advanceStreak(null, 0, evening);
    const b = advanceStreak(a.streak, a.freezes, night);
    expect(b.streak.current).toBe(2);
    expect(b.streak.lastDate).toBe("2026-10-09");
  });

  test("two activities between 00:00 and 02:00 SAST are the same day", () => {
    const one = localDayKey(new Date("2026-10-08T22:05:00Z"));
    const two = localDayKey(new Date("2026-10-08T23:55:00Z"));
    const a = advanceStreak({ current: 4, best: 4, lastDate: "2026-10-08" }, 0, one);
    const b = advanceStreak(a.streak, a.freezes, two);
    expect(a.streak.current).toBe(5);
    expect(b.streak.current).toBe(5);
  });

  test("first activity starts at 1; same day is unchanged", () => {
    const a = advanceStreak(undefined, 0, "2026-10-09");
    expect(a.streak).toEqual({ current: 1, best: 1, lastDate: "2026-10-09" });
    expect(advanceStreak(a.streak, 0, "2026-10-09").streak.current).toBe(1);
  });

  test("never corrupts a stored streak keyed by an older day format", () => {
    // Older builds keyed micro-practice by the UTC day, which can sit a day behind or ahead.
    const behind = advanceStreak({ current: 6, best: 9, lastDate: "2026-10-08" }, 0, "2026-10-09");
    expect(behind.streak).toEqual({ current: 7, best: 9, lastDate: "2026-10-09" });
    const ahead = advanceStreak({ current: 6, best: 9, lastDate: "2026-10-10" }, 0, "2026-10-09");
    expect(ahead.streak).toEqual({ current: 6, best: 9, lastDate: "2026-10-09" });
    const tomorrow = advanceStreak(ahead.streak, 0, "2026-10-10");
    expect(tomorrow.streak.current).toBe(7);
    // Garbage in storage is treated as "no last day", not a crash
    const junk = advanceStreak({ current: 3, best: 3, lastDate: "yesterday" }, 0, "2026-10-09");
    expect(junk.streak.current).toBe(1);
    expect(junk.streak.best).toBe(3);
  });

  test("a missed day without a freeze starts again but keeps the best", () => {
    const s = advanceStreak({ current: 5, best: 5, lastDate: "2026-10-06" }, 0, "2026-10-09");
    expect(s.streak).toEqual({ current: 1, best: 5, lastDate: "2026-10-09" });
    expect(s.freezesUsed).toBe(0);
  });

  test("a freeze is earned every 7 days in a row, holding at most 2", () => {
    let st = { current: 0, best: 0, lastDate: null as string | null };
    let freezes = 0;
    const earnedOn: number[] = [];
    for (let i = 0; i < 28; i++) {
      const step = advanceStreak(st, freezes, addDays("2026-09-01", i));
      st = step.streak;
      freezes = step.freezes;
      if (step.freezeEarned) earnedOn.push(st.current);
    }
    expect(st.current).toBe(28);
    expect(earnedOn).toEqual([7, 14]);
    expect(freezes).toBe(2);
  });

  test("freezes cover missed days, one each", () => {
    const one = advanceStreak({ current: 9, best: 9, lastDate: "2026-10-07" }, 1, "2026-10-09");
    expect(one.streak.current).toBe(10);
    expect(one.freezesUsed).toBe(1);
    expect(one.freezes).toBe(0);
    const two = advanceStreak({ current: 9, best: 9, lastDate: "2026-10-06" }, 2, "2026-10-09");
    expect(two.streak.current).toBe(10);
    expect(two.freezes).toBe(0);
    const tooMany = advanceStreak({ current: 9, best: 9, lastDate: "2026-10-05" }, 2, "2026-10-09");
    expect(tooMany.streak.current).toBe(1);
    expect(tooMany.freezes).toBe(2); // not spent on a gap they cannot cover
    const clamp = advanceStreak({ current: 2, best: 2, lastDate: "2026-10-08" }, 7, "2026-10-09");
    expect(clamp.freezes).toBe(2);
  });
});
