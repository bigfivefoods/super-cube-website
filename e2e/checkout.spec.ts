import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * Checkout smoke: pricing → Paystack redirect, for one learner (R99) and a seat pack.
 * The initialize call is intercepted, so no Paystack transaction is ever created and nothing
 * is paid, even when BASE_URL points at production. The redirect target is a stub page.
 */
const STUB = "https://checkout.paystack.com/e2e-stub-never-pay";

async function stubPaystack(page: Page, captured: Request[]) {
  await page.route("**/api/paystack/initialize", async (route) => {
    const req = route.request();
    if (req.method() === "GET") {
      return route.fulfill({ json: { configured: true, publicKey: true, currency: "ZAR" } });
    }
    captured.push(req);
    const body = req.postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      json: {
        configured: true,
        productType: body.productType === "seat_pack" ? "seat_pack" : "single",
        authorization_url: STUB,
        reference: "e2e_ref",
      },
    });
  });
  await page.route("https://checkout.paystack.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>Paystack stub</title><h1>Paystack stub</h1>" }),
  );
}

test.describe("checkout up to the Paystack redirect (never pays)", () => {
  test("one learner: R99 checkout sends programme and email, then redirects to Paystack", async ({ page }) => {
    const captured: Request[] = [];
    await stubPaystack(page, captured);
    await page.goto("/pricing");
    // No checkout is open until a card's Buy button is pressed
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByTestId("programme-card-adolescents").getByRole("button", { name: /Buy with Paystack · R99/ }).click();
    const dialog = page.getByRole("dialog", { name: /Adolescents/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/R99 one-time/)).toBeVisible();
    // A bad email never reaches the server
    await dialog.getByPlaceholder("you@school.co.za").fill("not-an-email");
    await dialog.getByRole("button", { name: /^Pay R/ }).click();
    await expect(dialog.getByText("Enter a valid email for your payment receipt.")).toBeVisible();
    expect(captured).toHaveLength(0);

    await dialog.getByPlaceholder("you@school.co.za").fill("buyer@example.org");
    await dialog.getByRole("button", { name: /^Pay R/ }).click();
    await page.waitForURL(STUB);
    expect(captured).toHaveLength(1);
    const body = captured[0].postDataJSON() as Record<string, unknown>;
    expect(body.email).toBe("buyer@example.org");
    expect(body.programmeId).toBe("adolescents");
    // The price is decided on the server, never sent by the browser
    expect(body).not.toHaveProperty("amount");
  });

  test("seat pack: organisation, coach email and pack go to initialize, then Paystack", async ({ page }) => {
    const captured: Request[] = [];
    await stubPaystack(page, captured);
    await page.goto("/pricing#pilot");
    await page.getByPlaceholder("e.g. Greenfield High · Acme L&D").fill("E2E Test School");
    await page.locator("#pilot").getByPlaceholder("you@school.co.za").fill("coach@example.org");
    await page.locator("#pilot").getByRole("button", { name: /^Pay .* seats$/ }).click();
    await page.waitForURL(STUB);
    const body = captured[0].postDataJSON() as Record<string, unknown>;
    expect(body).toMatchObject({ productType: "seat_pack", orgName: "E2E Test School", email: "coach@example.org" });
    expect(typeof body.packId).toBe("string");
    expect(body).not.toHaveProperty("amount");
  });

  test("initialize refuses a missing email before touching Paystack", async ({ request }) => {
    const res = await request.post("/api/paystack/initialize", { data: { programmeId: "adults", email: "" } });
    expect(res.status()).toBe(400);
    const status = await request.get("/api/paystack/initialize");
    expect(status.ok()).toBeTruthy();
    const s = await status.json();
    expect(typeof s.configured).toBe("boolean");
    if (process.env.EXPECT_PAYSTACK_LIVE === "1") expect(s).toMatchObject({ configured: true, publicKey: true });
  });
});
