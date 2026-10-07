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
  pages: 67,
  size: "1.9 MB",
  page: "/book",
  cover: { src: "/images/book/super-cube-leadership-book-cover.jpg", width: 1000, height: 1500 },
  share: { url: "/images/og/super-cube-leadership-book.jpg", width: 1200, height: 630 },
} as const;

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
