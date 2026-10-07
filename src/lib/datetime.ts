/**
 * South African date and time formatting (en-ZA, Africa/Johannesburg).
 * "7 Oct 2026" and "7 Oct 2026, 09:43" — no leading zero on the day, 24-hour time.
 */
export const SA_TIME_ZONE = "Africa/Johannesburg";

function parts(d: Date, opts: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-ZA", { timeZone: SA_TIME_ZONE, ...opts }).formatToParts(d)) {
    out[p.type] = p.value;
  }
  return out;
}

function toDate(v: string | number | Date | null | undefined): Date | null {
  if (v == null || v === "") return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "7 Oct 2026" (or the fallback when empty / invalid). */
export function formatDateZA(v: string | number | Date | null | undefined, fallback = "—"): string {
  const d = toDate(v);
  if (!d) return fallback;
  const p = parts(d, { day: "numeric", month: "short", year: "numeric" });
  // Three-letter months throughout (ICU gives "Sept" for en-ZA)
  return `${Number(p.day)} ${p.month.slice(0, 3)} ${p.year}`;
}

/** "7 Oct 2026, 09:43" in SAST. */
export function formatDateTimeZA(v: string | number | Date | null | undefined, fallback = "—"): string {
  const d = toDate(v);
  if (!d) return fallback;
  const p = parts(d, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${formatDateZA(d)}, ${p.hour}:${p.minute}`;
}

/** Whole days between two instants (b − a), floored. */
export function daysBetween(a: string | Date, b: string | Date = new Date()): number {
  const x = toDate(a);
  const y = toDate(b);
  if (!x || !y) return 0;
  return Math.floor((y.getTime() - x.getTime()) / 86_400_000);
}
