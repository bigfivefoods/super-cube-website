/**
 * One shared definition of "a learner's day" for every date-keyed feature
 * (streak, micro-practice log, reminders, weekly goal, spaced reviews).
 *
 * Always the device's LOCAL calendar day. Never `toISOString().slice(0, 10)`,
 * which is the UTC day: in South Africa (UTC+2) that is still "yesterday"
 * between 00:00 and 02:00, which used to split one night's activity across
 * two days and could reset a streak.
 */

/** Local calendar day YYYY-MM-DD for a moment (default: now). */
export function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True for a well-formed YYYY-MM-DD key. */
export function isDayKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Whole days from `a` to `b` (b − a), using the calendar dates only. */
export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** The day key `n` days after `key` (n may be negative). */
export function addDays(key: string, n: number): string {
  const t = Date.parse(`${key}T12:00:00Z`) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10); // noon UTC keeps the same calendar date
}

/** Monday of the week containing `key` (weeks run Monday to Sunday). */
export function weekStartKey(key: string = localDayKey()): string {
  const dow = new Date(`${key}T12:00:00Z`).getUTCDay(); // 0 Sunday … 6 Saturday
  return addDays(key, -((dow + 6) % 7));
}

/** The local day an ISO timestamp fell on, for this device. */
export function localDayOfIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? localDayKey(new Date(t)) : null;
}

export type StreakState = { current: number; best: number; lastDate: string | null };

export type StreakStep = {
  streak: StreakState;
  freezes: number;
  /** Freezes spent covering missed days on this step */
  freezesUsed: number;
  /** A freeze was earned on this step (every 7 days in a row, hold at most 2) */
  freezeEarned: boolean;
};

/** Freezes are earned every 7 days in a row; a learner holds at most this many. */
export const MAX_STREAK_FREEZES = 2;
export const FREEZE_EVERY_DAYS = 7;

/**
 * Move a streak forward for activity on `today` (a local day key).
 *
 * - Same day: unchanged.
 * - A stored day AHEAD of today (old builds keyed some activity by the UTC day,
 *   which runs a day ahead for learners west of UTC): treated as today, never a reset.
 * - Next day: +1.
 * - Missed days covered by held freezes: freezes are spent and the streak continues.
 * - Otherwise: a new streak of 1.
 *
 * Mirrors the server rule in lms_record_activity so signed-in and device streaks agree.
 */
export function advanceStreak(prev: StreakState | null | undefined, freezes: number, today: string): StreakStep {
  const held = Math.max(0, Math.min(MAX_STREAK_FREEZES, Math.floor(freezes || 0)));
  const s: StreakState = {
    current: Math.max(0, Math.floor(prev?.current ?? 0)),
    best: Math.max(0, Math.floor(prev?.best ?? 0)),
    lastDate: isDayKey(prev?.lastDate) ? prev!.lastDate : null,
  };
  let used = 0;
  let grew = false;
  if (!s.lastDate) {
    s.current = 1;
    grew = true;
  } else {
    const gap = dayDiff(s.lastDate, today);
    if (gap <= 0) {
      // same day, or a legacy UTC key that is "ahead": keep the streak, re-key to today
      if (s.current < 1) s.current = 1;
    } else if (gap === 1) {
      s.current += 1;
      grew = true;
    } else if (gap - 1 <= held) {
      used = gap - 1;
      s.current += 1;
      grew = true;
    } else {
      s.current = 1;
      grew = true;
    }
  }
  let left = held - used;
  let earned = false;
  if (grew && s.current > 0 && s.current % FREEZE_EVERY_DAYS === 0 && left < MAX_STREAK_FREEZES) {
    left += 1;
    earned = true;
  }
  s.best = Math.max(s.best, s.current);
  s.lastDate = today;
  return { streak: s, freezes: left, freezesUsed: used, freezeEarned: earned };
}
