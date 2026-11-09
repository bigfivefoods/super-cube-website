import { expect, test } from "@playwright/test";

const LOCALES = ["", "fr", "ar", "pt", "sw", "zu", "af"] as const;

/**
 * React #418 is a server/client text mismatch. These entry screens must hydrate
 * cleanly in every language, including right after /learn sends a new visitor on.
 */
for (const locale of LOCALES) {
  const prefix = locale ? `/${locale}` : "";
  const label = locale || "en";

  for (const path of ["/learn/welcome", "/learn"]) {
    test(`${label} ${path} hydrates without a text mismatch`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(String(err)));
      const res = await page.goto(`${prefix}${path}`, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const hydration = errors.filter((line) => /hydration|did not match|minified react error #(?:418|419|422|423|425)/i.test(line));
      expect(hydration, hydration.join("\n")).toEqual([]);
    });
  }
}
