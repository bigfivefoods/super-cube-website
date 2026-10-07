import { defineConfig } from "@playwright/test";

/** Fast unit tests (pure TypeScript, no browser): npm run test:unit */
export default defineConfig({
  testDir: "./tests/unit",
  reporter: process.env.CI ? "github" : "list",
});
