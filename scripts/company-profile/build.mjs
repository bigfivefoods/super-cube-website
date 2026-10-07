/**
 * Super-Cube® company profile — A4 PDF.
 *
 *   node scripts/company-profile/build.mjs [--out public/super-cube-company-profile.pdf] [--html out.html]
 *
 * Every fact, figure and colour is read from the site's own source (src/lib/*.ts):
 * faces and skills, programmes and themes, prices and seat packs, research
 * gains, testimonials, the 8-week calendar and SDG text. Change the site and
 * re-run this script; nothing here is typed in twice.
 *
 * Rendering: Chromium via Playwright (npx playwright install chromium, or set
 * CHROME_PATH). Inter (static weights, SIL OFL) is embedded from scripts/company-profile/fonts.
 * Images are resized and re-encoded with sharp so the PDF stays small.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const outPdf = path.resolve(root, arg("--out", "public/super-cube-company-profile.pdf"));
const outHtml = arg("--html", null);

const SITE = "https://www.super-cube.me";
const META = {
  title: "Super-Cube® Company Profile",
  author: "Big Five Learn · Big Five Group™",
  subject: "Super-Cube® human-centric leadership development: the model, the research, programmes, the learning platform, pilots and pricing.",
  keywords: "Super-Cube®, leadership development, Big Five Learn, Big Five Group, human-centric leadership, South Africa",
};

// ── Load site data straight from src/lib (TypeScript → temp ESM) ─────────────
async function loadLib(names, dir) {
  for (const n of names) {
    const src = await fs.readFile(path.join(root, "src/lib", `${n}.ts`), "utf8");
    let js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    js = js.replace(/from\s+["']@\/lib\/([\w-]+)["']/g, 'from "./$1.mjs"');
    await fs.writeFile(path.join(dir, `${n}.mjs`), js);
  }
  const mods = {};
  for (const n of names) mods[n] = await import(pathToFileURL(path.join(dir, `${n}.mjs`)).href);
  return mods;
}

// ── Images: resize/re-encode into the temp dir ───────────────────────────────
async function prepImages(dir) {
  const pub = (p) => path.join(root, "public", p);
  const out = {};
  const jpeg = async (key, src, { width, cropLeft = 0, quality = 78, height } = {}) => {
    let img = sharp(pub(src));
    const m = await img.metadata();
    if (cropLeft) {
      const left = Math.round(m.width * cropLeft);
      img = sharp(pub(src)).extract({ left, top: 0, width: m.width - left, height: m.height });
    }
    const file = path.join(dir, `${key}.jpg`);
    await img.resize({ width, height, fit: "cover", withoutEnlargement: true }).jpeg({ quality, mozjpeg: true }).toFile(file);
    out[key] = pathToFileURL(file).href;
  };
  // Site heroes carry a darkened band on the left (for overlaid text); crop it off.
  await jpeg("cover", "images/hero/hero-model.jpg", { width: 1500, quality: 80 });
  await jpeg("cubes", "images/hero/hero-constructs.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("research", "images/hero/hero-research.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("schools", "images/hero/hero-programs.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("orgs", "images/hero/hero-leadership.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("about", "images/hero/hero-about.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("sdg", "images/hero/hero-sdg.jpg", { width: 1100, cropLeft: 0.3 });
  await jpeg("origami", "images/hero/leadership-hero.jpg", { width: 1400, quality: 80 });
  await jpeg("craig", "images/people/craig-muller.webp", { width: 600, quality: 82 });
  for (let g = 1; g <= 17; g++) {
    const id = String(g).padStart(2, "0");
    await jpeg(`sdg${id}`, `images/sdgs/goal-${id}.jpg`, { width: 180, quality: 80 });
  }
  // Wordmark: dark (as on the site) and a white-text version for dark pages,
  // keeping the coloured hexagon. Grey text pixels → white.
  const logo = sharp(pub("brand/logo.png")).resize({ width: 900 });
  const dark = path.join(dir, "logo-dark.png");
  await logo.clone().png({ compressionLevel: 9, palette: true }).toFile(dark);
  out.logoDark = pathToFileURL(dark).href;
  const { data, info } = await logo.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (Math.max(r, g, b) - Math.min(r, g, b) < 24) data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const light = path.join(dir, "logo-light.png");
  await sharp(data, { raw: info }).png({ compressionLevel: 9, palette: true }).toFile(light);
  out.logoLight = pathToFileURL(light).href;
  return out;
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Keep "Super-Cube®" (and certificate IDs) on one line: wrap them in text nodes only, never in attributes. */
const nowrapBrand = (html) =>
  html
    .split(/(<[^>]+>)/)
    .map((part) => (part.startsWith("<") ? part : part.replace(/Super-Cube®|SC-YYYYMMDD-HEX/g, (m) => `<span class="nw">${m}</span>`)))
    .join("");
const link = (href, text, cls = "") => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ""}>${text}</a>`;

// ── Diagrams ─────────────────────────────────────────────────────────────────
/** Flat-top hexagon: six triangles (one per face) meeting at the individual. Choices top, Principles bottom. */
function modelDiagram(constructs, order) {
  const R = 150, cx = 200, cy = 190;
  const by = Object.fromEntries(constructs.map((c) => [c.id, c]));
  // Triangle centres clockwise from the top: 90°, 30°, -30°, -90°, -150°, 150°.
  const angles = [90, 30, -30, -90, -150, 150];
  const pt = (deg, r = R) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  let tris = "", labels = "";
  order.forEach((id, i) => {
    const c = by[id], a = angles[i];
    const [x1, y1] = pt(a + 30), [x2, y2] = pt(a - 30);
    tris += `<polygon points="${cx},${cy} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="${c.color}" stroke="#fff" stroke-width="2.5"/>`;
    const [lx, ly] = pt(a, R * 0.62);
    labels += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" class="tri-label">${esc(c.name)}</text>`;
  });
  return `<svg viewBox="42 52 316 276" class="model-svg" role="img" aria-label="The Super-Cube® model: six faces (Choices on top, Principles at the bottom, Mental, Emotional, Physical and Spiritual on the sides) with the individual at the centre.">
    ${tris}${labels}
    <circle cx="${cx}" cy="${cy}" r="38" fill="#fff"/>
    <circle cx="${cx}" cy="${cy}" r="38" fill="none" stroke="#0a0a0a" stroke-opacity=".12" stroke-width="1"/>
    <text x="${cx}" y="${cy - 3}" text-anchor="middle" class="you">You</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" class="you-sub">at the centre</text>
  </svg>`;
}

/** Before/after radar, same face order and style as the site's growth report. */
function radar(constructs, faces) {
  const cx = 200, cy = 182, R = 146;
  const by = Object.fromEntries(constructs.map((c) => [c.id, c]));
  const ang = (i) => ((90 - i * 60) * Math.PI) / 180;
  const p = (i, v) => [cx + (R * v) / 100 * Math.cos(ang(i)), cy - (R * v) / 100 * Math.sin(ang(i))];
  let grid = "";
  for (const v of [25, 50, 75, 100]) {
    grid += `<polygon points="${faces.map((_, i) => p(i, v).map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="#0a0a0a" stroke-opacity="${v === 100 ? 0.14 : 0.07}"/>`;
  }
  let spokes = "", labels = "", dotsB = "", dotsA = "";
  faces.forEach((f, i) => {
    const [x, y] = p(i, 100);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${by[f.id].color}" stroke-opacity=".35"/>`;
    const [lx, ly] = p(i, 112);
    const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
    const dy = ly < cy - 20 ? -4 : ly > cy + 20 ? 8 : 0;
    labels += `<text x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}" text-anchor="${anchor}" class="rad-label" fill="${by[f.id].color}">${esc(by[f.id].name)}<tspan x="${lx.toFixed(1)}" dy="11" class="rad-num">${f.pre} → ${f.post}</tspan></text>`;
    const [bx, byy] = p(i, f.pre), [ax, ay] = p(i, f.post);
    dotsB += `<circle cx="${bx.toFixed(1)}" cy="${byy.toFixed(1)}" r="2.6" fill="#fff" stroke="#6b6b6b" stroke-width="1.2"/>`;
    dotsA += `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.2" fill="${by[f.id].color}"/>`;
  });
  const poly = (k) => faces.map((f, i) => p(i, f[k]).map((n) => n.toFixed(1)).join(",")).join(" ");
  return `<svg viewBox="0 0 400 362" class="radar-svg" role="img" aria-label="Example growth radar: before and after scores on the six faces.">
    ${grid}${spokes}
    <polygon points="${poly("post")}" fill="#2563eb" fill-opacity=".10" stroke="#0a0a0a" stroke-width="1.6"/>
    <polygon points="${poly("pre")}" fill="none" stroke="#6b6b6b" stroke-width="1.3" stroke-dasharray="4 3"/>
    ${dotsB}${dotsA}${labels}
  </svg>`;
}

// ── Page chrome ──────────────────────────────────────────────────────────────
let pageNo = 0;
function page(body, { dark = false, cls = "", footer = true } = {}) {
  pageNo += 1;
  const foot = footer
    ? `<footer class="foot"><span>Super-Cube® · Company profile</span><span>${link(SITE, "www.super-cube.me")}</span><span class="pn">${String(pageNo).padStart(2, "0")}</span></footer>`
    : "";
  return `<section class="page${dark ? " dark" : ""} ${cls}"><div class="spectrum" aria-hidden="true"></div>${body}${foot}</section>`;
}
const eyebrow = (t) => `<p class="eyebrow">${t}</p>`;

function build(L, img) {
  const { constructs, levels, researchHighlights, publications, stats, site } = L.content;
  const { programmes, skillsForProgramme, COURSE_PRICE_ZAR, COURSE_PRICE_USD } = L.programmes;
  const { PROGRAMME_THEME } = L["programme-theme"];
  const { interventionGains, overallInterventionGain, interventionGainScaleMax } = L.impact;
  const { SEAT_PACKS, seatPackListPrice } = L["seat-packs"];
  const { testimonials } = L.testimonials;
  const { cohortCalendar } = L.facilitator;
  const { sdgGoals } = L.sdgs;
  const { sdgChallenges, leadershipChallengeThesis } = L["leadership-challenges"];
  const by = Object.fromEntries(constructs.map((c) => [c.id, c]));
  const radarOrder = ["choices", "mental", "emotional", "principles", "physical", "spiritual"];
  const zar = (n) => `R${n.toLocaleString("en-ZA").replace(/\s/g, " ")}`;
  const band = (id) => {
    const t = PROGRAMME_THEME[id];
    return `background:linear-gradient(120deg, ${t.stops.join(", ")});color:${t.ink}`;
  };
  const pages = [];

  // 1 · Cover
  pages.push(page(`
    <div class="cover-img" style="background-image:url('${img.cover}')" role="img" aria-label="A glass cube refracting the six face colours"></div>
    <div class="cover-fade" aria-hidden="true"></div>
    <img class="cover-logo" src="${img.logoLight}" alt="Super-Cube®">
    <div class="cover-text">
      ${eyebrow("Company profile · 2026")}
      <h1>Leadership is learnable—<br>and we prove it.</h1>
      <p class="lede">${esc(site.tagline)} The Super-Cube® model, the research behind it, and everything we offer for individuals, schools and organisations.</p>
      <div class="cover-faces">${constructs.map((c) => `<span><i style="background:${c.color}"></i>${esc(c.name)}</span>`).join("")}</div>
      <p class="cover-by">Big Five Learn · the Educate pillar of Big Five Group™ · ${link(SITE, "www.super-cube.me")}</p>
    </div>`, { dark: true, cls: "cover", footer: false }));

  // 2 · Who we are
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Who we are")}
      <h2>Big Five Learn: leadership development, built on Super-Cube®.</h2>
      <p class="lede">Big Five Learn is the Educate pillar of Big Five Group™. It focuses on leadership development using the Super-Cube® model: ${esc(site.description.replace("The Super-Cube® Leadership Model is ", "").replace(/\.$/, ""))}.</p>
      <div class="pillars">
        <p class="motto">Feed. Educate. Empower.</p>
        <div class="grid3">
          <article class="card"><p class="k">Feed</p><h3>Big Five Foods</h3><p>Innovative, accessible, nutritious FMCG solutions that strengthen food security continent-wide.</p></article>
          <article class="card hl"><p class="k">Educate · Big Five Learn</p><h3>Super-Cube®</h3><p>A pioneering holistic leadership model across Choices · Principles · Mental · Emotional · Physical · Spiritual intelligence.</p></article>
          <article class="card"><p class="k">Empower</p><h3>SupplierAdvisor®</h3><p>Strategic programmes that equip suppliers, entrepreneurs, and communities with tools, strategies, and networks for sustainable growth.</p></article>
        </div>
      </div>
      <div class="split">
        <div>
          <h3 class="h3">A simple loop: measure, practise, prove.</h3>
          <p>Super-Cube® looks at the whole leader, not one skill. It measures six faces—Choices, Principles, Mental, Emotional, Physical and Spiritual—then helps each person grow the ones that matter most for them.</p>
          <ol class="steps">
            <li><b>Measure.</b> A free 10-minute baseline gives a score for each of the six faces of leadership, so strengths and gaps are visible.</li>
            <li><b>Practise.</b> Short sessions for each age group, with a weekly practice plan that starts with the weakest faces.</li>
            <li><b>Prove.</b> Measure again. A before-and-after report shows what changed, and the certificate has a public verify ID.</li>
          </ol>
        </div>
        <figure class="photo tall contain"><img src="${img.origami}" alt="Origami figures transforming from a crumpled ball into a bird in flight"></figure>
      </div>
      <div class="statrow">
        ${stats.map((s) => `<div><p class="big">${esc(s.value)}</p><p class="k">${esc(s.label)}</p><p class="small">${esc(s.detail)}</p></div>`).join("")}
      </div>
      <p class="note">+32.2% and +45.1% are average gains from the 12-week Super-Cube® leadership intervention with Imana Foods and Kerry Foods (see page 7), not from the doctoral study. They are not live programme data or a promised outcome.</p>
    </div>`));

  // 3 · Founder
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Founder")}
      <div class="founder">
        <figure class="portrait"><img src="${img.craig}" alt="Dr Craig R. Muller"></figure>
        <div>
          <h2>Dr Craig R. Muller</h2>
          <p class="sub">Visionary architect of Kingdom-centred leadership and sustainable impact in Africa</p>
          <p>Dr Craig Muller is a driven innovator—a DBA-credentialed executive with over 20 years of blue-chip experience in FMCG, supply chain optimisation, and global consulting.</p>
          <p>His goal is to <b>feed</b> (Big Five Foods), <b>educate</b> (Super-Cube® leadership development), and <b>empower</b> (SupplierAdvisor®) people across the African continent—to help progress humanity.</p>
          <p>The Super-Cube® Leadership Model was developed as the core output of his Doctor of Business Administration thesis at the University of KwaZulu-Natal (December 2020; degree conferred 2021), a case study of an African FMCG business network.</p>
          <div class="chips">${["Integrity", "Excellence", "Compassionate empowerment"].map((v) => `<span>${v}</span>`).join("")}</div>
        </div>
      </div>
      <div class="split even">
        <div class="card">
          <p class="k">Education</p>
          <dl class="dl">
            <dt>Doctor of Business Administration (DBA)</dt><dd>University of KwaZulu-Natal · 2021 · Creator of the Super-Cube® leadership model</dd>
            <dt>Master of Business Administration (MBA)</dt><dd>University of KwaZulu-Natal · 2006</dd>
            <dt>Postgraduate Diploma in Management</dt><dd>University of KwaZulu-Natal · 2004</dd>
            <dt>Bachelor of Commerce (B.Comm)</dt><dd>University of KwaZulu-Natal · 2002</dd>
          </dl>
        </div>
        <div class="card">
          <p class="k">At a glance</p>
          <dl class="dl kv">
            <dt>Degree</dt><dd>Doctor of Business Administration (DBA)</dd>
            <dt>Institution</dt><dd>University of KwaZulu-Natal (2021)</dd>
            <dt>Model</dt><dd>Super-Cube® (2020 thesis · peer-reviewed)</dd>
            <dt>Case context</dt><dd>African FMCG business-network</dd>
            <dt>Validation</dt><dd>Mixed-methods · CFA · thematic interviews</dd>
          </dl>
        </div>
      </div>
      <div class="card speak">
        <p class="k">Origins · born inside a real business network</p>
        <p>The thesis addressed leadership capacity challenges in Africa’s fast-moving consumer goods sector: rapid population growth, talent abundance alongside skills shortages, corruption pressures, poverty, conflict, and institutional weaknesses. Rather than import a purely Western template, Muller built and tested a multidimensional framework inside a live African business-network—bridging theory and practice for emerging-market leadership development.</p>
      </div>
      <div class="card speak">
        <p class="k">Speaking</p>
        <p>Keynotes, workshops and panels on the Super-Cube® leadership model and human-centric leadership: <b>Leadership is learnable: the six faces of the Super-Cube®</b> · <b>Measure growth, not attendance</b> · <b>Ubuntu and I–Thou: human-centric leadership</b> · <b>Leadership education as a development lever</b> · <b>Raising leaders early</b>. ${link(`${SITE}/speaking`, "super-cube.me/speaking")}</p>
      </div>
    </div>`));

  // 4 · The model
  const faceNote = (id) => {
    const c = by[id];
    return `<div class="fn" style="--c:${c.color}"><p class="fn-name">${esc(c.name)}</p><p class="fn-tag">${esc(c.tagline)}</p></div>`;
  };
  pages.push(page(`
    <div class="pad">
      ${eyebrow("The model")}
      <h2>Six faces of leadership. One person at the centre.</h2>
      <p class="lede">${esc(site.description)} Choices sit on top, Principles at the base, and Mental, Emotional, Physical and Spiritual form the sides—with the individual at the centre of the cube.</p>
      <div class="model">
        <div class="fcol">${faceNote("spiritual")}${faceNote("physical")}</div>
        <div class="mcol">${faceNote("choices")}${modelDiagram(constructs, radarOrder)}${faceNote("principles")}</div>
        <div class="fcol">${faceNote("mental")}${faceNote("emotional")}</div>
      </div>
      <div class="grid3 layers">
        <div><p class="k">Philosophy</p><p>Sets values: Ubuntu, Buber’s I–Thou and Wilber’s integral AQAL hold the leader as a whole person, never an object of control.</p></div>
        <div><p class="k">Theory</p><p>Explains how leadership works: from trait, behavioural and contingency schools to relational, shared and neuroscientific perspectives.</p></div>
        <div><p class="k">Model</p><p>Super-Cube® is the model learners can practise and assess—six developable faces, measured before and after.</p></div>
      </div>
      <h3 class="h3 mt">Five levels of application: from self to systems</h3>
      <ol class="levels5">
        ${levels.map((l) => `<li><span class="lvl">${l.level}</span><p class="lt">${esc(l.title)}</p><p class="ls">${esc(l.subtitle)}</p><p class="small">${esc(l.description)}</p></li>`).join("")}
      </ol>
    </div>`));

  // 5 · The six faces in depth
  pages.push(page(`
    <div class="pad">
      ${eyebrow("The six faces")}
      <h2>Each face is a developable domain.</h2>
      <p class="lede">Taught, practised, tracked and assessed. These are the skills the platform measures on every face (adult programme).</p>
      <div class="faces">
        ${constructs.map((c) => `
          <article class="face" style="--c:${c.color};--s:${c.colorSoft}">
            <header><span class="dot"></span><h3>${esc(c.name)}</h3></header>
            <p class="tag">${esc(c.tagline)}</p>
            <p>${esc(c.summary)}</p>
            <ul class="skills">${c.elements.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
            <p class="theory">${esc(c.theory)}</p>
          </article>`).join("")}
      </div>
    </div>`));

  // 6 · Theory map
  const { theoryCategories, theoryLiteratureOverview } = L.content;
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Foundations")}
      <h2>Grounded in theory, from the major schools to Ubuntu.</h2>
      <div class="split">
        <p class="body-p lede-like">${esc(theoryLiteratureOverview)}</p>
        <figure class="photo mid"><img src="${img.cubes}" alt="Glass cubes in the six face colours"></figure>
      </div>
      <div class="theory-cards">
        ${theoryCategories.map((t) => `
          <article class="card">
            <p class="lt">${esc(t.title)}</p>
            <p class="small">${esc(t.description)}</p>
            <p class="titems">${t.items.map((i) => esc(i.name)).join(" · ")}</p>
          </article>`).join("")}
      </div>
      <blockquote class="pull"><p>“I am because we are.”</p><cite>Ubuntu: African philosophy of personhood-in-relation—humanity, dignity, and shared becoming. A foundational stance of the Super-Cube® model.</cite></blockquote>
    </div>`));

  // 7 · Research
  const max = interventionGainScaleMax;
  pages.push(page(`
    <div class="pad">
      ${eyebrow("The research")}
      <h2>Tested before it was taught.</h2>
      <p class="lede">Super-Cube® came out of Dr Craig Muller’s doctoral research at the University of KwaZulu-Natal (thesis, 2020). The model was tested with a survey of 132 employees and interviews with 10 senior leaders, and published in peer-reviewed journals.</p>
      <div class="research-top">
        <div class="hero-num"><p class="k">12-week intervention result · Emotional face</p><p class="huge">+${interventionGains.find((g) => g.constructId === "emotional").gainPct}%</p><p class="small">Overall, all six faces: <b>+${overallInterventionGain}%</b></p></div>
        <figure class="photo"><img src="${img.research}" alt="A university library reading room"></figure>
      </div>
      <div class="bars card">
        <p class="k">Average pre- to post-assessment improvement, by face</p>
        ${interventionGains.map((g) => `<div class="bar"><span class="bn"><i style="background:${g.color}"></i>${esc(g.label)}</span><span class="track"><span style="width:${((g.gainPct / max) * 100).toFixed(1)}%;background:${g.color}"></span></span><span class="bv">+${g.gainPct}%</span></div>`).join("")}
        <p class="note">Intervention results: average pre- to post-assessment improvement in the 12-week, accredited Super-Cube® leadership intervention (NQF levels 3–5) with leaders at Imana Foods and Kerry Foods. The doctoral study built the model; it did not measure these gains. Highest gains: Principles (+45.1%) and Emotional (+39.5%). Not a promised outcome and not live programme data.</p>
      </div>
      <div class="grid4">${researchHighlights.map((h) => `<div><p class="lt">${esc(h.title)}</p><p class="small">${esc(h.body)}</p></div>`).join("")}</div>
      <div class="pubs">${publications.map((p) => `<p><span class="badge">${esc(p.badge)}</span> ${esc(p.authors)} (${p.year}). <b>${esc(p.title)}</b>. <i>${esc(p.journal)}</i>. ${link(p.doi, esc(p.doi.replace("https://", "")))}</p>`).join("")}</div>
    </div>`));

  // 8 · What we offer
  pages.push(page(`
    <div class="pad">
      ${eyebrow("What we offer")}
      <h2>One model for every stage of life.</h2>
      <p class="lede">The six faces stay the same as people grow. The language, examples and reporting change with who they are and where they lead.</p>
      <div class="offer">
        <article class="card"><p class="k">Individuals</p><h3>Grow your own leadership</h3><p>A free baseline, short courses for your age group and a before-and-after report. Kids 5–12 · Adolescents 13–21 · Adults 22+.</p>${link(`${SITE}/what`, "super-cube.me/what")}</article>
        <article class="card"><p class="k">Schools</p><h3>A pathway for every learner</h3><p>Age-appropriate leadership for learners aged 5 to 21, with progress views for teachers and consent built in.</p>${link(`${SITE}/schools`, "super-cube.me/schools")}</article>
        <article class="card"><p class="k">Organisations</p><h3>Develop leaders across a team</h3><p>Seat packs, cohort reporting and facilitated programmes for companies, NGOs and multi-entity networks.</p>${link(`${SITE}/organisations`, "super-cube.me/organisations")}</article>
        <article class="card"><p class="k">Speaking</p><h3>Keynotes and workshops</h3><p>Dr Craig Muller on learnable, human-centric leadership—keynote, workshop or panel, shaped to the audience.</p>${link(`${SITE}/speaking`, "super-cube.me/speaking")}</article>
      </div>
      <div class="split">
        <div>
          <h3 class="h3">Everything you need to grow, and to show it.</h3>
          <ul class="ticks">
            <li>A free six-face leadership baseline</li>
            <li>Six short courses, written for your age group</li>
            <li>A weekly practice plan focused on your weakest faces</li>
            <li>A second assessment to measure the change</li>
            <li>A before-and-after growth report (PDF)</li>
            <li>A certificate with a public verify ID</li>
            <li>Private journals: a coach sees your scores only if you agree</li>
          </ul>
        </div>
        <figure class="photo tall"><img src="${img.about}" alt="A leader looking out over a city at sunrise"></figure>
      </div>
      <div class="teaser">
        <div><p class="k">Free baseline</p><p class="tv">R0</p><p class="small">Six-face scores in about 10 minutes. No card needed.</p></div>
        <div><p class="k">Full programme, per person</p><p class="tv">R${COURSE_PRICE_ZAR} once</p><p class="small">About $${COURSE_PRICE_USD} USD. Courses, practice plan, second assessment, report and certificate. No subscription.</p></div>
        <div><p class="k">Groups, schools, organisations</p><p class="tv">From R${seatPackListPrice(SEAT_PACKS[0], "ZAR")}</p><p class="small">Seat packs for ${SEAT_PACKS[0].seats} learners, or a quote for a full programme with facilitation and reporting.</p></div>
      </div>
    </div>`));

  // 9 · Programmes
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Programmes")}
      <h2>Kids, Adolescents and Adults.</h2>
      <p class="lede">Every programme covers all six faces with a pre-assessment baseline, six construct courses (age-adapted), practice labs and checks, and a post-assessment with a personal report.</p>
      <div class="progs">
        ${programmes.map((p) => `
          <article class="prog">
            <div class="pband" style="${band(p.id)}"><p class="age" style="color:${PROGRAMME_THEME[p.id].accent}">${esc(p.ageLabel)}</p><h3>${esc(p.name)}</h3></div>
            <div class="pbody">
              <div class="pdesc"><p class="ptag">${esc(p.tagline)}</p>
              <p>${esc(p.description)}</p>
              <p class="small">${esc(p.audienceNote)}</p></div>
              <p class="k mt-s">Skills by face</p>
              <ul class="pskills">${constructs.map((c) => `<li><i style="background:${c.color}"></i><b>${esc(c.name)}</b> ${esc(skillsForProgramme(p.id, c.id).join(" · "))}</li>`).join("")}</ul>
              <p class="price">${zar(p.priceZar)} <span>· lifetime access</span></p>
            </div>
          </article>`).join("")}
      </div>
    </div>`));

  // 10 · Learning platform
  const sample = [
    // Illustrative composite from src/app/sample-report/page.tsx (not a real learner, not a research result).
    { id: "choices", pre: 48, post: 62 }, { id: "mental", pre: 50, post: 64 }, { id: "emotional", pre: 45, post: 60 },
    { id: "principles", pre: 55, post: 67 }, { id: "physical", pre: 58, post: 70 }, { id: "spiritual", pre: 57, post: 72 },
  ];
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Super-Cube® Learn")}
      <h2>Not a lecture. A development system.</h2>
      <p class="lede">Learners understand, practise, track and prove growth—on any device. Five stages, one coherent journey.</p>
      <ol class="journey">
        <li><span>01</span><p class="lt">Orient</p><p class="small">Clarify whether the learner thinks from philosophy, theory, or model—so education meets them where they are.</p></li>
        <li><span>02</span><p class="lt">Free baseline</p><p class="small">Baseline all six faces in about 10 minutes. Strengths and priorities become visible, discussable, and improvable.</p></li>
        <li><span>03</span><p class="lt">Learn the six faces</p><p class="small">Structured sessions for each face—age-adapted language and scenarios.</p></li>
        <li><span>04</span><p class="lt">Track &amp; practise</p><p class="small">Daily or weekly face pulses reveal patterns. Weekly plans adapt to the weakest faces.</p></li>
        <li><span>05</span><p class="lt">Re-measure &amp; report</p><p class="small">Post-assessment and a personal growth report, so growth is measured—not assumed.</p></li>
      </ol>
      <div class="split even stretch">
        <div class="card radar-card">
          <p class="k">Growth report · before → after</p>
          ${radar(constructs, sample)}
          <p class="legend"><span class="lg-b"></span>Before (dashed) <span class="lg-a"></span>After (filled)</p>
          <p class="note">Example only: the illustrative composite from the site’s sample report (overall 52 → 68), not a real learner or a research result.</p>
        </div>
        <div class="stack">
          <div class="card"><p class="k">Verifiable certificate</p><p>Completion certificates carry an ID like <b>SC-YYYYMMDD-HEX</b>. Anyone can check it at ${link(`${SITE}/verify`, "super-cube.me/verify")}.</p></div>
          <div class="card"><p class="k">Private by design</p><p>Journals stay private. Coaches see scores and completion only when learners consent—never journal text. Learners can turn sharing off at any time.</p></div>
          <div class="card"><p class="k">Continuous face tracking</p><p>Beyond one-off assessments: daily or weekly face pulses show patterns between assessments, and micro-practices adapt to each learner’s growth priorities.</p></div>
          <div class="card"><p class="k">Certification ladder</p><p><b>1 · Learner</b> completes the pathway.<br><b>2 · Practitioner</b> keeps a 30-day deliberate-practice streak.<br><b>3 · Facilitator</b> runs a cohort with the 8-week calendar, roster and consented heat map.</p></div>
        </div>
      </div>
    </div>`));

  // 11 · Schools and organisations
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Schools and organisations")}
      <h2>Leadership growth you can show a principal or a board.</h2>
      <div class="two">
        <article class="card">
          <figure class="photo short"><img src="${img.schools}" alt="Learners and teachers working together in a classroom"></figure>
          <p class="k">For schools</p><h3>Grow young leaders, and see the growth.</h3>
          <ul class="bul">
            <li><b>One model from Grade R to matric</b> and beyond, so the language of leadership stays consistent.</li>
            <li><b>Kids and Adolescents pathways</b> with short sessions that fit between classes.</li>
            <li><b>Cohort codes for teachers:</b> completion and growth snapshots; journals stay private.</li>
            <li><b>Safe by design:</b> run under your safeguarding and parental-consent policies; no public score comparisons.</li>
          </ul>
        </article>
        <article class="card">
          <figure class="photo short"><img src="${img.orgs}" alt="A leadership team meeting around a table"></figure>
          <p class="k">For organisations</p><h3>Develop leaders you can measure.</h3>
          <ul class="bul">
            <li><b>Whole-leader development</b> across all six faces, online at each leader’s pace.</li>
            <li><b>Optional facilitated sessions</b> with the 8-week facilitator calendar and coach tools.</li>
            <li><b>Cohort view, with consent:</b> completion and scores only where leaders agree.</li>
            <li><b>Before-and-after report:</b> pre → post change by face for the cohort, plus individual reports.</li>
          </ul>
        </article>
      </div>
      <h3 class="h3 mt">Four steps, from baseline to proof</h3>
      <ol class="four">
        <li><span>1</span><p class="lt">Pre-assessment</p><p class="small">A 10-minute, age-appropriate baseline across the six faces.</p></li>
        <li><span>2</span><p class="lt">Programme</p><p class="small">Six short courses and a weekly practice plan, weakest faces first.</p></li>
        <li><span>3</span><p class="lt">Post-assessment</p><p class="small">Re-measure at the end of the term or programme.</p></li>
        <li><span>4</span><p class="lt">Report</p><p class="small">A cohort report of the change; each learner gets a growth report and certificate.</p></li>
      </ol>
      <div class="card tools">
        <p class="k">Coach and cohort dashboards</p>
        <p>Cohort codes and roster · consented face heat map · before-and-after impact by face with 95% confidence intervals and effect sizes · CSV export and an ROI pack (PDF) · verify URLs for every certificate. Consented scores only—never journals.</p>
      </div>
    </div>`));

  // 12 · Pilot
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Pilots")}
      <h2>An 8-week pilot, ready to run.</h2>
      <p class="lede">Everything a principal, L&amp;D lead, or coach needs to run an 8-week Super-Cube® pilot—without inventing process from scratch. Pathway: orient → baseline → six faces → mid check-in → post → report &amp; certificate.</p>
      <ol class="weeks">
        ${cohortCalendar.map((w) => `<li><p class="wk">Week ${w.week}</p><p class="lt">${esc(w.title)}</p><p class="small">${esc(w.focus)}</p></li>`).join("")}
      </ol>
      <div class="split even">
        <div class="card"><p class="k">Safeguarding</p>
          <ul class="bul">
            <li>No forced public sharing of personal scores or journal text.</li>
            <li>Facilitators never grade ‘character’—only completion and growth effort.</li>
            <li>Parent and guardian communication emphasises development, not ranking.</li>
          </ul>
        </div>
        <div class="card"><p class="k">Pilot toolkit</p>
          <ul class="bul">
            <li>Org codes, roster, CSV export, face heat map and verify URLs.</li>
            <li>Facilitator kit with the 8-week rhythm and session notes.</li>
            <li>Draft consent language to adapt under your POPIA counsel.</li>
          </ul>
          <p>${link(`${SITE}/pilot-pack`, "super-cube.me/pilot-pack")} · ${link(`${SITE}/facilitator`, "super-cube.me/facilitator")}</p>
        </div>
      </div>
      <div class="quote-row">
        ${testimonials.filter((t) => ["norton", "mkhwanazi", "thevan-qa", "govender"].includes(t.id)).map((t) => `<blockquote><p>“${esc(t.quote)}”</p><cite>${esc(t.name)} · ${esc(t.org)}</cite></blockquote>`).join("")}
      </div>
      <p class="note">Named voices from leaders at Imana Foods and Kerry Foods on the Super-Cube® programme—developmental feedback, not paid endorsements.</p>
    </div>`));

  // 13 · Pricing
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Pricing")}
      <h2>Start free. Unlock the full pathway once.</h2>
      <p class="lede">Free baseline—then pay once with Paystack (R${COURSE_PRICE_ZAR} / $${COURSE_PRICE_USD} USD) for lifetime access. No subscription, no monthly fee: paid access never expires.</p>
      <div class="price-top">
        <div class="card"><p class="k">Free baseline</p><p class="huge">R0</p><p>Orient + six-face measure in about 10 minutes, without paying. No card needed.</p></div>
        <div class="card dark-card"><p class="k">Full programme, per person</p><p class="huge">${zar(COURSE_PRICE_ZAR)} <span>once</span></p><p>About $${COURSE_PRICE_USD} USD. Lifetime access to the full programme, report and certificate. One payment per programme.</p></div>
      </div>
      <div class="progs mini">
        ${programmes.map((p) => `
          <article class="prog">
            <div class="pband" style="${band(p.id)}"><p class="age" style="color:${PROGRAMME_THEME[p.id].accent}">${esc(p.ageLabel)}</p><h3>${esc(p.name)}</h3></div>
            <div class="pbody">
              <p class="price">${zar(p.priceZar)} <span>· lifetime access</span></p>
              <ul class="plist"><li><b>Lifetime access</b></li><li>Pre-assessment baseline</li><li>6 construct courses (age-adapted)</li><li>Practice labs &amp; checks</li><li>Post-assessment &amp; personal report</li></ul>
            </div>
          </article>`).join("")}
      </div>
      <div class="card seats">
        <div><p class="k">Schools · companies · cohorts</p><h3>Seat packs—pay once, get a cohort code</h3>
        <p>Each seat is lifetime access to the programme for that learner. We create a cohort code after payment; coaches see scores and completion only when learners consent.</p></div>
        <table>
          <thead><tr><th scope="col">Pack</th><th scope="col">For</th><th scope="col" class="r">Price (ZAR)</th><th scope="col" class="r">USD</th></tr></thead>
          <tbody>${SEAT_PACKS.map((s) => `<tr><td><b>${esc(s.label)}</b></td><td>${esc(s.blurb)}</td><td class="r">R${seatPackListPrice(s, "ZAR")}</td><td class="r">$${seatPackListPrice(s, "USD")}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="note">Prices as listed on ${link(`${SITE}/pricing`, "super-cube.me/pricing")}. For a grade, a whole school, facilitation or custom reporting, we’ll send a quote. Payments are processed securely by Paystack.</p>
    </div>`));

  // 14 · SDGs
  const pick = [4, 8, 16];
  pages.push(page(`
    <div class="pad">
      ${eyebrow("Why leadership · UN SDGs")}
      <h2>The world has goals. It needs leaders who can deliver them.</h2>
      <p class="lede">${esc(leadershipChallengeThesis)}</p>
      <div class="sdg-grid">${sdgGoals.map((g) => `<img src="${img[`sdg${String(g.id).padStart(2, "0")}`]}" alt="SDG ${g.id}: ${esc(g.short)}">`).join("")}</div>
      <p class="small">The 2030 Agenda asks for leaders who can hold complexity (Choices), earn trust (Principles), think in systems (Mental), mobilise people (Emotional), sustain energy (Physical), and serve a purpose larger than themselves (Spiritual).</p>
      <div class="grid3 sdg-cards">
        ${pick.map((id) => {
          const g = sdgGoals.find((x) => x.id === id), c = sdgChallenges.find((x) => x.id === id);
          return `<article class="card" style="border-top:3px solid ${g.color}"><p class="k" style="color:${g.color}">Goal ${g.id} · ${esc(g.short)}</p><p class="small">${esc(c.superCubeHelp)}</p></article>`;
        }).join("")}
      </div>
      <p class="note">Official UN SDG icons and titles · challenges framed for leadership development · Super-Cube® does not claim UN endorsement. Full goal-by-goal view: ${link(`${SITE}/leadership-challenges`, "super-cube.me/leadership-challenges")}</p>
    </div>`));

  // 15 · Contact (back cover)
  pages.push(page(`
    <div class="back">
      <img class="back-logo" src="${img.logoLight}" alt="Super-Cube®">
      <h2>Start with a free <span class="nw">10-minute</span> baseline.</h2>
      <p class="lede">See your six-face scores today. Leading a team or a school? Book a short call and we’ll plan a pilot with you.</p>
      <div class="contact">
        <div><p class="k">Email</p><p class="cv">${link("mailto:hello@super-cube.me", "hello@super-cube.me")}</p></div>
        <div><p class="k">Website</p><p class="cv">${link(SITE, "www.super-cube.me")}</p></div>
      </div>
      <ul class="links">
        <li>${link(`${SITE}/learn/start`, "Start free baseline")}<span>super-cube.me/learn/start</span></li>
        <li>${link(`${SITE}/pricing`, "Pricing and seat packs")}<span>super-cube.me/pricing</span></li>
        <li>${link(`${SITE}/schools`, "For schools")}<span>super-cube.me/schools</span></li>
        <li>${link(`${SITE}/organisations`, "For organisations")}<span>super-cube.me/organisations</span></li>
        <li>${link(`${SITE}/research`, "Research and evidence")}<span>super-cube.me/research</span></li>
        <li>${link(`${SITE}/contact`, "Contact us")}<span>super-cube.me/contact</span></li>
        <li>${link("https://za.linkedin.com/in/craigmuller", "Dr Craig Muller on LinkedIn")}<span>linkedin.com/in/craigmuller</span></li>
        <li>${link(site.researchGateUrl, "Dr Craig Muller on ResearchGate")}<span>researchgate.net/profile/Craig-Muller</span></li>
      </ul>
      <div class="credit">
        <p class="motto">Feed. Educate. Empower.</p>
        <p>Super-Cube® is part of ${link("https://bigfivegroup.africa/leadership", "Big Five Learn")}, the Educate pillar of ${link("https://bigfivegroup.africa", "Big Five Group™")}.</p>
        <p class="small">© ${new Date().getFullYear()} Super-Cube® Leadership Model. All rights reserved. Gains are from the 12-week Super-Cube® leadership intervention with Imana Foods and Kerry Foods and are not live programme data.</p>
      </div>
    </div>`, { dark: true, cls: "backpage", footer: false }));

  return pages.join("\n");
}

const CSS = (font) => `
@font-face { font-family: "Inter"; src: url("${font("Inter-400")}") format("woff"); font-weight: 400; }
@font-face { font-family: "Inter"; src: url("${font("Inter-500")}") format("woff"); font-weight: 500; }
@font-face { font-family: "Inter"; src: url("${font("Inter-600")}") format("woff"); font-weight: 600; }
@font-face { font-family: "Inter"; src: url("${font("Inter-700")}") format("woff"); font-weight: 700; }
@font-face { font-family: "Inter Display"; src: url("${font("InterDisplay-700")}") format("woff"); font-weight: 700; }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Inter", sans-serif; color: #0a0a0a; font-size: 9.4pt; line-height: 1.5; font-feature-settings: "cv11", "ss01"; }
a { color: inherit; text-decoration: none; border-bottom: 0.6px solid currentColor; white-space: nowrap; }
.nw { white-space: nowrap; }
h1, h2, h3 { text-wrap: balance; }
p, li, dd { text-wrap: pretty; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #fff; }
.page:last-child { page-break-after: auto; }
.spectrum { position: absolute; top: 0; left: 0; right: 0; height: 2.2mm; background: linear-gradient(90deg, #b32026, #5d1f5e, #26408c, #16979a, #367638, #ed8f20); z-index: 3; }
.pad { padding: 17mm 17mm 0; }
.foot { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 7pt; color: #6b6b6b; border-top: 0.5px solid rgba(0,0,0,.1); padding-top: 2.5mm; letter-spacing: .02em; }
.foot a { border: 0; }
.foot .pn { font-weight: 600; color: #0a0a0a; }
.eyebrow { font-size: 7pt; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #6b6b6b; margin-bottom: 3mm; }
h1, h2, .huge, .big, .motto, .cv { font-family: "Inter Display", "Inter", sans-serif; }
h1 { font-size: 34pt; line-height: 1.04; letter-spacing: -0.035em; font-weight: 700; }
h2 { font-size: 22pt; line-height: 1.1; letter-spacing: -0.03em; font-weight: 700; max-width: 165mm; }
h3 { font-size: 11.5pt; line-height: 1.25; letter-spacing: -0.015em; font-weight: 600; }
.h3 { margin-bottom: 2mm; }
.mt { margin-top: 7mm; }
.mt-s { margin-top: 3mm; }
.lede { font-size: 10.6pt; line-height: 1.5; color: #4a4a4a; margin-top: 4mm; max-width: 170mm; }
p + p { margin-top: 2mm; }
.small { font-size: 8pt; line-height: 1.45; color: #4a4a4a; }
.note { font-size: 7pt; line-height: 1.45; color: #6b6b6b; margin-top: 3mm; }
.k { font-size: 6.8pt; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #6b6b6b; margin-bottom: 1.5mm; }
.lt { font-weight: 600; font-size: 9.6pt; letter-spacing: -0.01em; }
.card { border: 0.6px solid rgba(0,0,0,.1); border-radius: 3.5mm; padding: 4.5mm 5mm; background: #fff; break-inside: avoid; }
.card.hl { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
.card.hl .k { color: rgba(255,255,255,.6); }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-top: 5mm; }
.split { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 7mm; margin-top: 7mm; align-items: start; }
.split.even { grid-template-columns: 1fr 1fr; gap: 5mm; }
.photo { border-radius: 3.5mm; overflow: hidden; background: #f4f4f4; }
.photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.photo.tall { height: 72mm; }
.photo.contain { background: #fff; }
.photo.contain img { object-fit: contain; }
.photo.short { height: 34mm; margin: -4.5mm -5mm 4mm; border-radius: 3.5mm 3.5mm 0 0; }
.chips { display: flex; gap: 2mm; flex-wrap: wrap; margin-top: 4mm; }
.chips span { border: 0.6px solid rgba(0,0,0,.14); border-radius: 99px; padding: 1mm 3mm; font-size: 7.6pt; font-weight: 600; }

/* cover */
.cover { background: #0a0a0a; color: #fff; }
.cover-img { position: absolute; inset: 0 0 auto 0; height: 170mm; background-size: cover; background-position: 64% 50%; }
.cover-fade { position: absolute; left: 0; right: 0; top: 110mm; height: 62mm; background: linear-gradient(180deg, rgba(10,10,10,0), #0a0a0a 92%); }
.cover-logo { position: absolute; top: 15mm; left: 17mm; width: 52mm; }
.cover-text { position: absolute; left: 17mm; right: 17mm; bottom: 20mm; }
.cover .eyebrow { color: rgba(255,255,255,.6); }
.cover .lede { color: rgba(255,255,255,.75); font-size: 11.5pt; max-width: 150mm; margin-top: 6mm; }
.cover-faces { display: flex; flex-wrap: wrap; gap: 2mm 5mm; margin-top: 9mm; font-size: 8.4pt; font-weight: 600; }
.cover-faces span { display: inline-flex; align-items: center; gap: 1.8mm; }
.cover-faces i { width: 2.6mm; height: 2.6mm; border-radius: 50%; display: inline-block; }
.cover-by { margin-top: 9mm; padding-top: 4mm; border-top: 0.6px solid rgba(255,255,255,.18); font-size: 8pt; color: rgba(255,255,255,.65); }

/* who we are */
.pillars { margin-top: 7mm; }
.motto { font-size: 15pt; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3.5mm; }
.pillars .card p:last-child { font-size: 8.2pt; line-height: 1.45; margin-top: 1.5mm; }
.card.hl p:last-child { color: rgba(255,255,255,.8); }
.steps { list-style: none; margin-top: 3mm; counter-reset: s; }
.steps li { position: relative; padding-left: 8mm; margin-top: 2.5mm; }
.steps li::before { counter-increment: s; content: counter(s); position: absolute; left: 0; top: .2mm; width: 5.2mm; height: 5.2mm; border-radius: 50%; background: #0a0a0a; color: #fff; font-size: 7pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.statrow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-top: 8mm; border-top: 0.6px solid rgba(0,0,0,.1); padding-top: 5mm; }
.big { font-size: 20pt; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
.statrow .k { margin-top: 1.5mm; color: #0a0a0a; }
.statrow .small { font-size: 7.4pt; }

/* founder */
.founder { display: grid; grid-template-columns: 58mm 1fr; gap: 8mm; margin-top: 2mm; }
.portrait { height: 77mm; border-radius: 3.5mm; overflow: hidden; background: #eee; }
.portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 20%; display: block; }
.sub { font-weight: 600; color: #4a4a4a; margin: 2mm 0 4mm; }
.founder p:not(.sub) { font-size: 9.2pt; }
.dl dt { font-weight: 600; font-size: 8.6pt; margin-top: 2.6mm; }
.dl dt:first-of-type { margin-top: 0; }
.dl dd { font-size: 8pt; color: #4a4a4a; }
.dl.kv { display: grid; grid-template-columns: 24mm 1fr; gap: 2.4mm 3mm; }
.dl.kv dt, .dl.kv dd { margin: 0; font-size: 8.2pt; }
.dl.kv dt { color: #6b6b6b; font-weight: 500; }
.dl.kv dd { color: #0a0a0a; font-weight: 600; }
.speak { margin-top: 5mm; }
.speak p:last-child { font-size: 8.4pt; }

/* model */
.model { display: grid; grid-template-columns: 1fr 100mm 1fr; align-items: center; gap: 3mm; margin-top: 3mm; }
.mcol { display: flex; flex-direction: column; align-items: center; }
.mcol .fn { text-align: center; border: 0; padding: 0; }
.fcol { display: flex; flex-direction: column; gap: 26mm; }
.fn { border-left: 2.4px solid var(--c); padding-left: 3mm; }
.fcol:last-child .fn { border-left: 0; border-right: 2.4px solid var(--c); padding: 0 3mm 0 0; text-align: right; }
.fn-name { font-weight: 700; color: var(--c); font-size: 10.5pt; letter-spacing: -0.01em; }
.fn-tag { font-size: 7.8pt; line-height: 1.35; color: #4a4a4a; margin-top: .6mm !important; }
.model-svg { width: 98mm; height: auto; display: block; margin: 2mm 0; }
.tri-label { font: 700 12.5px Inter, sans-serif; fill: #fff; letter-spacing: -0.01em; }
.you { font: 700 15px Inter, sans-serif; fill: #0a0a0a; }
.you-sub { font: 500 8.5px Inter, sans-serif; fill: #6b6b6b; }
.layers { margin-top: 5mm; border-top: 0.6px solid rgba(0,0,0,.1); padding-top: 5mm; }
.layers p:last-child { font-size: 8.3pt; color: #4a4a4a; }

.levels5 { list-style: none; display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; }
.levels5 li { border-top: 2px solid #0a0a0a; padding-top: 2.5mm; }
.levels5 .lvl { font-size: 7pt; font-weight: 700; color: #6b6b6b; letter-spacing: .1em; }
.levels5 .lt { margin-top: .8mm; font-size: 9pt; }
.levels5 .ls { font-size: 7.4pt; font-weight: 600; color: #4a4a4a; margin-top: .3mm; }
.levels5 .small { font-size: 7.1pt; line-height: 1.4; margin-top: 1mm; }
/* faces */
.faces { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 6mm; }
.face { border: 0.6px solid rgba(0,0,0,.1); border-top: 3px solid var(--c); border-radius: 3mm; padding: 4mm 4.5mm; break-inside: avoid; }
.face header { display: flex; align-items: center; gap: 2mm; }
.face .dot { width: 3mm; height: 3mm; border-radius: 50%; background: var(--c); }
.face h3 { color: var(--c); font-size: 12pt; }
.face .tag { font-weight: 600; font-size: 8.6pt; margin-top: 1mm; }
.face p { font-size: 8.1pt; line-height: 1.42; }
.skills { list-style: none; display: flex; flex-wrap: wrap; gap: 1.2mm; margin-top: 2.5mm; }
.skills li { background: var(--s); color: #0a0a0a; border-radius: 99px; padding: .6mm 2.4mm; font-size: 7.2pt; font-weight: 600; }
.face .theory { font-size: 7.1pt; color: #6b6b6b; margin-top: 2.5mm; }

/* theory + levels */
.theories { list-style: none; margin-top: 3mm; }
.theories li { padding: 2mm 0; border-top: 0.6px solid rgba(0,0,0,.08); font-size: 8pt; display: grid; grid-template-columns: 34mm 1fr; gap: 3mm; }
.theories li span { color: #4a4a4a; }
.body-p { font-size: 8.8pt; color: #333; }
.levels { list-style: none; display: grid; grid-template-columns: 1fr; gap: 0; }
.levels li { display: grid; grid-template-columns: 10mm 1fr; gap: 3mm; padding: 2.6mm 0; border-top: 0.6px solid rgba(0,0,0,.08); }
.levels .lvl { width: 7mm; height: 7mm; border-radius: 50%; background: #0a0a0a; color: #fff; font-weight: 700; font-size: 8pt; display: flex; align-items: center; justify-content: center; }
.levels .lt span { font-weight: 500; color: #6b6b6b; }
.levels p:not(.lt) { font-size: 8.2pt; color: #4a4a4a; margin-top: .5mm; }

.lede-like { font-size: 9.8pt; line-height: 1.55; color: #333; }
.photo.mid { height: 50mm; }
.theory-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 6mm; }
.theory-cards .card:last-child { grid-column: 1 / -1; }
.theory-cards .card { padding: 4mm 4.5mm; }
.theory-cards .small { margin-top: 1mm; font-size: 8pt; }
.titems { margin-top: 2mm !important; padding-top: 2mm; border-top: 0.6px solid rgba(0,0,0,.08); font-size: 7.8pt; line-height: 1.5; font-weight: 600; color: #0a0a0a; }
.pull { margin-top: 8mm; border-left: 3px solid #0a0a0a; padding-left: 5mm; }
.pull p { font-family: "Inter Display", "Inter", sans-serif; font-size: 20pt; font-weight: 700; letter-spacing: -0.03em; }
.pull cite { font-size: 8pt; max-width: 140mm; }
/* research */
.research-top { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin-top: 6mm; }
.hero-num { background: #0a0a0a; color: #fff; border-radius: 3.5mm; padding: 6mm; display: flex; flex-direction: column; justify-content: center; }
.hero-num .k { color: rgba(255,255,255,.6); }
.huge { font-size: 38pt; font-weight: 700; letter-spacing: -0.04em; line-height: 1; }
.huge span { font-size: 12pt; font-weight: 500; letter-spacing: 0; color: #6b6b6b; }
.hero-num .small { color: rgba(255,255,255,.75); margin-top: 3mm; }
.research-top .photo { height: 46mm; }
.bars { margin-top: 5mm; }
.bar { display: grid; grid-template-columns: 26mm 1fr 14mm; align-items: center; gap: 3mm; margin-top: 2.2mm; font-size: 8.6pt; }
.bn { font-weight: 600; display: flex; align-items: center; gap: 1.8mm; }
.bn i { width: 2.2mm; height: 2.2mm; border-radius: 50%; display: inline-block; }
.track { height: 2.6mm; border-radius: 99px; background: rgba(0,0,0,.06); overflow: hidden; display: block; }
.track span { display: block; height: 100%; border-radius: 99px; }
.bv { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
.pubs { margin-top: 5mm; border-top: 0.6px solid rgba(0,0,0,.1); padding-top: 3mm; }
.pubs p { font-size: 7.6pt; line-height: 1.45; color: #333; }
.badge { display: inline-block; font-size: 6.4pt; font-weight: 700; letter-spacing: .08em; background: #0a0a0a; color: #fff; border-radius: 1mm; padding: .2mm 1.4mm; }

/* offer */
.offer { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 6mm; }
.offer .card p:not(.k) { font-size: 8.4pt; color: #4a4a4a; margin: 1.5mm 0 2mm; }
.offer .card a { font-size: 8pt; font-weight: 600; }
.ticks { list-style: none; margin-top: 2mm; }
.ticks li { position: relative; padding: 1.6mm 0 1.6mm 6mm; border-top: 0.6px solid rgba(0,0,0,.07); font-size: 8.8pt; }
.ticks li::before { content: "✓"; position: absolute; left: 0; font-weight: 700; color: #367638; }

.teaser { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 7mm; background: #0a0a0a; color: #fff; border-radius: 3.5mm; padding: 5.5mm 6mm; }
.teaser .k { color: rgba(255,255,255,.6); }
.teaser .tv { font-family: "Inter Display", "Inter", sans-serif; font-size: 17pt; font-weight: 700; letter-spacing: -0.03em; }
.teaser .small { color: rgba(255,255,255,.72); font-size: 7.6pt; margin-top: 1mm; }
/* programmes */
.progs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 6mm; }
.prog { border: 0.6px solid rgba(0,0,0,.1); border-radius: 3.5mm; overflow: hidden; display: flex; flex-direction: column; break-inside: avoid; }
.pband { padding: 5mm 4.5mm 4.5mm; min-height: 27mm; }
.pdesc { min-height: 58mm; }
.pdesc p { font-size: 8pt; line-height: 1.45; color: #4a4a4a; }
.pdesc p + p { margin-top: 2mm; }
.pband .age { font-size: 6.8pt; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.pband h3 { font-size: 12.5pt; margin-top: 1mm; }
.pbody { padding: 4mm 4.5mm 4.5mm; display: flex; flex-direction: column; flex: 1; }
.pbody > p:not(.k) { font-size: 8pt; line-height: 1.45; color: #4a4a4a; }
.ptag { font-weight: 600; color: #0a0a0a !important; font-size: 8.8pt !important; }
.pskills { list-style: none; }
.pskills li { font-size: 7.3pt; line-height: 1.35; padding: 1.1mm 0; border-top: 0.6px solid rgba(0,0,0,.06); color: #4a4a4a; }
.pskills li b { color: #0a0a0a; font-weight: 600; margin-right: 1mm; }
.pskills i { display: inline-block; width: 1.8mm; height: 1.8mm; border-radius: 50%; margin-right: 1.4mm; vertical-align: .2mm; }
.price { font-size: 17pt !important; font-weight: 700; letter-spacing: -0.03em; color: #0a0a0a !important; margin-top: auto !important; padding-top: 3mm; }
.price span { font-size: 8pt; font-weight: 500; color: #6b6b6b; letter-spacing: 0; }

/* journey */
.journey { list-style: none; display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; margin-top: 6mm; }
.journey li { border-top: 2px solid #0a0a0a; padding-top: 2.5mm; }
.journey span { font-size: 7pt; font-weight: 700; color: #6b6b6b; letter-spacing: .1em; }
.journey .lt { margin-top: 1mm; font-size: 9pt; }
.journey .small { font-size: 7.4pt; margin-top: 1mm; }
.radar-svg { width: 100%; height: 74mm; display: block; margin: 2mm 0; flex: none; }
.rad-label { font: 700 12px Inter, sans-serif; }
.rad-num { font-weight: 500; fill: #4a4a4a; }
.legend { font-size: 7.4pt; color: #4a4a4a; display: flex; align-items: center; gap: 2mm; }
.lg-b, .lg-a { display: inline-block; width: 6mm; height: 0; border-top: 1.3px dashed #6b6b6b; }
.lg-a { border-top: 2px solid #0a0a0a; margin-left: 3mm; }
.split.stretch { align-items: stretch; }
.radar-card { display: flex; flex-direction: column; justify-content: space-between; }
.stack { display: flex; flex-direction: column; gap: 4mm; }
.stack .card p:not(.k) { font-size: 8.4pt; color: #333; }

/* schools + orgs */
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin-top: 6mm; }
.two .card h3 { margin-bottom: 2mm; }
.bul { list-style: none; }
.bul li { position: relative; padding: 1.3mm 0 1.3mm 4mm; font-size: 8.2pt; line-height: 1.42; color: #333; }
.bul li::before { content: ""; position: absolute; left: 0; top: 2.75mm; width: 1.5mm; height: 1.5mm; border-radius: 50%; background: #2563eb; }
.four { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.four li { background: #fafafa; border-radius: 3mm; padding: 3.5mm; }
.four span { display: inline-flex; width: 5.5mm; height: 5.5mm; border-radius: 50%; background: #0a0a0a; color: #fff; font-size: 7.4pt; font-weight: 700; align-items: center; justify-content: center; }
.four .lt { margin-top: 2mm; }
.tools { margin-top: 5mm; }
.tools p:last-child { font-size: 8.6pt; color: #333; }

/* pilot */
.weeks { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 6mm; }
.weeks li { border: 0.6px solid rgba(0,0,0,.1); border-radius: 3mm; padding: 3.5mm; }
.wk { font-size: 6.8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #2563eb; }
.weeks .lt { margin-top: 1mm; font-size: 9pt; }
.weeks .small { font-size: 7.6pt; margin-top: 1mm; }
.quote-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 8mm; margin-top: 8mm; }
blockquote { border-left: 2px solid #0a0a0a; padding-left: 3.5mm; }
blockquote p { font-size: 10pt; line-height: 1.4; font-weight: 600; letter-spacing: -0.01em; }
cite { display: block; font-style: normal; font-size: 7.4pt; color: #6b6b6b; margin-top: 2mm; font-weight: 600; }

/* pricing */
.price-top { display: grid; grid-template-columns: 1fr 1.3fr; gap: 4mm; margin-top: 6mm; }
.price-top .huge { margin: 1mm 0 2mm; }
.price-top p:last-child { font-size: 8.4pt; color: #4a4a4a; }
.dark-card { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
.dark-card .k, .dark-card p:last-child { color: rgba(255,255,255,.72) !important; }
.dark-card .huge span { color: rgba(255,255,255,.6); }
.progs.mini { margin-top: 4mm; }
.progs.mini .pband { min-height: 22mm; padding: 4mm 4.5mm; }
.progs.mini .price { padding-top: 0; margin-top: 0 !important; font-size: 15pt !important; }
.plist { list-style: none; margin-top: 2mm; }
.plist li { font-size: 7.8pt; padding: .9mm 0; border-top: 0.6px solid rgba(0,0,0,.06); color: #4a4a4a; }
.plist li b { color: #0a0a0a; }
.seats { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 6mm; margin-top: 4mm; align-items: center; }
.seats p:not(.k) { font-size: 8.2pt; color: #4a4a4a; margin-top: 1.5mm; }
table { width: 100%; border-collapse: collapse; font-size: 8.4pt; }
th { text-align: left; font-size: 6.8pt; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #6b6b6b; padding-bottom: 1.5mm; border-bottom: 0.6px solid rgba(0,0,0,.14); }
td { padding: 2mm 1mm 2mm 0; border-bottom: 0.6px solid rgba(0,0,0,.07); }
.r { text-align: right; font-variant-numeric: tabular-nums; }
td.r { font-weight: 600; }

/* sdg */
.sdg-grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.6mm; margin: 6mm 0 4mm; }
.sdg-grid img { width: 100%; aspect-ratio: 1; display: block; border-radius: .8mm; }
.sdg-cards { margin-top: 5mm; }

/* back */
.backpage { background: #0a0a0a; color: #fff; }
.back { padding: 24mm 17mm 0; }
.back-logo { width: 58mm; margin-bottom: 18mm; }
.back h2 { font-size: 28pt; max-width: 150mm; }
.back .lede { color: rgba(255,255,255,.72); }
.contact { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 12mm; padding: 6mm 0; border-top: 0.6px solid rgba(255,255,255,.18); border-bottom: 0.6px solid rgba(255,255,255,.18); }
.back .k { color: rgba(255,255,255,.55); }
.cv { font-size: 16pt; font-weight: 600; letter-spacing: -0.02em; }
.cv a { border-bottom-color: rgba(255,255,255,.35); }
.links { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0 8mm; margin-top: 8mm; }
.links li { padding: 2.4mm 0; border-bottom: 0.6px solid rgba(255,255,255,.1); font-size: 9pt; font-weight: 600; display: flex; flex-direction: column; }
.links a { border: 0; }
.links span { font-size: 7.4pt; font-weight: 400; color: rgba(255,255,255,.55); }
.credit { position: absolute; left: 17mm; right: 17mm; bottom: 16mm; }
.credit .motto { font-size: 13pt; margin-bottom: 2mm; }
.credit p { color: rgba(255,255,255,.75); font-size: 9pt; }
.credit .small { color: rgba(255,255,255,.5); font-size: 7.2pt; margin-top: 3mm; }
`;

async function main() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sc-profile-"));
  const L = await loadLib(
    ["content", "programmes", "programme-theme", "impact", "seat-packs", "testimonials", "facilitator", "sdgs", "leadership-challenges"],
    tmp,
  );
  const img = await prepImages(tmp);
  // Static instances of Inter (cut from the variable font): Chromium embeds
  // these as real TrueType fonts, where a variable font would become Type 3.
  const font = (name) => pathToFileURL(path.join(here, "fonts", `${name}.woff`)).href;
  const html = `<!doctype html><html lang="en-ZA"><head><meta charset="utf-8">
<title>${esc(META.title)}</title><meta name="author" content="${esc(META.author)}"><meta name="description" content="${esc(META.subject)}">
<style>${CSS(font)}</style></head><body>${nowrapBrand(build(L, img))}</body></html>`;
  const htmlFile = path.join(tmp, "profile.html");
  await fs.writeFile(htmlFile, html);
  if (outHtml) await fs.writeFile(path.resolve(outHtml), html);

  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: ["--no-sandbox"],
  });
  const pg = await browser.newPage();
  await pg.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
  await pg.evaluate(() => document.fonts.ready);
  const pdf = await pg.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  await browser.close();
  await fs.mkdir(path.dirname(outPdf), { recursive: true });
  await fs.writeFile(outPdf, setInfo(pdf, META));
  await fs.rm(tmp, { recursive: true, force: true });
  console.log(`Wrote ${path.relative(root, outPdf)} · ${pageNo} pages · ${(pdf.length / 1024).toFixed(0)} KB`);
}

/**
 * Chromium sets only /Title. Append an incremental update that rewrites the
 * Info dictionary (title, author, subject, keywords) and asks viewers to show
 * the title instead of the file name. Classic xref table (Skia/PDF 1.4).
 */
function setInfo(buf, meta) {
  const text = buf.toString("latin1");
  const trailer = text.slice(text.lastIndexOf("trailer"));
  const prev = Number(text.slice(text.lastIndexOf("startxref") + 9).trim().split(/\s/)[0]);
  const size = Number(/\/Size\s+(\d+)/.exec(trailer)[1]);
  const rootRef = /\/Root\s+(\d+)\s+0\s+R/.exec(trailer)[1];
  const infoRef = /\/Info\s+(\d+)\s+0\s+R/.exec(trailer)?.[1];
  const u16 = (s) => "<FEFF" + Buffer.from(s, "utf16le").swap16().toString("hex").toUpperCase() + ">";
  const rootBody = new RegExp(`(?:^|\\n)${rootRef} 0 obj\\s*<<([\\s\\S]*?)>>\\s*endobj`).exec(text)[1];
  const created = /\/CreationDate\s*(\([^)]*\))/.exec(text)?.[1] ?? "";
  const infoNum = infoRef ? Number(infoRef) : size;
  const objs = [
    [Number(rootRef), `<<${rootBody.replace(/\/ViewerPreferences\s*<<[^>]*>>/, "")} /ViewerPreferences << /DisplayDocTitle true >> >>`],
    [infoNum, `<< /Title ${u16(meta.title)} /Author ${u16(meta.author)} /Subject ${u16(meta.subject)} /Keywords ${u16(meta.keywords)} /Creator (scripts/company-profile/build.mjs) /Producer (Chromium Skia/PDF)${created ? ` /CreationDate ${created}` : ""} >>`],
  ].sort((a, b) => a[0] - b[0]);
  let out = text.endsWith("\n") ? "" : "\n";
  let offset = buf.length + out.length;
  const offsets = [];
  for (const [num, body] of objs) {
    const s = `${num} 0 obj\n${body}\nendobj\n`;
    offsets.push([num, offset]);
    out += s;
    offset += Buffer.byteLength(s, "latin1");
  }
  const xrefPos = offset;
  out += "xref\n";
  for (const [num, off] of offsets) out += `${num} 1\n${String(off).padStart(10, "0")} 00000 n \n`;
  const newSize = Math.max(size, infoNum + 1);
  out += `trailer\n<< /Size ${newSize} /Root ${rootRef} 0 R /Info ${infoNum} 0 R /Prev ${prev} >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.concat([buf, Buffer.from(out, "latin1")]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
