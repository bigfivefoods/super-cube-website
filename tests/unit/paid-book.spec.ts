import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { AMAZON_URL_TBD, PAID_BOOK, PAID_BOOK_CITATION, PAID_BOOK_DETAILS, amazonBuyUrl } from "../../src/lib/book";
import { AUTHOR_BIO } from "../../src/lib/author";
import { DICTS } from "../../src/lib/i18n/dictionaries";
import en from "../../src/lib/i18n/dict/en";
import { AGE_BANDS, findAgeBand } from "../../src/lib/lms/profile";
import { isMinorBand } from "../../src/lib/lms/server/share-links";

/**
 * Leadership Is Learnable, the comprehensive edition (the paid book): /book, the home card,
 * /about, /media, /research. Buy buttons stay hidden until AMAZON_URL_TBD is a real product URL.
 */

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

test("book facts: ISBNs, pages, prices, publication date", () => {
  expect(PAID_BOOK.paperback.isbn).toBe("978-1-0483-6161-2");
  expect(PAID_BOOK.kindle.isbn).toBe("978-1-0483-6160-5");
  expect(PAID_BOOK_DETAILS.pages).toBe(312);
  expect(PAID_BOOK_DETAILS.paperbackPrice).toEqual({ zar: 299, usd: 17.99 });
  expect(PAID_BOOK_DETAILS.ebookPrice).toEqual({ zar: 149, usd: 8.99 });
  expect(PAID_BOOK_DETAILS.published).toBe("2026-10-31");
  expect(PAID_BOOK_CITATION).toContain("ISBN 978-1-0483-6161-2");
  expect(PAID_BOOK_CITATION).toContain("Super-Cube®");
});

test("Amazon buttons: hidden while AMAZON_URL_TBD is empty or a search URL, shown for a product URL", () => {
  expect(amazonBuyUrl("")).toBeNull();
  expect(amazonBuyUrl("https://www.amazon.com/s?k=9781048361612")).toBeNull();
  expect(amazonBuyUrl("https://example.com/dp/B000")).toBeNull();
  expect(amazonBuyUrl("https://www.amazon.com/dp/1048361611")).toBe("https://www.amazon.com/dp/1048361611");
  // Today the switch is still the launch-post placeholder, so nothing is buyable yet.
  if (/\/s\?/.test(AMAZON_URL_TBD) || !AMAZON_URL_TBD) expect(amazonBuyUrl()).toBeNull();
});

test("cover is a 2:3 optimised JPEG", () => {
  const buf = readFileSync(path.join(ROOT, "public", PAID_BOOK_DETAILS.cover.src));
  expect(buf.subarray(0, 2).toString("hex")).toBe("ffd8");
  expect(PAID_BOOK_DETAILS.cover.width * 3).toBe(PAID_BOOK_DETAILS.cover.height * 2);
  expect(buf.length).toBeLessThan(200_000);
});

test("pages use the gated button and schema.org Book without a hard-coded Amazon link", () => {
  expect(read("src/app/book/page.tsx")).toContain("<PaidBookSection />");
  expect(read("src/app/book/page.tsx")).toContain("paidBookJsonLd()");
  expect(read("src/components/home/HomeLanding.tsx")).toContain('testId="home-paid-book"');
  for (const rel of ["src/components/book/PaidBook.tsx", "src/app/about/page.tsx", "src/app/media/page.tsx"]) {
    expect(read(rel), rel).not.toMatch(/amazon\.(com|co\.za)/);
  }
});

test("author bio: from the book, with Pietermaritzburg, the degrees and Georgia and Benjamin", () => {
  const bio = AUTHOR_BIO.join(" ");
  for (const s of ["Pietermaritzburg", "December 2020 and conferred in 2021", "ten directors", "University of Natal (2002)", "Georgia and Benjamin", "Super-Cube®"]) {
    expect(bio).toContain(s);
  }
  expect(bio).not.toContain("Super-Cube®®");
  expect(read("src/app/about/page.tsx")).toContain("AUTHOR_BIO.map");
  expect(read("src/app/media/page.tsx")).toContain("AUTHOR_BIO.map");
  expect(read("src/app/speaking/page.tsx")).toContain("Author of Leadership Is Learnable (2026)");
});

test("home card strings are in all seven dictionaries", () => {
  const keys = ["home.paidEyebrow", "home.paidBody", "home.paidMore", "home.paidSoon", "home.paidBuy", "home.paidCoverAlt"] as const;
  for (const [lang, dict] of Object.entries(DICTS)) {
    for (const k of keys) {
      expect(dict[k], `${lang} ${k}`).toBeTruthy();
      if (lang !== "en") expect(dict[k], `${lang} ${k} is translated`).not.toBe(en[k]);
    }
    expect(dict["home.paidCoverAlt"]).toContain("Leadership Is Learnable");
  }
});

test("age bands: 18–21 is the adolescent programme, 22–24 the adult one; legacy 18-24 still resolves", () => {
  expect(findAgeBand("18-21")?.programmeId).toBe("adolescents");
  expect(findAgeBand("22-24")?.programmeId).toBe("adults");
  expect(findAgeBand("18-24")?.programmeId).toBe("adolescents");
  expect(AGE_BANDS.some((b) => b.id === "18-24")).toBe(false);
  expect(isMinorBand("18-21")).toBe(false);
  expect(isMinorBand("22-24")).toBe(false);
});
