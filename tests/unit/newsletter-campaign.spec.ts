import { expect, test } from "@playwright/test";
import {
  campaignContentHash,
  campaignEmail,
  defaultCampaignFields,
  listUnsubscribeHeaders,
  teaserSections,
  unsubscribePageUrl,
} from "@/lib/newsletter/campaign";
import { codeNewsPosts } from "@/lib/news/posts";

const SITE = "https://www.super-cube.me";
const post = codeNewsPosts.find((p) => p.slug === "super-cube-lms-accelerating-leadership-development")!;

test.describe("newsletter campaigns", () => {
  test("campaign email: shared newsletter layout, post teaser, utm links, personal unsubscribe", () => {
    const unsub = unsubscribePageUrl(SITE, "tok-123");
    const mail = campaignEmail({ post, fields: defaultCampaignFields(post), unsubscribeUrl: unsub, campaignKey: "news-x", site: SITE });
    expect(mail.subject).toBe(post.title);
    expect(mail.html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(mail.html).toContain("Feed. Educate. Empower.");
    expect(mail.html).toContain(`${SITE}/newsletter/unsubscribe?t=tok-123`);
    expect(mail.html).toContain(`${SITE}/news/${post.slug}?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=news-x`);
    expect(mail.html).toContain(`src="${SITE}${post.coverImage}"`);
    expect(mail.html).toContain("Read the full post");
    expect(mail.html).toContain("Inside this post");
    expect(mail.text).toContain("Unsubscribe: " + unsub);
    for (const m of mail.html.matchAll(/(?:href|src)="([^"]+)"/g)) expect(m[1], m[0]).toMatch(/^(https:\/\/|mailto:)/);
    expect(mail.text.replace(/super-cube\.me/g, "")).not.toMatch(/Super-Cube(?!®)/);
  });

  test("a personal note replaces the summary under the headline", () => {
    const mail = campaignEmail({
      post,
      fields: { subject: "Our new LMS is live", preheader: "", intro: "A note from Craig." },
      unsubscribeUrl: unsubscribePageUrl(SITE, "t"),
      campaignKey: "k",
      site: SITE,
    });
    expect(mail.html).toContain("A note from Craig.");
    expect(mail.html).toContain(post.excerpt.slice(0, 40));
    expect(mail.html).not.toContain("Inside this post");
  });

  test("teaser: opening of up to three sections, in plain text", () => {
    const t = teaserSections(post.body);
    expect(t.length).toBeGreaterThan(0);
    expect(t.length).toBeLessThanOrEqual(3);
    expect(t[0].title).toBe("Six faces, with you at the centre");
    for (const s of t) {
      expect(s.text).not.toMatch(/\*\*|\]\(|^#/);
      expect(s.text.length).toBeLessThanOrEqual(300);
      // A research figure is never cut away from its source.
      if (s.text.includes("+39.5%")) expect(s.text).toContain("UKZN");
    }
  });

  test("one-click unsubscribe headers (RFC 8058)", () => {
    expect(listUnsubscribeHeaders(SITE, "a b")).toEqual({
      "List-Unsubscribe": `<${SITE}/api/newsletter/unsubscribe?t=a%20b>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });

  test("any change to the email needs a new test", () => {
    const f = defaultCampaignFields(post);
    const h = campaignContentHash(post, f);
    expect(campaignContentHash(post, { ...f })).toBe(h);
    expect(campaignContentHash(post, { ...f, subject: f.subject + "!" })).not.toBe(h);
    expect(campaignContentHash({ ...post, body: post.body + "x" }, f)).not.toBe(h);
  });
});
