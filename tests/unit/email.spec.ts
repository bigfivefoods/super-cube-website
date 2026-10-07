import { expect, test } from "@playwright/test";
import { button, esc, newsletterEmail, renderEmail, paragraph } from "../../src/lib/email/layout";
import { sameSiteUrl, verifiedRecipient } from "../../src/lib/email/recipient";
import { SAMPLE_IDS, sampleEmail } from "../../src/lib/email/samples";
import { formatAmount, receiptEmail, weeklyEmail, welcomeEmail } from "../../src/lib/email/templates";

const SITE = "https://www.super-cube.me";

test.describe("branded email layout", () => {
  for (const id of SAMPLE_IDS) {
    test(`${id}: shell, brand, footer, dark mode and plain text`, () => {
      const e = sampleEmail(id, { site: SITE });
      const { html, text, subject } = e;
      expect(subject).toContain("Super-Cube®");
      expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
      // Hosted logo (absolute URL) with alt text, plus the dark-mode logo swap
      expect(html).toContain(`src="${SITE}/email/super-cube-logo.png"`);
      expect(html).toContain(`src="${SITE}/email/super-cube-logo-light.png"`);
      expect(html).toMatch(/alt="Super-Cube®"/);
      // Preheader, dark mode and Outlook support
      expect(html).toContain("display:none;font-size:1px");
      expect(html).toContain("prefers-color-scheme:dark");
      expect(html).toContain('name="color-scheme" content="light dark"');
      expect(html).toContain("<!--[if mso]>");
      expect(html).toContain("v:roundrect");
      // Footer: Big Five Group style
      expect(html).toContain("Feed. Educate. Empower.");
      expect(html).toContain("Big Five Learn");
      expect(html).toContain("https://bigfivegroup.africa");
      expect(html).toContain("hello@super-cube.me");
      // Every link and image is absolute
      for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        expect(m[1], m[0]).toMatch(/^(https:\/\/|mailto:)/);
      }
      // Brand is always marked
      expect(text.replace(/super-cube\.me/g, "")).not.toMatch(/Super-Cube(?!®)/);
      expect(html.replace(/super-cube[.-]/g, "")).not.toMatch(/Super-Cube(?!®)/i);
      // Plain text: real content, no markup
      expect(text).not.toMatch(/<[a-z!/]/i);
      expect(text).toContain("Feed. Educate. Empower.");
      expect(text.length).toBeGreaterThan(300);
    });
  }

  test("programme accents follow programme-theme.ts", () => {
    expect(sampleEmail("welcome-purchase", { site: SITE, programmeId: "kids" }).html).toContain("#7DD3FC");
    const teen = sampleEmail("welcome-purchase", { site: SITE, programmeId: "adolescents" }).html;
    expect(teen).toContain("#BE185D");
    expect(teen).toContain("#6D28D9");
    const adults = sampleEmail("welcome-purchase", { site: SITE, programmeId: "adults" }).html;
    expect(adults).toContain("#0B1320");
    expect(adults).toContain("#E9CF97");
  });

  test("dynamic values are escaped", () => {
    const e = welcomeEmail({ site: SITE, name: `<img src=x onerror=alert(1)>`, programmeId: "adults", mode: "demo" });
    expect(e.html).not.toContain("<img src=x");
    expect(esc(`"<&>'`)).toBe("&quot;&lt;&amp;&gt;&#39;");
    expect(button({ href: "javascript:alert(1)", label: "x" }).html).not.toContain("javascript:");
    expect(paragraph("<b>").html).toContain("&lt;b&gt;");
  });

  test("receipt: R99 lifetime access that never expires", () => {
    const e = receiptEmail({ site: SITE, programmeId: "adults", amountMinor: 9900, currency: "ZAR", reference: "REF-1", paidAt: "2026-10-07T11:05:00Z" });
    expect(e.html).toContain("R99.00");
    expect(e.html).toContain("Lifetime access");
    expect(e.html).toContain("never expires");
    expect(e.text).toContain("REF-1");
    expect(e.text).toContain("7 October 2026, 13:05 SAST");
    expect(e.html).not.toMatch(/renew|expires on|monthly/i);
    expect(e.html).not.toContain("Unsubscribe");
  });

  test("newsletter layout carries unsubscribe; transactional emails don't", () => {
    const n = newsletterEmail({
      subject: "Super-Cube® newsletter",
      preheader: "p",
      issueLabel: "Issue 1",
      title: "T",
      sections: [{ title: "S", paragraphs: ["Body"], face: "choices" }],
      unsubscribeUrl: `${SITE}/newsletter/unsubscribe?t=abc`,
      site: SITE,
    });
    expect(n.html).toContain(`${SITE}/newsletter/unsubscribe?t=abc`);
    expect(n.text).toContain("Unsubscribe:");
    expect(sampleEmail("welcome-demo", { site: SITE }).html).not.toContain("Unsubscribe");
    const r = renderEmail({ subject: "s", preheader: "p", title: "t", blocks: [], footer: { reason: "r" }, site: SITE });
    expect(r.html).toContain("Feed. Educate. Empower.");
  });

  test("weekly: face chips for named faces, journals never included", () => {
    const e = weeklyEmail({ site: SITE, name: "Ann Lee", focus: "Emotional and choices", weekLabel: "Week 2" });
    expect(e.html).toContain("#367638"); // Emotional
    expect(e.html).toContain("#B32026"); // Choices
    expect(e.text).toContain("never includes your reflection text");
    expect(e.subject).toBe("Super-Cube® · Week 2");
  });

  test("amounts", () => {
    expect(formatAmount(9900, "ZAR")).toBe("R99.00");
    expect(formatAmount(168300, "ZAR")).toBe("R1,683.00");
    expect(formatAmount(600, "USD")).toBe("$6.00 USD");
  });
});

test.describe("self-service email recipient (lockdown)", () => {
  const confirmed = { id: "u1", email: "Learner@Example.com", email_confirmed_at: "2026-10-01T00:00:00Z", user_metadata: { full_name: "Ann <Lee>" } };

  test("only a signed-in user's own confirmed email qualifies", () => {
    expect(verifiedRecipient(null)).toBeNull();
    expect(verifiedRecipient({ ...confirmed, email_confirmed_at: null })).toBeNull();
    expect(verifiedRecipient({ ...confirmed, email: "" })).toBeNull();
    expect(verifiedRecipient({ ...confirmed, email: "x@demo.local" })).toBeNull();
    expect(verifiedRecipient(confirmed)).toEqual({ userId: "u1", email: "learner@example.com", name: "Ann Lee" });
  });

  test("links in self-service emails stay on the site", () => {
    expect(sameSiteUrl("https://evil.example/x", SITE, `${SITE}/learn`)).toBe(`${SITE}/learn`);
    expect(sameSiteUrl("javascript:alert(1)", SITE, `${SITE}/learn`)).toBe(`${SITE}/learn`);
    expect(sameSiteUrl("/learn/practice", SITE, `${SITE}/learn`)).toBe(`${SITE}/learn/practice`);
    expect(sameSiteUrl(`${SITE}/learn?w=2`, SITE, `${SITE}/learn`)).toBe(`${SITE}/learn?w=2`);
    expect(sameSiteUrl("", SITE, `${SITE}/learn`)).toBe(`${SITE}/learn`);
  });
});
