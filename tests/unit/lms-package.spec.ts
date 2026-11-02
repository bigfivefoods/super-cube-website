import { expect, test } from "@playwright/test";
import { constructs } from "@/lib/content";
import { faceTagline } from "@/lib/lms/face-taglines";
import { buildLmsPackage, buildLmsPackageFiles, PACKAGE_ISSUER, unzip } from "@/lib/lms/lms-package";

test("SCORM 1.2, SCORM 2004 and xAPI packages keep face taglines and the issuer", () => {
  const choices = constructs.find((c) => c.id === "choices")!;
  const tagline = faceTagline("choices", "adults");
  expect(tagline).toBe(choices.tagline);

  const scorm12 = buildLmsPackageFiles("adults", "scorm12");
  const manifest12 = scorm12.find((f) => f.path === "imsmanifest.xml")!.text;
  expect(manifest12).toContain("<schemaversion>1.2</schemaversion>");
  expect(manifest12).toContain('adlcp:scormtype="sco"');
  expect(manifest12).toContain("Super-Cube® Adults");

  const scorm2004 = buildLmsPackageFiles("adults", "scorm2004");
  const manifest2004 = scorm2004.find((f) => f.path === "imsmanifest.xml")!.text;
  expect(manifest2004).toContain("2004 4th Edition");
  expect(manifest2004).toContain('adlcp:scormType="sco"');
  expect(manifest2004).not.toContain('adlcp:scormtype="sco"');

  const xapi = buildLmsPackageFiles("adults", "xapi");
  const tincan = xapi.find((f) => f.path === "tincan.xml")!.text;
  expect(tincan).toContain("<tincan");
  expect(tincan).toContain("http://adlnet.gov/expapi/activities/course");
  expect(tincan).toContain(PACKAGE_ISSUER);
  const statements = JSON.parse(xapi.find((f) => f.path === "xapi/statements.json")!.text) as {
    verb: { id: string };
    result: { completion: boolean };
    object: { id: string; definition: { description: { "en-US": string } } };
  }[];
  expect(statements.length).toBeGreaterThan(6);
  expect(statements.every((s) => s.verb.id === "http://adlnet.gov/expapi/verbs/completed")).toBe(true);
  expect(statements.every((s) => s.result.completion === true)).toBe(true);
  expect(statements.some((s) => s.object.definition.description["en-US"].includes(tagline))).toBe(true);

  const lesson = scorm12.find((f) => f.path.startsWith("sco/") && f.text.includes(tagline));
  expect(lesson?.text).toContain(PACKAGE_ISSUER);
  for (const file of [...scorm12, ...scorm2004, ...xapi]) {
    expect(file.text.toLowerCase()).not.toContain("kwaden");
  }
});

test("a SCORM package is a zip the LMS can open", () => {
  const pack = buildLmsPackage("adults", "scorm12");
  expect(pack.filename).toBe("super-cube-adults-scorm12.zip");
  expect(pack.bytes.subarray(0, 2).toString()).toBe("PK");
  const files = unzip(pack.bytes);
  expect(files.get("imsmanifest.xml")).toContain("ADL SCORM");
  expect(files.get("shared/runtime.js")).toContain("LMSInitialize");
  expect(files.get("shared/runtime.js")).toContain("http://adlnet.gov/expapi/verbs/completed");
  expect(files.get("xapi/statements.json")).toContain("mailto:learner@example.com");
});
