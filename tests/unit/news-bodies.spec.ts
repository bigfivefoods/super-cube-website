import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { PREFIXED_LOCALES, type PrefixedLocale } from "@/lib/i18n/config";
import { messageKey } from "@/lib/i18n/pages/t";
import { parseMarkdown } from "@/lib/news/markdown";
import { codeNewsPosts } from "@/lib/news/posts";

/**
 * Full article bodies live beside the page catalogues, one file per post and language,
 * so a translated page does not parse every news article.
 */
const LOCALES = PREFIXED_LOCALES;

function bodyOf(locale: PrefixedLocale, slug: string): string {
  const src = readFileSync(`src/lib/i18n/news/bodies/${locale}/${slug}.ts`, "utf8");
  const match = src.match(/const body = `([\s\S]*)`;\n\nexport default body;/);
  expect(match, `${locale}/${slug}`).toBeTruthy();
  return match![1]!;
}

function norm(s: string): string {
  return s.replace(/[\u200e\u200f\u2066\u2067\u2068\u2069]/g, "").replace(/\s+/g, "").replace(/,/g, ".");
}

function targets(md: string): string[] {
  return [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)|\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1] || m[2]!);
}

function shape(md: string): string[] {
  return parseMarkdown(md).map((b) => (b.t === "ul" ? `ul:${b.items.length}` : b.t === "img" ? `img:${b.src}` : b.t));
}

const MUST_HAVE: Record<string, string[]> = {
  "twelve-weeks-six-faces-fmcg-leadership": [
    "+32.2%",
    "+45.1%",
    "+39.5%",
    "+24.6%",
    "+26.6%",
    "+29.7%",
    "+27.7%",
    "52.9%",
    "38.4%",
    "83.5%",
    "88.0%",
    "+56.3%",
    "2020",
  ],
  "leadership-is-learnable-new-book": ["32.2%", "+45.1%", "+39.5%", "+24.6%", "132", "2020", "2021", "17.99", "299", "8.99", "312"],
  "free-super-cube-leadership-book": ["32.2%", "+45.1%", "+39.5%", "+24.6%", "132", "2020", "2021", "71", "94%", "88%"],
  "super-cube-lms-accelerating-leadership-development": ["+39.5%", "R99", "21"],
  "start-free-pay-once-lifetime-access-r99": ["R99", "$6"],
  "grade-12-boarders-leadership-field-snapshot": ["0%", "88%", "94%", "90.9%", "84.8%", "63.6%", "57.5%", "69.7%", "24.2%", "6.1%", "R99", "33"],
};

const NO_132 = new Set([
  "twelve-weeks-six-faces-fmcg-leadership",
  "grade-12-boarders-leadership-field-snapshot",
  "super-cube-lms-accelerating-leadership-development",
  "start-free-pay-once-lifetime-access-r99",
]);

const SCHOOL: Record<PrefixedLocale, string> = {
  fr: "lycée de premier plan en Afrique du Sud",
  pt: "escola secundária de referência na África do Sul",
  af: "toonaangewende hoërskool in Suid-Afrika",
  sw: "shule ya sekondari inayoongoza nchini Afrika Kusini",
  zu: "esikoleni samabanga aphezulu esihamba phambili eNingizimu Afrika",
  ar: "مدرسة ثانوية رائدة في جنوب أفريقيا",
};

const DEEPER: Record<PrefixedLocale, string> = {
  fr: "Commencez gratuitement, puis allez plus loin",
  ar: "ابدأ مجانًا، ثم تعمّق",
  pt: "Comece grátis e aprofunde depois",
  sw: "Anza bure, kisha nenda kwa kina",
  zu: "Qala mahhala, bese uya kubanzi",
  af: "Begin gratis, en gaan dan dieper",
};

const BANNED = /kwaden|westville|hilton|maritzburg|pietermaritzburg|collegian|st john/i;

test.describe("news article bodies", () => {
  test("each code post has a body in every language, loaded on its own", () => {
    const loader = readFileSync("src/lib/i18n/news/body.ts", "utf8");
    expect(loader).not.toMatch(/^import\s+.*(?:i18n\/messages|pages\/catalogues|bodies\/)/m);
    for (const locale of LOCALES) {
      for (const post of codeNewsPosts) {
        expect(loader, `${locale} ${post.slug}`).toContain(`./bodies/${locale}/${post.slug}`);
      }
    }
    const fr = JSON.parse(readFileSync("src/lib/i18n/messages/fr.json", "utf8")) as Record<string, string>;
    const opening = messageKey(codeNewsPosts.find((p) => p.slug === "free-super-cube-leadership-book")!.body.slice(0, 240));
    expect(fr[opening]).toBeUndefined();
  });

  for (const post of codeNewsPosts) {
    for (const locale of LOCALES) {
      test(`${locale} ${post.slug}`, () => {
        const body = bodyOf(locale, post.slug);
        expect(body).not.toBe(post.body);
        expect(shape(body)).toEqual(shape(post.body));
        expect(targets(body)).toEqual(targets(post.body));
        expect((body.match(/Super-Cube®/g) ?? []).length).toBe((post.body.match(/Super-Cube®/g) ?? []).length);
        expect((body.match(/Leadership Is Learnable/g) ?? []).length).toBe(
          (post.body.match(/Leadership Is Learnable/g) ?? []).length,
        );
        expect(body).not.toMatch(BANNED);
        expect(body).not.toMatch(/graduat\w*\s+2020|graduated in 2020|diplôm\w+ en 2020/i);
        const flat = norm(body);
        for (const figure of MUST_HAVE[post.slug] ?? []) {
          expect(flat, figure).toContain(norm(figure));
        }
        if (NO_132.has(post.slug)) expect(body).not.toMatch(/\b132\b/);
        if (post.slug === "grade-12-boarders-leadership-field-snapshot") {
          expect(body).toContain(SCHOOL[locale]);
          expect(flat).not.toContain("32.2%");
          expect(flat).not.toContain("+45.1%");
        }
        if (post.slug === "leadership-is-learnable-new-book") {
          expect(body).toContain(DEEPER[locale]);
        }
        if (post.slug === "free-super-cube-leadership-book" || post.slug === "leadership-is-learnable-new-book") {
          for (const sentence of body.split(/(?<=[.!?؟])\s+/)) {
            if (!sentence.includes("132")) continue;
            expect(sentence, sentence.slice(0, 160)).not.toMatch(/Imana|Kerry|32[,.]2/);
          }
          expect(body).toMatch(/132/);
        }
        if (locale === "fr") {
          expect(body).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})/iu);
          expect(body).toMatch(/(?<!\p{L})(vous|votre|vos)(?!\p{L})/iu);
        }
        if (locale === "ar") expect(body).toMatch(/\p{Script=Arabic}/u);
      });
    }
  }
});
