import { test, expect, type Page } from "@playwright/test";

/**
 * LMS admin console (Phase 1 · Stage 1).
 * Runs only against a local / CI Supabase stack with seeded test users
 * (LMS_STACK=1). Never point this at production: it creates cohorts.
 */
const stack = process.env.LMS_STACK === "1";
const ADMIN = process.env.LMS_ADMIN_EMAIL || "admin@local.test";
const LEARNER = process.env.LMS_LEARNER_EMAIL || "learner1@local.test";
const PASSWORD = process.env.LMS_TEST_PASSWORD || "Local-test-pass-1";

/** Our own alerts (Next.js adds an empty role=alert route announcer). */
const alertBox = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)').first();

test.describe("LMS admin console", () => {
  test.skip(!stack, "needs the local Supabase stack (LMS_STACK=1)");
  test.describe.configure({ mode: "serial" });
  // Own client IP per run, so the admin sign-in rate limit (stage 8) doesn't
  // carry over between local runs.
  test.use({ extraHTTPHeaders: { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` } });

  async function signIn(page: Page, email: string) {
    await page.goto("/admin");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
  }

  test("a learner account can't open the admin console", async ({ page }) => {
    await signIn(page, LEARNER);
    await expect(alertBox(page)).toContainText(/incorrect/i);
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toHaveCount(0);
  });

  test("admin runs a pilot end to end without Paystack", async ({ page }) => {
    const code = `E2E${Date.now().toString(36).toUpperCase().slice(-5)}`;
    await signIn(page, ADMIN);
    await expect(page.getByRole("heading", { name: /learning admin/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Where learners are" })).toBeVisible();

    // Cohort with invoiced seats
    await page.getByRole("link", { name: "Cohorts & seats" }).click();
    await expect(page.getByRole("heading", { name: "Create a cohort" })).toBeVisible();
    await page.getByLabel("Cohort name").fill("E2E Pilot Co");
    await page.getByLabel(/Join code/).fill(code);
    await page.getByLabel("Opening seats").fill("5");
    await page.getByLabel("Seats paid by").selectOption("invoiced");
    await page.getByLabel("Invoice / EFT reference").first().fill("INV-E2E-1");
    await page.getByRole("button", { name: "Create cohort" }).click();
    await expect(page.getByRole("status").filter({ hasText: `code ${code}` })).toBeVisible();
    const card = page.getByTestId(`cohort-${code}`);
    await expect(card).toContainText("0 of 5 seats used");

    // Invoice reference is required for invoiced seats
    await page.getByLabel("Cohort", { exact: true }).selectOption({ label: `E2E Pilot Co (${code})` });
    await page.getByLabel("Seats to add").fill("3");
    await page.getByLabel("Paid by", { exact: true }).selectOption("invoiced");
    await page.getByRole("button", { name: "Add seats" }).click();
    await expect(alertBox(page)).toContainText(/reference/i);
    await page.getByLabel("Paid by", { exact: true }).selectOption("comped");
    await page.getByRole("button", { name: "Add seats" }).click();
    await expect(page.getByRole("status").filter({ hasText: "3 seats added" })).toBeVisible();
    await expect(card).toContainText("0 of 8 seats used");

    // Coach invite: link shown once
    await page.getByRole("link", { name: "Invites", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Invite a coach or admin" })).toBeVisible();
    await page.getByLabel("Cohort", { exact: true }).selectOption({ label: `E2E Pilot Co (${code})` });
    await page.getByLabel(/Lock to email/).fill("coach1@local.test");
    await page.getByRole("button", { name: "Create invite link" }).click();
    await expect(page.getByRole("status").filter({ hasText: "won’t be shown again" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Link" })).toHaveValue(/\/learn\/org\?invite=/);

    // Audit trail
    await page.getByRole("link", { name: "Audit log" }).click();
    const log = page.getByRole("table", { name: "Admin audit log" });
    await expect(log).toContainText("Created cohort");
    await expect(log).toContainText("INV-E2E-1");
    await expect(log).toContainText("Created invite");
  });

  test("learners, consent gaps and privacy", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.getByRole("link", { name: "Learners" }).click();
    const table = page.getByRole("table", { name: /Learners/ });
    await expect(table).toContainText("Needs guardian consent");
    await expect(table).toContainText("Baseline done, no seat");
    // Journals and answers never reach the admin console
    await expect(page.locator("body")).not.toContainText("PRIVATE JOURNAL TEXT");
    await page.getByRole("link", { name: "Consents" }).click();
    await expect(page.getByRole("heading", { name: /Waiting for consent/ })).toContainText("(1)");
  });

  test("certificate revocation shows on the public check", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.getByRole("link", { name: "Certificates" }).click();
    const cert = page.getByTestId("cert-SC-20261007-0A1B2C3D4E");
    await expect(cert).toBeVisible();
    if (await cert.getByRole("button", { name: "Reinstate" }).isVisible()) {
      await cert.getByRole("button", { name: "Reinstate" }).click();
    }
    await cert.getByRole("button", { name: "Revoke…" }).click();
    await cert.getByLabel(/Reason/).fill("Issued in error (test)");
    await cert.getByRole("button", { name: "Confirm revoke" }).click();
    await expect(cert).toContainText("Revoked");
    await page.goto("/verify/SC-20261007-0A1B2C3D4E");
    await expect(page.locator("#main-content")).toContainText(/revoked/i);
    // Reinstate so the run is repeatable
    await page.goto("/admin?tab=certificates");
    await page.getByTestId("cert-SC-20261007-0A1B2C3D4E").getByRole("button", { name: "Reinstate" }).click();
    await expect(page.getByTestId("cert-SC-20261007-0A1B2C3D4E").getByRole("button", { name: "Revoke…" })).toBeVisible();
  });
});
