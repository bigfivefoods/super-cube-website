/**
 * SCORM 1.2, SCORM 2004 and xAPI (Tin Can) packages for the Super-Cube® course.
 * Built from the existing lesson text. Face taglines are copied verbatim.
 * Server only: this module pulls in the full curriculum.
 */
import { deflateRawSync, inflateRawSync, crc32 } from "node:zlib";
import { constructs } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import { faceTagline } from "@/lib/lms/face-taglines";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

export const LMS_PACKAGE_FORMATS = ["scorm12", "scorm2004", "xapi"] as const;
export type LmsPackageFormat = (typeof LMS_PACKAGE_FORMATS)[number];

export const PACKAGE_ISSUER = "Super-Cube® by Big Five Group";
const SITE = "https://www.super-cube.me";

export type PackageFile = { path: string; text: string };

type LessonFile = {
  id: string;
  title: string;
  outcome: string;
  faceId: string;
  faceName: string;
  tagline: string;
  html: string;
  activityId: string;
};

const cache = new Map<string, Buffer>();

export function isLmsPackageFormat(v: string | null): v is LmsPackageFormat {
  return (LMS_PACKAGE_FORMATS as readonly string[]).includes(String(v));
}

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A small markdown-to-HTML pass. Input is escaped first, so lesson text cannot inject markup. */
export function markdownToHtml(md: string): string {
  const lines = esc(md).split(/\r?\n/);
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const close = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      close();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(t);
    if (heading) {
      close();
      const level = heading[1].length + 1;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(t);
    const numbered = /^\d+\.\s+(.+)$/.exec(t);
    if (bullet || numbered) {
      const kind = bullet ? "ul" : "ol";
      if (list !== kind) {
        close();
        list = kind;
        out.push(`<${kind}>`);
      }
      out.push(`<li>${inline((bullet ?? numbered)![1])}</li>`);
      continue;
    }
    close();
    out.push(`<p>${inline(t)}</p>`);
  }
  close();
  return out.join("\n");
}

const RUNTIME = `/* Super-Cube® LMS runtime. Finds a SCORM API and, on a Tin Can launch, posts xAPI statements. */
(function () {
  function findAPI(win, name) {
    var guard = 0;
    while (win && guard < 12) {
      try { if (win[name]) return win[name]; } catch (e) {}
      if (win.parent && win.parent !== win) { win = win.parent; guard += 1; }
      else break;
    }
    try { if (window.opener && window.opener[name]) return window.opener[name]; } catch (e) {}
    return null;
  }
  var api12 = findAPI(window, "API");
  var api2004 = findAPI(window, "API_1484_11");
  var params = new URLSearchParams(location.search);
  var endpoint = params.get("endpoint");
  var auth = params.get("auth") || "";
  var actorRaw = params.get("actor");
  var registration = params.get("registration");
  var started = Date.now();
  function set12(k, v) { try { api12.LMSSetValue(k, v); api12.LMSCommit(""); } catch (e) {} }
  function set2004(k, v) { try { api2004.SetValue(k, v); api2004.Commit(""); } catch (e) {} }
  function statement(verbId, verb, activityId, name, completed) {
    var actor = null;
    try { actor = actorRaw ? JSON.parse(actorRaw) : null; } catch (e) { actor = null; }
    if (!actor) return null;
    var body = {
      actor: actor,
      verb: { id: verbId, display: { "en-US": verb } },
      object: {
        objectType: "Activity",
        id: activityId,
        definition: { name: { "en-US": name }, type: "http://adlnet.gov/expapi/activities/lesson" }
      }
    };
    if (completed) body.result = { completion: true };
    if (registration) body.context = { registration: registration };
    return body;
  }
  function post(body) {
    if (!endpoint || !body) return;
    var root = endpoint.replace(/\\/+$/, "") + "/statements";
    try {
      fetch(root, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Experience-API-Version": "1.0.3",
          "Authorization": auth
        },
        body: JSON.stringify(body)
      }).catch(function () {});
    } catch (e) {}
  }
  window.SuperCubeRuntime = {
    start: function (activityId, name) {
      if (api12) { try { api12.LMSInitialize(""); set12("cmi.core.lesson_status", "incomplete"); } catch (e) {} }
      if (api2004) { try { api2004.Initialize(""); set2004("cmi.completion_status", "incomplete"); } catch (e) {} }
      post(statement("http://adlnet.gov/expapi/verbs/initialized", "initialized", activityId, name, false));
    },
    complete: function (activityId, name) {
      if (api12) {
        set12("cmi.core.lesson_status", "completed");
        var secs = Math.max(1, Math.round((Date.now() - started) / 1000));
        var hh = String(Math.floor(secs / 3600)).padStart(2, "0");
        var mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
        var ss = String(secs % 60).padStart(2, "0");
        set12("cmi.core.session_time", hh + ":" + mm + ":" + ss);
        try { api12.LMSFinish(""); } catch (e) {}
      }
      if (api2004) {
        set2004("cmi.completion_status", "completed");
        set2004("cmi.progress_measure", "1");
        set2004("cmi.session_time", "PT" + Math.max(1, Math.round((Date.now() - started) / 1000)) + "S");
        try { api2004.Terminate(""); } catch (e) {}
      }
      post(statement("http://adlnet.gov/expapi/verbs/completed", "completed", activityId, name, true));
    }
  };
})();
`;

function lessonHtml(lesson: LessonFile, programmeName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(lesson.title)} · Super-Cube®</title>
<style>
  body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#f6f6f7;color:#0a0a0a;line-height:1.55}
  main{max-width:42rem;margin:0 auto;padding:2rem 1.25rem 4rem}
  header p{letter-spacing:.14em;text-transform:uppercase;font-size:.72rem;font-weight:700;color:#6b6b6b;margin:0}
  h1{font-size:1.7rem;line-height:1.2;margin:.4rem 0 .25rem}
  .tagline{color:#4a4a4a;margin:0 0 1.25rem}
  article h2,article h3,article h4{line-height:1.3}
  button{min-height:44px;border:0;border-radius:999px;background:#0a0a0a;color:#fff;font-weight:650;padding:0 1.25rem;cursor:pointer}
  footer{margin-top:2.5rem;color:#6b6b6b;font-size:.85rem}
</style>
</head>
<body>
<main>
  <header>
    <p>Super-Cube® · ${esc(programmeName)}</p>
    <h1>${esc(lesson.faceName)}</h1>
    <p class="tagline">${esc(lesson.tagline)}</p>
  </header>
  <article>
    <h2>${esc(lesson.title)}</h2>
    <p>${esc(lesson.outcome)}</p>
    ${lesson.html}
  </article>
  <p><button type="button" id="done">Mark this lesson complete</button></p>
  <footer>Issued by ${esc(PACKAGE_ISSUER)}. Face taglines are the Super-Cube® originals.</footer>
</main>
<script src="../shared/runtime.js"></script>
<script>
  SuperCubeRuntime.start(${JSON.stringify(lesson.activityId)}, ${JSON.stringify(lesson.title)});
  document.getElementById("done").addEventListener("click", function () {
    SuperCubeRuntime.complete(${JSON.stringify(lesson.activityId)}, ${JSON.stringify(lesson.title)});
    this.textContent = "Completed";
    this.disabled = true;
  });
</script>
</body>
</html>`;
}

function lessonsFor(programmeId: ProgrammeId): LessonFile[] {
  const programme = getProgramme(programmeId);
  const name = programme?.name ?? "Super-Cube®";
  return getCoursesForProgramme(programmeId).flatMap((course) => {
    const face = constructs.find((c) => c.id === course.constructId);
    const tagline = faceTagline(course.constructId, programmeId);
    return course.lessons.map((lesson) => {
      const activityId = `${SITE}/xapi/activities/${programmeId}/${lesson.id}`;
      const file: LessonFile = {
        id: lesson.id,
        title: lesson.title,
        outcome: lesson.outcome,
        faceId: course.constructId,
        faceName: face?.name ?? course.constructId,
        tagline,
        html: markdownToHtml(lesson.bodyMd),
        activityId,
      };
      file.html = lessonHtml(file, name);
      return file;
    });
  });
}

function scorm12Manifest(programmeId: ProgrammeId, title: string, lessons: LessonFile[]): string {
  const items: string[] = [];
  const resources: string[] = [];
  const byFace = new Map<string, LessonFile[]>();
  for (const lesson of lessons) {
    const list = byFace.get(lesson.faceId) ?? [];
    list.push(lesson);
    byFace.set(lesson.faceId, list);
  }
  let n = 0;
  for (const [faceId, list] of byFace) {
    const children = list
      .map((lesson) => {
        n += 1;
        const id = `i${n}`;
        resources.push(
          `    <resource identifier="r${n}" type="webcontent" adlcp:scormtype="sco" href="sco/${xml(lesson.id)}.html"><file href="sco/${xml(lesson.id)}.html"/><file href="shared/runtime.js"/></resource>`,
        );
        return `      <item identifier="${id}" identifierref="r${n}"><title>${xml(lesson.title)}</title></item>`;
      })
      .join("\n");
    const faceName = list[0]?.faceName ?? faceId;
    items.push(`    <item identifier="face-${xml(faceId)}"><title>${xml(faceName)}</title>\n${children}\n    </item>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.bigfivegroup.supercube.${xml(programmeId)}.scorm12" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org-supercube">
    <organization identifier="org-supercube">
      <title>${xml(title)}</title>
${items.join("\n")}
    </organization>
  </organizations>
  <resources>
${resources.join("\n")}
  </resources>
</manifest>
`;
}

function scorm2004Manifest(programmeId: ProgrammeId, title: string, lessons: LessonFile[]): string {
  const items: string[] = [];
  const resources: string[] = [];
  const byFace = new Map<string, LessonFile[]>();
  for (const lesson of lessons) {
    const list = byFace.get(lesson.faceId) ?? [];
    list.push(lesson);
    byFace.set(lesson.faceId, list);
  }
  let n = 0;
  for (const [faceId, list] of byFace) {
    const children = list
      .map((lesson) => {
        n += 1;
        resources.push(
          `    <resource identifier="r${n}" type="webcontent" adlcp:scormType="sco" href="sco/${xml(lesson.id)}.html"><file href="sco/${xml(lesson.id)}.html"/><file href="shared/runtime.js"/></resource>`,
        );
        return `      <item identifier="i${n}" identifierref="r${n}"><title>${xml(lesson.title)}</title></item>`;
      })
      .join("\n");
    items.push(`    <item identifier="face-${xml(faceId)}"><title>${xml(list[0]?.faceName ?? faceId)}</title>\n${children}\n    </item>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.bigfivegroup.supercube.${xml(programmeId)}.scorm2004" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="org-supercube">
    <organization identifier="org-supercube">
      <title>${xml(title)}</title>
${items.join("\n")}
      <imsss:sequencing>
        <imsss:controlMode choice="true" flow="true"/>
      </imsss:sequencing>
    </organization>
  </organizations>
  <resources>
${resources.join("\n")}
  </resources>
</manifest>
`;
}

function tincanXml(programmeId: ProgrammeId, title: string, lessons: LessonFile[]): string {
  const courseId = `${SITE}/xapi/activities/${programmeId}`;
  const activities = [
    `    <activity id="${xml(courseId)}" type="http://adlnet.gov/expapi/activities/course">
      <name lang="en-US">${xml(title)}</name>
      <description lang="en-US">Issued by ${xml(PACKAGE_ISSUER)}.</description>
      <launch lang="en-US">index.html</launch>
    </activity>`,
    ...lessons.map(
      (lesson) => `    <activity id="${xml(lesson.activityId)}" type="http://adlnet.gov/expapi/activities/lesson">
      <name lang="en-US">${xml(lesson.title)}</name>
      <description lang="en-US">${xml(lesson.faceName)}: ${xml(lesson.tagline)}</description>
      <launch lang="en-US">sco/${xml(lesson.id)}.html</launch>
    </activity>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
${activities.join("\n")}
  </activities>
</tincan>
`;
}

function statementsJson(programmeId: ProgrammeId, lessons: LessonFile[]): string {
  const courseId = `${SITE}/xapi/activities/${programmeId}`;
  const statements = lessons.map((lesson) => ({
    actor: { objectType: "Agent", mbox: "mailto:learner@example.com" },
    verb: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "en-US": "completed" } },
    object: {
      objectType: "Activity",
      id: lesson.activityId,
      definition: {
        name: { "en-US": lesson.title },
        description: { "en-US": `${lesson.faceName}: ${lesson.tagline}` },
        type: "http://adlnet.gov/expapi/activities/lesson",
      },
    },
    result: { completion: true },
    context: {
      contextActivities: {
        parent: [{ objectType: "Activity", id: courseId }],
      },
    },
  }));
  return JSON.stringify(statements, null, 2);
}

function indexHtml(title: string, lessons: LessonFile[]): string {
  const links = lessons
    .map((lesson) => `<li><a href="sco/${esc(lesson.id)}.html">${esc(lesson.faceName)} · ${esc(lesson.title)}</a></li>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#f6f6f7;color:#0a0a0a}
  main{max-width:42rem;margin:0 auto;padding:2rem 1.25rem 4rem}
  a{color:#0a0a0a}
</style>
</head>
<body>
<main>
  <p style="letter-spacing:.14em;text-transform:uppercase;font-size:.72rem;font-weight:700;color:#6b6b6b">Super-Cube®</p>
  <h1>${esc(title)}</h1>
  <p>Issued by ${esc(PACKAGE_ISSUER)}. Work through each face, then mark the lesson complete so your LMS can record it.</p>
  <ol>${links}</ol>
</main>
</body>
</html>`;
}

function readme(title: string, format: LmsPackageFormat): string {
  const kind =
    format === "scorm12" ? "SCORM 1.2" : format === "scorm2004" ? "SCORM 2004 4th Edition" : "xAPI (Tin Can)";
  return `${title}
Issued by ${PACKAGE_ISSUER}
Format: ${kind}

Import this zip into your learning platform. Each Super-Cube® face is a section, and each session is a lesson. The learner marks a lesson complete; the package then reports completion to the LMS.

SCORM 1.2 sets cmi.core.lesson_status to completed.
SCORM 2004 sets cmi.completion_status to completed and cmi.progress_measure to 1.
There is no assessment score in the package. Completion means the lesson was finished, not a test result.

xAPI statements use the verbs initialized and completed (http://adlnet.gov/expapi/verbs/). When a Tin Can LMS launches a page it passes endpoint, auth, actor and registration on the query string, and the page posts the statement to that LRS. xapi/statements.json is the statement profile for every lesson, with a sample actor of mailto:learner@example.com.

Face taglines in the lessons are the Super-Cube® originals and are not rewritten.
`;
}

export function buildLmsPackageFiles(programmeId: ProgrammeId, format: LmsPackageFormat): PackageFile[] {
  const programme = getProgramme(programmeId);
  const title = programme?.name ?? "Super-Cube®";
  const lessons = lessonsFor(programmeId);
  const files: PackageFile[] = [
    { path: "shared/runtime.js", text: RUNTIME },
    { path: "index.html", text: indexHtml(title, lessons) },
    { path: "lms-readme.txt", text: readme(title, format) },
    { path: "xapi/statements.json", text: statementsJson(programmeId, lessons) },
    ...lessons.map((lesson) => ({ path: `sco/${lesson.id}.html`, text: lesson.html })),
  ];
  if (format === "scorm12") files.push({ path: "imsmanifest.xml", text: scorm12Manifest(programmeId, title, lessons) });
  if (format === "scorm2004") files.push({ path: "imsmanifest.xml", text: scorm2004Manifest(programmeId, title, lessons) });
  if (format === "xapi") files.push({ path: "tincan.xml", text: tincanXml(programmeId, title, lessons) });
  return files;
}

export function zipFiles(files: PackageFile[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const data = Buffer.from(file.text, "utf8");
    const name = Buffer.from(file.path, "utf8");
    const compressed = deflateRawSync(data);
    const method = compressed.length < data.length ? 8 : 0;
    const payload = method === 8 ? compressed : data;
    const crc = crc32(data) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const localFull = Buffer.concat([local, name, payload]);
    locals.push(localFull);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, name]));
    offset += localFull.length;
  }
  const localBuf = Buffer.concat(locals);
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(localBuf.length, 16);
  return Buffer.concat([localBuf, centralBuf, eocd]);
}

/** Inflate a zip this module wrote. Used by tests and safe for those archives only. */
export function unzip(buf: Buffer): Map<string, string> {
  const out = new Map<string, string>();
  let p = 0;
  while (p + 30 <= buf.length && buf.readUInt32LE(p) === 0x04034b50) {
    const method = buf.readUInt16LE(p + 8);
    const compSize = buf.readUInt32LE(p + 18);
    const nameLen = buf.readUInt16LE(p + 26);
    const extraLen = buf.readUInt16LE(p + 28);
    const name = buf.subarray(p + 30, p + 30 + nameLen).toString("utf8");
    const start = p + 30 + nameLen + extraLen;
    const comp = buf.subarray(start, start + compSize);
    const data = method === 8 ? inflateRawSync(comp) : Buffer.from(comp);
    out.set(name, data.toString("utf8"));
    p = start + compSize;
  }
  return out;
}

export function buildLmsPackage(programmeId: ProgrammeId, format: LmsPackageFormat): { filename: string; bytes: Buffer } {
  const key = `${programmeId}:${format}`;
  const filename = `super-cube-${programmeId}-${format}.zip`;
  const hit = cache.get(key);
  if (hit) return { filename, bytes: hit };
  const bytes = zipFiles(buildLmsPackageFiles(programmeId, format));
  cache.set(key, bytes);
  return { filename, bytes };
}
