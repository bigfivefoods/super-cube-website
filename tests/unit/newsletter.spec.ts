import { expect, test } from "@playwright/test";
import { confirmUrl, lookupConfirmToken, maskEmail } from "@/lib/newsletter/confirm";
import { subscriberStatus } from "@/lib/newsletter/db";
import { confirmationEmail } from "@/lib/newsletter/emails";

test.describe("newsletter double opt-in", () => {
  test("confirm links carry only the token", () => {
    const url = confirmUrl("0b7c2a52-6a0e-4a43-9f3e-1d2c3b4a5f60", "https://www.super-cube.me");
    expect(url).toBe("https://www.super-cube.me/newsletter/confirm?t=0b7c2a52-6a0e-4a43-9f3e-1d2c3b4a5f60");
  });

  test("masked addresses never show the full local part", () => {
    expect(maskEmail("craig@bigfivegroup.africa")).toBe("c****@bigfivegroup.africa");
    expect(maskEmail("a@x.io")).toBe("a**@x.io");
    expect(maskEmail("nonsense")).toBe("your address");
  });

  test("status: only confirmed, not-unsubscribed rows are active", () => {
    expect(subscriberStatus({ confirmed_at: null, unsubscribed_at: null })).toBe("pending");
    expect(subscriberStatus({ confirmed_at: "2026-10-07T10:00:00Z", unsubscribed_at: null })).toBe("active");
    expect(
      subscriberStatus({ confirmed_at: "2026-10-07T10:00:00Z", unsubscribed_at: "2026-10-08T10:00:00Z" }),
    ).toBe("unsubscribed");
  });

  test("malformed tokens are rejected without touching the database", async () => {
    expect(await lookupConfirmToken("not-a-token")).toEqual({ state: "invalid" });
    expect(await lookupConfirmToken("'; drop table x; --")).toEqual({ state: "invalid" });
  });

  test("confirmation email: branded, escaped link, plain-text part", () => {
    const link = "https://www.super-cube.me/newsletter/confirm?t=abc&x=<b>";
    const mail = confirmationEmail({ confirmUrl: link, site: "https://www.super-cube.me" });
    expect(mail.subject).toContain("Super-Cube®");
    expect(mail.html).toContain("t=abc&amp;x=&lt;b&gt;");
    expect(mail.html).not.toContain("x=<b>");
    expect(mail.html).toContain("Yes, subscribe me");
    // A confirmation is not a campaign: no unsubscribe link until they opt in.
    expect(mail.html).not.toContain("/newsletter/unsubscribe");
    expect(mail.text).toContain(link);
    expect(mail.text).toContain("14 days");
  });
});
