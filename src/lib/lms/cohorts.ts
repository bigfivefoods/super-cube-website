/**
 * Cohort schedule helpers. Pure, so the rules can be unit-tested without a database.
 * A cohort is a scheduled run inside an organisation. Visibility is enforced in Postgres.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const COHORT_STATUSES = ["draft", "scheduled", "active", "completed", "archived"] as const;
export type CohortStatus = (typeof COHORT_STATUSES)[number];

export type ScheduleInput = {
  startOn: string;
  time: string;
  timeZone: string;
  count: number;
  intervalDays: number;
  durationMinutes: number;
  title: string;
  joinUrl?: string | null;
};

export type PlannedSession = {
  title: string;
  startsAt: string;
  endsAt: string;
  joinUrl: string | null;
  position: number;
};

export function cleanText(raw: unknown, max: number): string {
  return String(raw ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

export function isTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-ZA", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** https URLs only. Userinfo (passwords in the link) is rejected. */
export function cleanJoinUrl(raw: unknown): string | null {
  const text = cleanText(raw, 500);
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error("Join link must be an https address");
  }
  if (url.protocol !== "https:") throw new Error("Join link must start with https://");
  if (url.username || url.password) throw new Error("Join link must not include a username or password");
  return url.href;
}

export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) throw new Error("Use a date and a 24-hour time");
  if (!isTimeZone(timeZone)) throw new Error("Unknown time zone");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = zoneOffsetMs(utcGuess, timeZone);
  const corrected = new Date(utcGuess.getTime() - offset);
  const offset2 = zoneOffsetMs(corrected, timeZone);
  return new Date(utcGuess.getTime() - offset2);
}

export function expandSchedule(input: ScheduleInput): PlannedSession[] {
  if (!Number.isInteger(input.count) || input.count < 1 || input.count > 16) {
    throw new Error("A schedule needs between 1 and 16 sessions");
  }
  if (!Number.isInteger(input.intervalDays) || input.intervalDays < 1 || input.intervalDays > 28) {
    throw new Error("Repeat sessions every 1 to 28 days");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 180) {
    throw new Error("A session runs from 15 to 180 minutes");
  }
  const title = cleanText(input.title, 120);
  if (title.length < 2) throw new Error("Give the sessions a title");
  const joinUrl = cleanJoinUrl(input.joinUrl);
  const first = zonedToUtc(input.startOn, input.time, input.timeZone);
  return Array.from({ length: input.count }, (_, index) => {
    const starts = new Date(first.getTime() + index * input.intervalDays * 86_400_000);
    const ends = new Date(starts.getTime() + input.durationMinutes * 60_000);
    return {
      title: input.count === 1 ? title : `${title} ${index + 1}`,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
      joinUrl,
      position: index + 1,
    };
  });
}

/** "4 Nov 2026, 09:00 Africa/Johannesburg" — the cohort's zone, not the viewer's. */
export function formatInZone(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || !isTimeZone(timeZone)) return iso;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-ZA", {
      timeZone,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const month = (parts.month ?? "").slice(0, 3);
  return `${Number(parts.day)} ${month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.timeZoneName ?? timeZone}`;
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  const hour = parts.hour === "24" ? "0" : parts.hour;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}
