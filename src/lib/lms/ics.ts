/**
 * iCalendar invite for the after-programme re-measure (RFC 5545).
 * The event sits on the first day the post-assessment opens, 09:00–09:30 SAST,
 * with a reminder the evening before. No personal data beyond what the learner sees.
 */
import { dayKeyIn } from "@/lib/datetime";

export interface PostInviteInput {
  preCompletedAt: string;
  minDays: number;
  programmeName: string;
  siteUrl?: string;
  now?: Date;
}

function esc(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets (RFC 5545 §3.1). */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let curLen = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (curLen + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
      curLen = 0;
    }
    cur += ch;
    curLen += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** The SAST calendar day the re-measure opens ("YYYY-MM-DD"). */
export function postOpensDay(preCompletedAt: string, minDays: number): string {
  const opens = new Date(Date.parse(preCompletedAt) + minDays * 86_400_000);
  return dayKeyIn("Africa/Johannesburg", opens);
}

export function buildPostAssessmentIcs(input: PostInviteInput): string {
  const site = (input.siteUrl || "https://www.super-cube.me").replace(/\/$/, "");
  const day = postOpensDay(input.preCompletedAt, input.minDays).replace(/-/g, "");
  const url = `${site}/learn/assessment/post`;
  const uid = `post-${day}-${Date.parse(input.preCompletedAt).toString(36)}@super-cube.me`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Super-Cube//Learn//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Africa/Johannesburg",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0200",
    "TZNAME:SAST",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(input.now ?? new Date())}`,
    `DTSTART;TZID=Africa/Johannesburg:${day}T090000`,
    `DTEND;TZID=Africa/Johannesburg:${day}T093000`,
    `SUMMARY:${esc("Super-Cube re-measure: see how you've grown")}`,
    `DESCRIPTION:${esc(
      `Your ${input.programmeName} after-programme assessment opens today. Same six faces as your baseline.\n${url}`,
    )}`,
    `URL:${url}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc("Super-Cube re-measure tomorrow")}`,
    "TRIGGER:-PT12H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
