import { expect, test } from "@playwright/test";
import { codeNewsPosts } from "@/lib/news/posts";
import { clampDescription, newsTitleTag } from "@/lib/news/seo";

test.describe("news <title>", () => {
  test("the LMS post has a short title that keeps Super-Cube® whole", () => {
    const post = codeNewsPosts.find((p) => p.slug === "super-cube-lms-accelerating-leadership-development")!;
    const title = newsTitleTag(post);
    expect(title).toBe("Super-Cube® LMS: accelerating leadership development");
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain("Super-Cube®");
  });

  test("no post title is ever cut inside a word (Super-Cube® stays whole)", () => {
    for (const post of codeNewsPosts) {
      const title = newsTitleTag(post);
      expect(title, post.slug).not.toMatch(/Super-Cube…|Super-Cube(?!®)/);
    }
  });

  test("short budgets cut at a word break", () => {
    expect(clampDescription("Accelerating leadership development with the new Super-Cube® LMS", 60)).toBe(
      "Accelerating leadership development with the new…",
    );
    expect(clampDescription("Short title", 60)).toBe("Short title");
  });
});
