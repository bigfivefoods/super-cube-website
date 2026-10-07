import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Every user-visible mention of the brand must read "Super-Cube®".
 *
 * Scans source strings and JSX text for the brand name (any casing, with a
 * space or hyphen) that is not followed by ®. Not flagged: the super-cube.me
 * domain and email addresses, file names and slugs (super-cube-overview.pptx,
 * super-cube-${kind}…), paths, code identifiers (SuperCube, superCubeHelp,
 * super_cube_lms) and code comments.
 */

const ROOT = path.resolve(__dirname, "../..");
const DIRS = ["src"];
const FILES = ["public/sw.js", "public/brand/logo.svg", "public/brand/logo-white.svg", "public/brand/logo-mark.svg", "capacitor.config.ts"];
const EXT = /\.(tsx?|mjs|js|svg)$/;

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
}

/** Blank out comments (keeping line numbers) without touching "https://" in strings. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\w/])\/\/[^\n]*/g, (m, pre: string) => pre + " ".repeat(m.length - pre.length));
}

const BRAND = /super[ -]cube/gi;

/** Brand mentions that lack ® in a source file (as "line: text"). */
function unmarkedBrandMentions(src: string): string[] {
  const text = stripComments(src);
  const hits: string[] = [];
  for (const m of text.matchAll(BRAND)) {
    const i = m.index ?? 0;
    const before = text[i - 1] ?? "";
    const after = text.slice(i + m[0].length, i + m[0].length + 200);
    const lower = m[0] === m[0].toLowerCase();
    // Part of a path, email, domain, identifier or slug.
    if (/[\w/.@#$]/.test(before) || (lower && before === "-")) continue;
    if (/^[\w.]/.test(after)) continue; // super-cube.me, super-cube_x
    if (lower && /^-/.test(after)) continue; // super-cube-overview.pptx
    // Already marked: "Super-Cube®", URL-encoded, or a styled <span>®</span> right after.
    if (/^(®|%C2%AE|\s*<span[^>]*>\s*®)/i.test(after)) continue;
    const line = text.slice(0, i).split("\n").length;
    hits.push(`${line}: ${src.split("\n")[line - 1].trim().slice(0, 120)}`);
  }
  return hits;
}

test("brand guard recognises marked and unmarked mentions", () => {
  expect(unmarkedBrandMentions(`<p>About Super-Cube</p>`)).toHaveLength(1);
  expect(unmarkedBrandMentions(`title: "Super Cube Learn"`)).toHaveLength(1);
  expect(unmarkedBrandMentions(`title: "Super-Cube® Learn"`)).toHaveLength(0);
  expect(unmarkedBrandMentions(`href="https://www.super-cube.me/learn" mail="hello@super-cube.me"`)).toHaveLength(0);
  expect(unmarkedBrandMentions(`a.download = "super-cube-report.pdf"; import { SuperCube } from "x";`)).toHaveLength(0);
  expect(unmarkedBrandMentions(`// the Super-Cube faces\n/* Super-Cube */`)).toHaveLength(0);
  expect(unmarkedBrandMentions(`Super-Cube\n  <span className="x">®</span>`)).toHaveLength(0);
  expect(unmarkedBrandMentions(`"Okunye kwe-Super-Cube"`)).toHaveLength(1);
  expect(unmarkedBrandMentions(`subject=Book%20a%20Super-Cube%C2%AE%20pilot`)).toHaveLength(0);
});

test("every user-visible brand mention carries ®", () => {
  const files: string[] = [];
  for (const d of DIRS) walk(path.join(ROOT, d), files);
  for (const f of FILES) files.push(path.join(ROOT, f));
  const problems: string[] = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    expect(src, `${path.relative(ROOT, f)} contains "®®"`).not.toContain("®®");
    for (const hit of unmarkedBrandMentions(src)) problems.push(`${path.relative(ROOT, f)}:${hit}`);
  }
  expect(problems, `Brand mentions without ® (write "Super-Cube®"):\n${problems.join("\n")}`).toEqual([]);
});
