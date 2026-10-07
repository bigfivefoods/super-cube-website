import { expect, test } from "@playwright/test";
import { FALLBACK_COVER, RESERVED_SLUGS, rowToPost, slugify, type NewsRow } from "@/lib/news/db";
import { validatePostInput } from "@/lib/news/validate";
import { cropCover } from "@/lib/news/admin";
import sharp from "sharp";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

const good = {
  title: "Super-Cube® Kids now in schools",
  excerpt: "A short summary of what changed and why it matters.",
  body: "## Heading\n\nA paragraph that is long enough to publish.",
  tag: "Schools",
  coverAlt: "Learners in a classroom",
};

test.describe("news admin", () => {
  test("slugify makes clean, stable web addresses", () => {
    expect(slugify("Super-Cube® LMS: Accelerating leadership development")).toBe(
      "super-cube-lms-accelerating-leadership-development",
    );
    expect(slugify("  Café & Leadership — 2026!  ")).toBe("cafe-and-leadership-2026");
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(90);
  });

  test("code post slugs and route names are reserved", () => {
    expect(RESERVED_SLUGS.has("super-cube-lms-accelerating-leadership-development")).toBe(true);
    expect(RESERVED_SLUGS.has("preview")).toBe(true);
    const r = validatePostInput(form({ ...good, slug: "super-cube-lms-accelerating-leadership-development" }), {
      publish: false,
      hasCover: true,
    });
    expect(r.ok).toBe(false);
  });

  test("drafts need only a title; publishing needs summary, body and cover", () => {
    expect(validatePostInput(form({ title: "Draft idea" }), { publish: false, hasCover: false }).ok).toBe(true);
    const r = validatePostInput(form({ title: "Draft idea" }), { publish: true, hasCover: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["body", "cover", "excerpt"]);
    const ok = validatePostInput(form(good), { publish: true, hasCover: true });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.value.slug).toBe("super-cube-kids-now-in-schools");
      expect(ok.value.status).toBe("published");
    }
  });

  test("a published post keeps its web address", () => {
    const r = validatePostInput(form({ ...good, slug: "something-else" }), {
      publish: true,
      hasCover: true,
      lockedSlug: "original-address",
    });
    expect(r.ok && r.value.slug).toBe("original-address");
  });

  test("control characters are stripped and whitespace tidied", () => {
    const r = validatePostInput(form({ ...good, title: "  Hello\u0007   world  " }), { publish: false, hasCover: false });
    expect(r.ok && r.value.title).toBe("Hello world");
  });

  test("database rows map to posts with a fallback cover for drafts", () => {
    const row: NewsRow = {
      id: "0b7c2a52-6a0e-4a43-9f3e-1d2c3b4a5f60",
      slug: "x-post",
      title: "X",
      excerpt: "",
      body: "",
      tag: "",
      status: "draft",
      cover_image: null,
      cover_wide: null,
      cover_alt: "",
      author: null,
      published_at: null,
      created_at: "2026-10-07T10:00:00Z",
      updated_at: "2026-10-07T10:00:00Z",
    };
    const p = rowToPost(row);
    expect(p.source).toBe("db");
    expect(p.coverImage).toBe(FALLBACK_COVER);
    expect(p.tag).toBe("News");
    expect(p.publishedAt).toBe(row.created_at);
  });
});

test.describe("news cover crops", () => {
  test("covers become a 1440² square and a 1600×1000 landscape, without metadata", async () => {
    const input = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: "#26408c" } })
      .withMetadata({ exif: { IFD0: { Artist: "someone" } } })
      .jpeg()
      .toBuffer();
    const r = await cropCover(input);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const sq = await sharp(r.square).metadata();
    const wd = await sharp(r.wide).metadata();
    expect([sq.width, sq.height, sq.format]).toEqual([1440, 1440, "jpeg"]);
    expect([wd.width, wd.height]).toEqual([1600, 1000]);
    expect(sq.exif).toBeUndefined();
  });

  test("tiny images and non-images are refused", async () => {
    const tiny = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#fff" } }).png().toBuffer();
    expect((await cropCover(tiny)).ok).toBe(false);
    expect((await cropCover(Buffer.from("<svg onload=alert(1)>"))).ok).toBe(false);
  });
});
