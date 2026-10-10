/**
 * The free Super-Cube® book (public/super-cube-leadership-book.pdf, English only).
 * One place for the file, its size hint, the cover and the share card: used by /book,
 * the home "Free book" section and the footer. Keep `pages` and `size` in step with the
 * PDF (tests/unit/book.spec.ts checks them).
 */
export const BOOK = {
  title: "The Super-Cube® Leadership Model",
  subtitle: "Igniting Africa's potential and accelerating humanity's progress",
  author: "Dr Craig R. Muller",
  href: "/super-cube-leadership-book.pdf",
  /** Saved file name (the `download` attribute). */
  fileName: "super-cube-leadership-book.pdf",
  pages: 71,
  size: "1.9 MB",
  page: "/book",
  cover: { src: "/images/book/super-cube-leadership-book-cover.jpg", width: 1000, height: 1500 },
  share: { url: "/images/og/super-cube-leadership-book.jpg", width: 1200, height: 630 },
} as const;

/**
 * The comprehensive edition (the paid book, white cover): the extra details shown on /book, the home page,
 * /about, /media and the company profile. Title, subtitle, ISBNs and the Amazon URL live in PAID_BOOK and
 * AMAZON_URL_TBD at the end of this file (shared with the /news launch post).
 */
export const PAID_BOOK_DETAILS = {
  edition: "Comprehensive edition",
  pages: 312,
  format: "Paperback · 6 × 9 in · full colour",
  /** Publication date (ISO) and its label. */
  published: "2026-10-07",
  publishedLabel: "October 2026",
  paperbackPrice: { zar: 299, usd: 17.99 },
  ebookPrice: { zar: 149, usd: 8.99 },
  cover: { src: "/images/book/leadership-is-learnable-cover.jpg", width: 1000, height: 1500 },
  /** In-page anchor on /book. */
  anchor: "comprehensive-edition",
} as const;

/**
 * The Amazon "Buy" link for the paperback, or null while it is not live. Every paperback buy button on the site
 * calls this, so the one switch is AMAZON_URL_TBD: while it is empty or an Amazon *search* placeholder, buttons
 * stay hidden and the site shows "Coming soon on Amazon".
 */
export function amazonBuyUrl(url: string = AMAZON_URL_TBD): string | null {
  const u = (url || "").trim();
  if (!/^https:\/\/(www\.)?amazon\.[a-z.]+\//i.test(u) && !/^https:\/\/amzn\.(to|eu)\//i.test(u)) return null;
  if (/amazon\.[a-z.]+\/s(\/|\?)/i.test(u)) return null; // search placeholder, not a product page
  return u;
}

/** The Kindle "Buy" link (KINDLE_URL_TBD), or null if it is emptied (the site then shows "Kindle edition coming soon"). */
export function kindleBuyUrl(url: string = KINDLE_URL_TBD): string | null {
  return amazonBuyUrl(url);
}

/** How to cite the comprehensive edition (APA style). */
export const PAID_BOOK_CITATION =
  "Muller, C. R. (2026). Leadership is learnable: The Super-Cube® model, the evidence behind it, and how to develop leaders at every level. Big Five Group. ISBN 978-1-0483-6161-2 (paperback); ISBN 978-1-0483-6160-5 (EPUB/Kindle).";

/** Chapters and their subtitles, as in the book's contents. */
export const BOOK_CHAPTERS: readonly { n?: number; title: string; note: string }[] = [
  { title: "Foreword", note: "Dr Housainou Taal, Director, African Leadership Institute" },
  { n: 1, title: "The Leadership Imperative", note: "Why Africa holds the key to humanity's future" },
  { n: 2, title: "The Genesis of the Super-Cube®", note: "From thesis to transformation" },
  { n: 3, title: "Understanding the Cube", note: "The six dimensions of Super-Leadership" },
  { n: 4, title: "Choices", note: "The courage to decide in the fog of uncertainty" },
  { n: 5, title: "Principles", note: "The unshakeable compass" },
  { n: 6, title: "Mental", note: "The strategic mind that sees around corners" },
  { n: 7, title: "Emotional", note: "The heart that connects and inspires" },
  { n: 8, title: "Physical", note: "The sustainable vessel for long-haul leadership" },
  { n: 9, title: "Spiritual", note: "The purpose that transcends and sustains" },
  { n: 10, title: "From Self to Society", note: "Scaling the Super-Cube® across levels" },
  { n: 11, title: "Leaders for the Global Goals", note: "Why the world's to-do list needs leaders, and why we must build them" },
  { n: 12, title: "The Big Five Way", note: "Real-world application across Africa" },
  { n: 13, title: "Your Super-Cube® Action Plan", note: "Start today, lead tomorrow" },
  { title: "Epilogue: A Super-Cube® World Awaits", note: "Leadership for the generations to come" },
  { title: "Resources and Next Steps", note: "Further reading, research and where to go next" },
];

/**
 * The paid book, Leadership Is Learnable (white cover, Big Five Group), by Dr Craig R. Muller.
 * The free book above stays the free starting point. Used by the /news launch post (src/lib/news/posts.ts).
 *
 * AMAZON_URL_TBD is the Amazon product URL of the PAPERBACK (ASIN 1048361616), live since October 2026; every
 * paperback Amazon link on the site reads it from here (the name is kept so older notes still match).
 *
 * KINDLE_URL_TBD is the Amazon product URL of the KINDLE e-book (ASIN B0HMLR6QRP), live since 10 Oct 2026: every
 * "Buy the Kindle e-book on Amazon" button reads it. Empty it to go back to "Kindle edition coming soon".
 */
export const AMAZON_URL_TBD = "https://www.amazon.com/dp/1048361616";
export const KINDLE_URL_TBD = "https://www.amazon.com/dp/B0HMLR6QRP";

export const PAID_BOOK = {
  title: "Leadership Is Learnable",
  subtitle: "The Super-Cube® model, the evidence behind it, and how to develop leaders at every level",
  author: "Dr Craig R. Muller",
  imprint: "Big Five Group",
  amazonUrl: AMAZON_URL_TBD,
  paperback: { isbn: "978-1-0483-6161-2", pages: 312, price: "R299 / $17.99" },
  kindle: { isbn: "978-1-0483-6160-5", price: "$8.99 (about R149)" },
} as const;
