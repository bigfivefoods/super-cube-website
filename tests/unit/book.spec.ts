import { readFileSync } from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { expect, test } from "@playwright/test";
import { BOOK, BOOK_CHAPTERS } from "../../src/lib/book";
import { DICTS } from "../../src/lib/i18n/dictionaries";
import en from "../../src/lib/i18n/dict/en";

/**
 * The free book (public/super-cube-leadership-book.pdf): /book, the home "Free book"
 * section and the footer. The PDF is English; links to it use `download`.
 */

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

/** PDF bytes plus every inflatable stream (object streams hide /Type /Page). */
function pdfText(buf: Buffer): string {
  const parts = [buf.toString("latin1")];
  let i = 0;
  while ((i = buf.indexOf("stream", i)) !== -1) {
    let s = i + 6;
    if (buf[s] === 0x0d) s++;
    if (buf[s] === 0x0a) s++;
    const e = buf.indexOf("endstream", s);
    if (e === -1) break;
    try {
      parts.push(inflateSync(buf.subarray(s, e)).toString("latin1"));
    } catch {
      /* not a Flate stream */
    }
    i = e + 9;
  }
  return parts.join("\n");
}

/** Width and height of a baseline/progressive JPEG (first SOF marker). */
function jpegSize(buf: Buffer): { width: number; height: number } {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error("bad JPEG");
    const marker = buf[i + 1]!;
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error("no SOF");
}

test("book PDF exists, is a tagged PDF under 5 MB, and the size hint matches it", () => {
  const buf = readFileSync(path.join(ROOT, "public", BOOK.href));
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeLessThan(5 * 1024 * 1024);
  const all = pdfText(buf);
  expect(all).toContain("/MarkInfo");
  expect((all.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length).toBe(BOOK.pages);
  expect(BOOK.size).toMatch(/^\d+(\.\d)? MB$/);
  expect(Math.abs(buf.length / 1_000_000 - Number.parseFloat(BOOK.size))).toBeLessThan(0.1);
  expect(BOOK.fileName).toBe(path.basename(BOOK.href));
});

test("cover (2:3) and share card (1200×630) are optimised JPEGs", () => {
  const cover = readFileSync(path.join(ROOT, "public", BOOK.cover.src));
  expect(jpegSize(cover)).toEqual({ width: BOOK.cover.width, height: BOOK.cover.height });
  expect(BOOK.cover.width * 3).toBe(BOOK.cover.height * 2);
  expect(cover.length).toBeLessThan(200_000);
  const share = readFileSync(path.join(ROOT, "public", BOOK.share.url));
  expect(jpegSize(share)).toEqual({ width: 1200, height: 630 });
  expect(share.length).toBeLessThan(150_000);
});

test("/book: download links, share card, chapters, sitemap and breadcrumbs", () => {
  const page = read("src/app/book/page.tsx");
  expect(page).toMatch(/href=\{BOOK\.href\}[\s\S]{0,40}\bdownload\b/);
  expect(page).toContain("BOOK.share.url");
  expect(page).toContain('"@type": "Book"');
  expect(BOOK_CHAPTERS.filter((c) => c.n).map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  expect(read("src/app/sitemap.ts")).toContain('"/book"');
  expect(read("src/lib/breadcrumbs.ts")).toContain('"/book": { label: "Free book", i18n: "footer.book" }');
  expect(read("src/lib/hero-media.ts")).toMatch(/darkHeroPaths = \[[\s\S]*"\/book"/);
});

test("home section and footer link to the book; the PDF and /book are marked English", () => {
  const home = read("src/components/home/HomeLanding.tsx");
  expect(home).toContain('data-testid="home-book"');
  expect(home).toMatch(/href=\{BOOK\.href\}\s+hrefLang=\{en\}\s+download/);
  expect(home).toMatch(/href=\{BOOK\.page\} hrefLang=\{en\}/);
  // The new section sits below the hero, never inside it.
  expect(home.indexOf('data-testid="home-book"')).toBeGreaterThan(home.indexOf("{/* What it is */}"));
  const footer = read("src/components/Footer.tsx");
  expect(footer).toContain('{ href: "/book", label: "Free book", key: "footer.book" }');
  expect(footer.indexOf('"/book"')).toBeGreaterThan(footer.indexOf('label: "Research & media"'));
  expect(footer.indexOf('"/book"')).toBeLessThan(footer.indexOf('label: "Sign in"'));
});

test("new strings exist in all seven dictionaries; label in name; brand keeps ®", () => {
  const keys = [
    "footer.book",
    "home.bookEyebrow",
    "home.bookHeading",
    "home.bookBody",
    "home.bookCta",
    "home.bookMeta",
    "home.bookLabel",
    "home.bookMore",
    "home.bookLang",
    "home.bookCoverAlt",
  ] as const;
  for (const [lang, dict] of Object.entries(DICTS)) {
    for (const k of keys) {
      const v = dict[k];
      expect(v, `${lang} ${k}`).toBeTruthy();
      if (lang !== "en" && k !== "home.bookMeta") expect(v, `${lang} ${k} is translated`).not.toBe(en[k]);
    }
    expect(dict["home.bookLabel"]!.startsWith(dict["home.bookCta"]!), `${lang} label starts with the visible text`).toBe(true);
    expect(dict["home.bookCoverAlt"]).toContain("Super-Cube®");
  }
});
