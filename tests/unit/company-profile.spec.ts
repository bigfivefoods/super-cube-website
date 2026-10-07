import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * The downloadable company profile (public/super-cube-company-profile.pdf,
 * built by scripts/company-profile/build.mjs) replaces the old overview deck.
 * The .pptx stays in the repo but no page links to it any more.
 */

const ROOT = path.resolve(__dirname, "../..");
const PDF = path.join(ROOT, "public/super-cube-company-profile.pdf");

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs|js)$/.test(name)) out.push(p);
  }
}

test("company profile PDF exists, is A4-sized PDF under 5 MB, with title metadata", () => {
  const buf = readFileSync(PDF);
  expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(buf.length).toBeLessThan(5 * 1024 * 1024);
  const raw = buf.toString("latin1");
  // Title is written as UTF-16BE hex; "Company Profile" in that encoding.
  const hex = Buffer.from("Company Profile", "utf16le").swap16().toString("hex").toUpperCase();
  expect(raw.toUpperCase()).toContain(hex);
  expect(raw).toContain("/MarkInfo"); // tagged PDF
});

test("media kit and pilot pack link to the company profile PDF", () => {
  for (const rel of ["src/app/media/page.tsx", "src/app/pilot-pack/page.tsx"]) {
    const src = readFileSync(path.join(ROOT, rel), "utf8");
    expect(src, rel).toContain('href="/super-cube-company-profile.pdf"');
    expect(src, rel).toContain("Download company profile (PDF)");
  }
});

test("no page links to the retired overview deck", () => {
  const files: string[] = [];
  walk(path.join(ROOT, "src"), files);
  const offenders = files.filter((f) => readFileSync(f, "utf8").includes("super-cube-overview.pptx"));
  expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
});
