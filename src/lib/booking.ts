/**
 * "Book a call" destination. Craig hasn't chosen a calendar tool yet, so this
 * reads BOOKING_URL (e.g. a Cal.com / Calendly link) and falls back to the
 * contact page until it is set.
 */
export function bookingUrl(): string {
  const url = process.env.BOOKING_URL?.trim();
  return url && /^https?:\/\//.test(url) ? url : "/contact";
}

export function bookingIsExternal(): boolean {
  return bookingUrl().startsWith("http");
}
