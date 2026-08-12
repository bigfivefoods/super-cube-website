/**
 * Super-Cube® overview PowerPoint (widescreen executive deck).
 * Output: public/downloads/super-cube-overview.pptx
 *
 * Design: rainbow construct-colour header + logo pill, cream content slides,
 * dark title/CTA with rainbow strip, footers (www + n/N) on every slide.
 */
import PptxGenJS from "pptxgenjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "public/downloads/super-cube-overview.pptx");
const assetsDir = path.join(root, "scripts/.pptx-assets");
const gradientPath = path.join(assetsDir, "rainbow-header.png");

// ── Brand tokens (no # for pptxgenjs) ──────────────────────────────────────
const C = {
  ink: "0A0A0A",
  inkSoft: "141414",
  paper: "F7F5F0",
  cream: "FBF9F4",
  white: "FFFFFF",
  muted: "6B7280",
  slate: "475569",
  line: "E7E5E0",
  lineDark: "2A2A2A",
  darkCard: "161616",
  darkChip: "1F1F1F",
};

/** Construct rainbow order: Choices → Principles → Mental → Emotional → Physical → Spiritual */
const RAINBOW = ["B32026", "5D1F5E", "ED8F20", "367638", "16979A", "26408C"];

const faces = [
  {
    name: "Choices",
    tagline: "Decision-making under complexity",
    theory: "Choice theory",
    color: "B32026",
  },
  {
    name: "Principles",
    tagline: "Ethical foundations & trust",
    theory: "Principle-centred leadership",
    color: "5D1F5E",
  },
  {
    name: "Mental",
    tagline: "Clarity, vision, problem-solving",
    theory: "Cognition theory",
    color: "ED8F20",
  },
  {
    name: "Emotional",
    tagline: "Self & social intelligence",
    theory: "EI ability model",
    color: "367638",
  },
  {
    name: "Physical",
    tagline: "Energy, presence, stamina",
    theory: "Wheel of Wellness",
    color: "16979A",
  },
  {
    name: "Spiritual",
    tagline: "Purpose, contribution, example",
    theory: "Spiritual intelligence",
    color: "26408C",
  },
];

const W = 13.333;
const H = 7.5;
const M = 0.5; // margin
const HEADER_H = 0.92;
const FOOTER_Y = 7.12;
const CONTENT_TOP = 1.2; // below rainbow header

const logoPath = path.join(root, "public/brand/logo.png");
const hasLogo = fs.existsSync(logoPath);

const TOTAL_PAGES = 12;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fresh soft shadow object every call (pptxgenjs mutates / reuses badly). */
function makeShadow() {
  return {
    type: "outer",
    color: "000000",
    blur: 10,
    offset: 3,
    opacity: 0.1,
  };
}

/** Hex RGB interpolate between two 6-char hex strings. */
function lerpHex(a, b, t) {
  const parse = (h) => [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bch = Math.round(ab + (bb - ab) * t);
  return (
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    bch.toString(16).padStart(2, "0")
  ).toUpperCase();
}

/** Build a smooth multi-stop rainbow PNG for the header bar. */
async function ensureRainbowPng() {
  fs.mkdirSync(assetsDir, { recursive: true });
  const width = 1600;
  const height = 120;
  const stops = RAINBOW;
  const segments = stops.length - 1;
  // raw RGB buffer
  const buf = Buffer.alloc(width * height * 3);
  for (let x = 0; x < width; x++) {
    const pos = (x / (width - 1)) * segments;
    const i = Math.min(Math.floor(pos), segments - 1);
    const t = pos - i;
    const hex = lerpHex(stops[i], stops[i + 1], t);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    for (let y = 0; y < height; y++) {
      const o = (y * width + x) * 3;
      buf[o] = r;
      buf[o + 1] = g;
      buf[o + 2] = b;
    }
  }
  await sharp(buf, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(gradientPath);
  return gradientPath;
}

/**
 * Rainbow header bar with optional title and logo on white pill.
 * @param {object} slide
 * @param {object} pptx
 * @param {{ title?: string, showLogo?: boolean, darkStripOnly?: boolean }} opts
 */
function addRainbowHeader(slide, pptx, opts = {}) {
  const { title, showLogo = true, darkStripOnly = false } = opts;
  const h = darkStripOnly ? 0.22 : HEADER_H;

  slide.addImage({
    path: gradientPath,
    x: 0,
    y: 0,
    w: W,
    h,
  });

  if (darkStripOnly) return;

  // Logo on white rounded pill (avoids clash with gradient)
  if (showLogo && hasLogo) {
    const pillW = 1.85;
    const pillH = 0.52;
    const pillX = M;
    const pillY = (HEADER_H - pillH) / 2;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: pillX,
      y: pillY,
      w: pillW,
      h: pillH,
      fill: { color: C.white },
      line: { color: C.white },
      rectRadius: 0.12,
      shadow: makeShadow(),
    });
    // logo.png is wide (~4.7:1); fit inside pill with padding
    slide.addImage({
      path: logoPath,
      x: pillX + 0.12,
      y: pillY + 0.1,
      w: pillW - 0.24,
      h: pillH - 0.2,
    });
  }

  if (title) {
    const titleX = showLogo && hasLogo ? M + 2.05 : M;
    slide.addText(title, {
      x: titleX,
      y: 0.22,
      w: W - titleX - M,
      h: 0.5,
      fontSize: 22,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
      valign: "middle",
    });
  }
}

/**
 * Footer: left www.super-cube.me · right n/total
 */
function addFooter(slide, pageNum, totalPages, opts = {}) {
  const { dark = false } = opts;
  const col = dark ? "A3A3A3" : C.muted;
  slide.addText("www.super-cube.me", {
    x: M,
    y: FOOTER_Y,
    w: 5,
    h: 0.28,
    fontSize: 11,
    fontFace: "Calibri",
    color: col,
    margin: 0,
  });
  slide.addText(`${pageNum}/${totalPages}`, {
    x: W - M - 1.2,
    y: FOOTER_Y,
    w: 1.2,
    h: 0.28,
    fontSize: 11,
    fontFace: "Calibri",
    color: col,
    align: "right",
    margin: 0,
  });
}

/** Section eyebrow above page title (content slides with header-as-title use differently). */
function addPageTitle(slide, text, y = CONTENT_TOP + 0.08) {
  slide.addText(text, {
    x: M,
    y,
    w: W - 2 * M,
    h: 0.5,
    fontSize: 26,
    fontFace: "Georgia",
    bold: true,
    color: C.ink,
    margin: 0,
  });
}

function addCard(slide, pptx, { x, y, w, h, fill = C.white, line = C.line, radius = 0.1, shadow = true }) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: line },
    rectRadius: radius,
    ...(shadow ? { shadow: makeShadow() } : {}),
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  await ensureRainbowPng();

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: W, height: H });
  pptx.layout = "WIDE";
  pptx.author = "Craig Ross Muller";
  pptx.title = "Super-Cube® Overview";
  pptx.subject = "Human-centric leadership developed from the core outward";
  pptx.company = "Super-Cube";

  let page = 0;
  const nextPage = () => ++page;

  // ═════════════════════════════════════════════════════════════════════════
  // 1. Title
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };
    addRainbowHeader(s, pptx, { darkStripOnly: true });
    const n = nextPage();

    if (hasLogo) {
      // Logo on white pill for contrast on dark
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M,
        y: 1.5,
        w: 2.4,
        h: 0.62,
        fill: { color: C.white },
        line: { color: C.white },
        rectRadius: 0.12,
        shadow: makeShadow(),
      });
      s.addImage({
        path: logoPath,
        x: M + 0.16,
        y: 1.6,
        w: 2.08,
        h: 0.42,
      });
    }

    s.addText("Super-Cube®", {
      x: M,
      y: 2.45,
      w: 12,
      h: 0.75,
      fontSize: 44,
      fontFace: "Georgia",
      bold: true,
      color: C.white,
      margin: 0,
    });

    s.addText("Human-centric leadership developed from the core outward.", {
      x: M,
      y: 3.3,
      w: 11,
      h: 0.45,
      fontSize: 18,
      fontFace: "Calibri",
      color: "D4D4D4",
      margin: 0,
    });

    // Six face colour chips
    faces.forEach((f, i) => {
      const x = M + i * 2.05;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 4.15,
        w: 1.9,
        h: 0.48,
        fill: { color: f.color },
        line: { color: f.color },
        rectRadius: 0.08,
      });
      s.addText(f.name, {
        x,
        y: 4.22,
        w: 1.9,
        h: 0.35,
        fontSize: 12,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
    });

    s.addText(
      "Craig Ross Muller  ·  UKZN DBA 2020  ·  Schools · Corporate L&D · Coaches",
      {
        x: M,
        y: 5.15,
        w: 12,
        h: 0.35,
        fontSize: 13,
        fontFace: "Calibri",
        color: "8A8A8A",
        margin: 0,
      }
    );

    s.addText("Executive overview", {
      x: M,
      y: 6.35,
      w: 6,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: "6B6B6B",
      margin: 0,
    });

    addFooter(s, n, TOTAL_PAGES, { dark: true });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. The challenge
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "The challenge", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "Leadership development is fragmented.");

    const problems = [
      {
        t: "Siloed skill fads",
        d: "One-off modules on communication, resilience, or EQ—without a coherent whole-person model that links them.",
        c: faces[0].color,
      },
      {
        t: "Hard to measure growth",
        d: "Attendance and smile sheets replace pre/post capability data. Leaders cannot see which faces moved—and which did not.",
        c: faces[1].color,
      },
      {
        t: "No shared language",
        d: "Schools, companies, and coaches use different frameworks. Cohorts lack one map that works from age 5 to senior leadership.",
        c: faces[2].color,
      },
      {
        t: "Imported, incomplete models",
        d: "Trait lists and Western templates under-weight ethics, body, purpose, and relational philosophy—especially in African contexts.",
        c: faces[3].color,
      },
    ];

    problems.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = M + col * 6.2;
      const y = 1.9 + row * 2.35;

      addCard(s, pptx, { x, y, w: 5.95, h: 2.15 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 0.12,
        h: 2.15,
        fill: { color: p.c },
        line: { color: p.c },
      });
      s.addText(p.t, {
        x: x + 0.4,
        y: y + 0.35,
        w: 5.2,
        h: 0.4,
        fontSize: 17,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.d, {
        x: x + 0.4,
        y: y + 0.9,
        w: 5.2,
        h: 0.95,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. Philosophy → Theory → Model  (NEW)
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, {
      title: "Philosophy → Theory → Model",
      showLogo: true,
    });
    const n = nextPage();

    s.addText(
      "Super-Cube® is a practiceable model—grounded in philosophy and theory, not a free-floating fad.",
      {
        x: M,
        y: CONTENT_TOP + 0.05,
        w: W - 2 * M,
        h: 0.38,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      }
    );

    // Three-step flow cards
    const steps = [
      {
        label: "01  PHILOSOPHY",
        title: "Values & worldview",
        color: faces[1].color,
        items: [
          "Martin Buber — I–Thou",
          "Ubuntu — I am because we are",
          "Ken Wilber — AQAL integral",
        ],
      },
      {
        label: "02  THEORY",
        title: "How leadership works",
        color: faces[2].color,
        items: [
          "Illeris: Content · Incentive · Interaction",
          "Construct theories (six faces)",
          "Literature map → integral frames",
        ],
      },
      {
        label: "03  MODEL",
        title: "Practiceable framework",
        color: faces[5].color,
        items: [
          "Person at the centre",
          "Six developable faces",
          "Assess · practise · re-measure",
        ],
      },
    ];

    const cardW = 3.75;
    const gap = 0.28;
    const flowY = 1.7;

    steps.forEach((st, i) => {
      const x = M + i * (cardW + gap);
      addCard(s, pptx, { x, y: flowY, w: cardW, h: 2.55 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: flowY,
        w: cardW,
        h: 0.1,
        fill: { color: st.color },
        line: { color: st.color },
      });
      s.addText(st.label, {
        x: x + 0.25,
        y: flowY + 0.28,
        w: cardW - 0.5,
        h: 0.28,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: st.color,
        charSpacing: 1,
        margin: 0,
      });
      s.addText(st.title, {
        x: x + 0.25,
        y: flowY + 0.58,
        w: cardW - 0.5,
        h: 0.35,
        fontSize: 16,
        fontFace: "Georgia",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      st.items.forEach((item, j) => {
        s.addText("•  " + item, {
          x: x + 0.25,
          y: flowY + 1.1 + j * 0.38,
          w: cardW - 0.5,
          h: 0.35,
          fontSize: 12,
          fontFace: "Calibri",
          color: C.slate,
          margin: 0,
        });
      });

      // Arrow between cards
      if (i < steps.length - 1) {
        s.addText("→", {
          x: x + cardW - 0.05,
          y: flowY + 1.0,
          w: gap + 0.1,
          h: 0.4,
          fontSize: 18,
          fontFace: "Calibri",
          bold: true,
          color: C.muted,
          align: "center",
          margin: 0,
        });
      }
    });

    // Bottom band: construct theories + literature map
    const bandY = 4.45;
    addCard(s, pptx, {
      x: M,
      y: bandY,
      w: 6.05,
      h: 2.4,
    });
    s.addText("CONSTRUCT-LEVEL THEORIES", {
      x: M + 0.25,
      y: bandY + 0.2,
      w: 5.55,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: faces[0].color,
      charSpacing: 1,
      margin: 0,
    });

    const constructTheories = [
      { face: "Choices", t: "Choice theory" },
      { face: "Principles", t: "Caldwell et al. principle-centred" },
      { face: "Mental", t: "Cognition theory" },
      { face: "Emotional", t: "Mayer, Salovey & Caruso EI" },
      { face: "Physical", t: "Wheel of Wellness" },
      { face: "Spiritual", t: "Spiritual intelligence" },
    ];
    constructTheories.forEach((ct, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = M + 0.25 + col * 2.9;
      const cy = bandY + 0.6 + row * 0.52;
      const faceColor = faces[i].color;
      s.addShape(pptx.shapes.OVAL, {
        x: cx,
        y: cy + 0.05,
        w: 0.18,
        h: 0.18,
        fill: { color: faceColor },
        line: { color: faceColor },
      });
      s.addText(`${ct.face}: ${ct.t}`, {
        x: cx + 0.28,
        y: cy,
        w: 2.55,
        h: 0.3,
        fontSize: 11,
        fontFace: "Calibri",
        color: C.ink,
        margin: 0,
      });
    });

    addCard(s, pptx, {
      x: M + 6.25,
      y: bandY,
      w: 6.08,
      h: 2.4,
    });
    s.addText("LITERATURE MAP", {
      x: M + 6.5,
      y: bandY + 0.2,
      w: 5.6,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: faces[5].color,
      charSpacing: 1,
      margin: 0,
    });
    s.addText(
      "Classical schools → contemporary frames",
      {
        x: M + 6.5,
        y: bandY + 0.55,
        w: 5.6,
        h: 0.3,
        fontSize: 13,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      }
    );
    s.addText(
      "Trait  ·  Behavioural  ·  Contingency  ·  Relational  ·  Shared  ·  Neuroscience  →  Integral frames (AQAL, I–Thou, Ubuntu)",
      {
        x: M + 6.5,
        y: bandY + 1.0,
        w: 5.6,
        h: 1.0,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      }
    );

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. The Super-Cube model
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };
    addRainbowHeader(s, pptx, { darkStripOnly: true });
    const n = nextPage();

    s.addText("THE MODEL", {
      x: M,
      y: 0.55,
      w: 12,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: "93C5FD",
      charSpacing: 2,
      margin: 0,
    });
    s.addText("Person at the centre. Six developable faces.", {
      x: M,
      y: 0.9,
      w: 12,
      h: 0.45,
      fontSize: 26,
      fontFace: "Georgia",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(
      "Super-Cube® is a multidimensional leadership model: the individual sits at the core of a cube whose six faces are Choices, Principles, Mental, Emotional, Physical, and Spiritual—each a developable domain of human-centric leadership.",
      {
        x: M,
        y: 1.5,
        w: 12.3,
        h: 0.65,
        fontSize: 14,
        fontFace: "Calibri",
        color: "C4C4C4",
        margin: 0,
      }
    );

    // Centre person
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.15,
      y: 2.9,
      w: 3.0,
      h: 1.55,
      fill: { color: C.darkCard },
      line: { color: "3B82F6", width: 2 },
      rectRadius: 0.12,
      shadow: makeShadow(),
    });
    s.addText("YOU", {
      x: 5.15,
      y: 3.2,
      w: 3.0,
      h: 0.45,
      fontSize: 22,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });
    s.addText("The developing leader", {
      x: 5.15,
      y: 3.7,
      w: 3.0,
      h: 0.35,
      fontSize: 12,
      fontFace: "Calibri",
      color: "A3A3A3",
      align: "center",
      margin: 0,
    });

    const positions = [
      { x: 0.5, y: 2.55 },
      { x: 2.75, y: 2.55 },
      { x: 8.4, y: 2.55 },
      { x: 10.65, y: 2.55 },
      { x: 2.75, y: 4.85 },
      { x: 8.4, y: 4.85 },
    ];
    faces.forEach((f, i) => {
      const p = positions[i];
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: p.x,
        y: p.y,
        w: 2.1,
        h: 1.0,
        fill: { color: f.color },
        line: { color: f.color },
        rectRadius: 0.1,
        shadow: makeShadow(),
      });
      s.addText(f.name, {
        x: p.x,
        y: p.y + 0.3,
        w: 2.1,
        h: 0.4,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
    });

    s.addText("Develop from the core outward—measure, practise, re-measure.", {
      x: M,
      y: 6.35,
      w: 12,
      h: 0.3,
      fontSize: 13,
      fontFace: "Calibri",
      color: "737373",
      margin: 0,
    });

    addFooter(s, n, TOTAL_PAGES, { dark: true });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. Six faces detail
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "Six faces", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "One cube. Six leadership capacities.");

    faces.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = M + col * 4.15;
      const y = 1.85 + row * 2.4;

      addCard(s, pptx, { x, y, w: 3.95, h: 2.2 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 3.95,
        h: 0.12,
        fill: { color: f.color },
        line: { color: f.color },
      });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.28,
        y: y + 0.4,
        w: 0.36,
        h: 0.36,
        fill: { color: f.color },
        line: { color: f.color },
      });
      s.addText(f.name, {
        x: x + 0.8,
        y: y + 0.42,
        w: 2.9,
        h: 0.35,
        fontSize: 17,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.tagline, {
        x: x + 0.28,
        y: y + 1.0,
        w: 3.4,
        h: 0.45,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
      s.addText(f.theory, {
        x: x + 0.28,
        y: y + 1.55,
        w: 3.4,
        h: 0.35,
        fontSize: 11,
        fontFace: "Calibri",
        italic: true,
        color: f.color,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. Research foundation
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, {
      title: "Research foundation",
      showLogo: true,
    });
    const n = nextPage();
    addPageTitle(s, "Empirically validated. Practice-oriented.");

    // Left dark thesis card
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: M,
      y: 1.85,
      w: 6.15,
      h: 4.9,
      fill: { color: C.ink },
      line: { color: C.ink },
      rectRadius: 0.12,
      shadow: makeShadow(),
    });
    s.addText("DOCTORAL RESEARCH", {
      x: M + 0.4,
      y: 2.15,
      w: 5.4,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: "93C5FD",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("UKZN · DBA · 2020", {
      x: M + 0.4,
      y: 2.55,
      w: 5.4,
      h: 0.4,
      fontSize: 22,
      fontFace: "Georgia",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(
      "A Leadership Skills Development Model for the Kwaden Group: A Case Study of an African FMCG Business-Network (Muller, C. R.).",
      {
        x: M + 0.4,
        y: 3.15,
        w: 5.4,
        h: 1.0,
        fontSize: 13,
        fontFace: "Calibri",
        color: "D4D4D4",
        margin: 0,
      }
    );
    s.addText(
      "Pragmatic explanatory sequential mixed methods: quantitative structure first, qualitative depth second—within an African FMCG business network.",
      {
        x: M + 0.4,
        y: 4.3,
        w: 5.4,
        h: 0.9,
        fontSize: 13,
        fontFace: "Calibri",
        color: "A3A3A3",
        margin: 0,
      }
    );
    s.addText("Survey N=132  ·  CFA CFI≈0.86\nInterviews N=10  ·  α≈0.60–0.80", {
      x: M + 0.4,
      y: 5.5,
      w: 5.4,
      h: 0.7,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // Right stats
    const frames = [
      {
        t: "70–76%",
        d: "Leadership capacity developable through deliberate practice—not fixed by heredity alone.",
        c: faces[3].color,
      },
      {
        t: "+45.1%",
        d: "Largest construct gain in Principles—integrity, context, and accountable practice.",
        c: faces[1].color,
      },
      {
        t: "Six faces",
        d: "All constructs validated in survey structure and senior-leader interviews.",
        c: faces[5].color,
      },
    ];
    frames.forEach((f, i) => {
      const y = 1.85 + i * 1.65;
      addCard(s, pptx, { x: 6.95, y, w: 5.88, h: 1.5 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x: 6.95,
        y,
        w: 0.12,
        h: 1.5,
        fill: { color: f.c },
        line: { color: f.c },
      });
      s.addText(f.t, {
        x: 7.3,
        y: y + 0.28,
        w: 5.2,
        h: 0.35,
        fontSize: 18,
        fontFace: "Georgia",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.d, {
        x: 7.3,
        y: y + 0.75,
        w: 5.2,
        h: 0.55,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. Learn pathway
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, {
      title: "Super-Cube® Learn",
      showLogo: true,
    });
    const n = nextPage();
    addPageTitle(s, "A 6-step pathway from orientation to certificate.");

    const steps = [
      { n: "01", t: "Choose programme", d: "Kids · Adolescents · Adults", c: faces[0].color },
      { n: "02", t: "Orient", d: "Map philosophy · theory · model", c: faces[1].color },
      { n: "03", t: "Baseline", d: "Pre-assess all six faces", c: faces[2].color },
      { n: "04", t: "Learn six faces", d: "Courses + deliberate practice", c: faces[3].color },
      { n: "05", t: "Re-measure", d: "Post-assessment & growth delta", c: faces[4].color },
      { n: "06", t: "Report & certificate", d: "Personal report + verified cert", c: faces[5].color },
    ];

    steps.forEach((st, i) => {
      const x = 0.45 + i * 2.12;
      const dark = i % 2 === 0;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.95,
        w: 2.0,
        h: 4.55,
        fill: { color: dark ? C.ink : C.white },
        line: { color: dark ? C.ink : C.line },
        rectRadius: 0.1,
        shadow: makeShadow(),
      });
      // colour top
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.95,
        w: 2.0,
        h: 0.12,
        fill: { color: st.c },
        line: { color: st.c },
      });
      s.addText(st.n, {
        x,
        y: 2.4,
        w: 2.0,
        h: 0.4,
        fontSize: 20,
        fontFace: "Calibri",
        bold: true,
        color: st.c,
        align: "center",
        margin: 0,
      });
      s.addText(st.t, {
        x: x + 0.12,
        y: 3.2,
        w: 1.76,
        h: 1.15,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: dark ? C.white : C.ink,
        align: "center",
        margin: 0,
      });
      s.addText(st.d, {
        x: x + 0.12,
        y: 4.6,
        w: 1.76,
        h: 1.2,
        fontSize: 12,
        fontFace: "Calibri",
        color: dark ? "A3A3A3" : C.slate,
        align: "center",
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. Daily practice
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "Daily practice", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "Insight becomes behaviour.");

    s.addText(
      "Beyond one-off courses: continuous face tracking, micro-practices, and a weekly plan keep growth alive between sessions.",
      {
        x: M,
        y: 1.75,
        w: 12.3,
        h: 0.4,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      }
    );

    const practices = [
      {
        t: "Daily check-in",
        sub: "Face pulse",
        d: "Quick ratings across the six faces reveal patterns over days and weeks—strengths, dips, and priorities.",
        c: faces[0].color,
      },
      {
        t: "Micro-practices",
        sub: "Small reps",
        d: "Short, targeted actions matched to weaker faces so deliberate practice fits real schedules.",
        c: faces[1].color,
      },
      {
        t: "Weekly plan",
        sub: "Focus & review",
        d: "A simple plan that names focus faces, wins, and next steps—ready for coaches and cohorts.",
        c: faces[4].color,
      },
    ];

    practices.forEach((p, i) => {
      const x = M + i * 4.15;
      addCard(s, pptx, { x, y: 2.35, w: 3.95, h: 4.3 });
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.35,
        y: 2.7,
        w: 0.7,
        h: 0.7,
        fill: { color: p.c },
        line: { color: p.c },
        rectRadius: 0.1,
      });
      s.addText(String(i + 1), {
        x: x + 0.35,
        y: 2.85,
        w: 0.7,
        h: 0.45,
        fontSize: 18,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
      s.addText(p.t, {
        x: x + 0.35,
        y: 3.7,
        w: 3.25,
        h: 0.4,
        fontSize: 19,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.sub.toUpperCase(), {
        x: x + 0.35,
        y: 4.2,
        w: 3.25,
        h: 0.3,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: p.c,
        charSpacing: 1,
        margin: 0,
      });
      s.addText(p.d, {
        x: x + 0.35,
        y: 4.7,
        w: 3.25,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 9. Programmes (Kids / Adolescents / Adults) + audiences
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "Programmes", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "Same cube. Age-adapted language.");

    const progs = [
      {
        name: "Kids",
        age: "Ages 5–12",
        tag: "Growing character, curiosity, and kindness.",
        note: "Stories, play-based practice, parent/teacher support.",
        c: faces[2].color,
      },
      {
        name: "Adolescents",
        age: "Ages 13–21",
        tag: "Identity, influence, and wise decisions.",
        note: "School, sport, first jobs, digital life scenarios.",
        c: faces[3].color,
      },
      {
        name: "Adults",
        age: "Ages 22+",
        tag: "Human-centric leadership for work and life.",
        note: "Full pathway: assess → learn → practise → report.",
        c: faces[5].color,
      },
    ];

    progs.forEach((p, i) => {
      const x = M + i * 4.15;
      addCard(s, pptx, { x, y: 1.85, w: 3.95, h: 3.55, shadow: true });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.85,
        w: 3.95,
        h: 1.15,
        fill: { color: p.c },
        line: { color: p.c },
      });
      s.addText(p.name, {
        x: x + 0.3,
        y: 2.05,
        w: 3.35,
        h: 0.4,
        fontSize: 22,
        fontFace: "Georgia",
        bold: true,
        color: C.white,
        margin: 0,
      });
      s.addText(p.age, {
        x: x + 0.3,
        y: 2.5,
        w: 3.35,
        h: 0.3,
        fontSize: 13,
        fontFace: "Calibri",
        color: "FFFFFF",
        margin: 0,
      });
      s.addText(p.tag, {
        x: x + 0.3,
        y: 3.3,
        w: 3.35,
        h: 0.85,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.note, {
        x: x + 0.3,
        y: 4.3,
        w: 3.35,
        h: 0.7,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    // Audience strip
    s.addText(
      "Built for  ·  Individuals  ·  Schools  ·  Corporate L&D  ·  Coaches",
      {
        x: M,
        y: 5.7,
        w: 12.3,
        h: 0.4,
        fontSize: 14,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        align: "center",
        margin: 0,
      }
    );
    s.addText(
      "Shared language from age 5 to senior leadership—one model, adapted pathways.",
      {
        x: M,
        y: 6.15,
        w: 12.3,
        h: 0.35,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        align: "center",
        margin: 0,
      }
    );

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 10. Organisations
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "Organisations", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "Seat packs, cohorts, and coach visibility.");

    const orgFeatures = [
      {
        t: "Seat packs",
        d: "10 / 20 / 50 seats with volume discounts for classrooms, departments, and school or company licences.",
        c: faces[0].color,
      },
      {
        t: "Cohort codes",
        d: "Learners join with a simple code—roster stays under coach and admin control.",
        c: faces[1].color,
      },
      {
        t: "Coach heat map",
        d: "See face strengths and gaps across a cohort so facilitation targets what matters.",
        c: faces[2].color,
      },
      {
        t: "CSV export",
        d: "Progress and outcomes export for L&D systems, boards, and safeguarding records.",
        c: faces[3].color,
      },
      {
        t: "Private journals",
        d: "Learner reflections stay private; coaches get aggregate signals without oversharing.",
        c: faces[4].color,
      },
      {
        t: "Facilitator kit",
        d: "8-week cohort pattern: orient, baseline, faces, re-measure, certify—ready for staff rooms.",
        c: faces[5].color,
      },
    ];

    orgFeatures.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = M + col * 4.15;
      const y = 1.85 + row * 2.4;

      addCard(s, pptx, { x, y, w: 3.95, h: 2.2 });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.28,
        y: y + 0.32,
        w: 0.32,
        h: 0.32,
        fill: { color: f.c },
        line: { color: f.c },
      });
      s.addText(f.t, {
        x: x + 0.75,
        y: y + 0.32,
        w: 2.95,
        h: 0.35,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.d, {
        x: x + 0.28,
        y: y + 0.9,
        w: 3.4,
        h: 1.05,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 11. Pricing
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addRainbowHeader(s, pptx, { title: "Pricing", showLogo: true });
    const n = nextPage();
    addPageTitle(s, "Start free. Pay once. No subscription.");

    // Free
    addCard(s, pptx, { x: M, y: 1.85, w: 3.9, h: 4.75 });
    s.addText("BASELINE", {
      x: M + 0.35,
      y: 2.15,
      w: 3.2,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: faces[4].color,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Free", {
      x: M + 0.35,
      y: 2.6,
      w: 3.2,
      h: 0.55,
      fontSize: 34,
      fontFace: "Georgia",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(
      "Device-local baseline across six faces. See your map before you commit to the full pathway.",
      {
        x: M + 0.35,
        y: 3.4,
        w: 3.2,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      }
    );
    s.addText("No card required", {
      x: M + 0.35,
      y: 5.8,
      w: 3.2,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    // Full pathway (featured)
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.7,
      y: 1.85,
      w: 3.9,
      h: 4.75,
      fill: { color: C.ink },
      line: { color: C.ink },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });
    s.addShape(pptx.shapes.RECTANGLE, {
      x: 4.7,
      y: 1.85,
      w: 3.9,
      h: 0.12,
      fill: { color: faces[5].color },
      line: { color: faces[5].color },
    });
    s.addText("FULL PATHWAY", {
      x: 5.05,
      y: 2.2,
      w: 3.2,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: "93C5FD",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("R99  /  $6", {
      x: 5.05,
      y: 2.65,
      w: 3.2,
      h: 0.55,
      fontSize: 30,
      fontFace: "Georgia",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText("once per learner", {
      x: 5.05,
      y: 3.25,
      w: 3.2,
      h: 0.3,
      fontSize: 13,
      fontFace: "Calibri",
      color: "A3A3A3",
      margin: 0,
    });
    s.addText(
      "Orient → courses → practice → re-measure → report & certificate. Same price for Kids, Adolescents, and Adults.",
      {
        x: 5.05,
        y: 3.8,
        w: 3.2,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: "D4D4D4",
        margin: 0,
      }
    );
    s.addText("Paystack checkout", {
      x: 5.05,
      y: 5.8,
      w: 3.2,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // Seat packs
    addCard(s, pptx, { x: 8.9, y: 1.85, w: 3.9, h: 4.75 });
    s.addText("SEAT PACKS", {
      x: 9.25,
      y: 2.15,
      w: 3.2,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: faces[2].color,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Volume discount", {
      x: 9.25,
      y: 2.6,
      w: 3.2,
      h: 0.4,
      fontSize: 20,
      fontFace: "Georgia",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    const packs = [
      { n: "10 seats", d: "10% off  ·  classroom pilot", c: faces[0].color },
      { n: "20 seats", d: "15% off  ·  popular cohort", c: faces[3].color },
      { n: "50 seats", d: "20% off  ·  school licence", c: faces[5].color },
    ];
    packs.forEach((pk, i) => {
      const y = 3.35 + i * 0.9;
      s.addShape(pptx.shapes.OVAL, {
        x: 9.25,
        y: y + 0.05,
        w: 0.22,
        h: 0.22,
        fill: { color: pk.c },
        line: { color: pk.c },
      });
      s.addText(pk.n, {
        x: 9.6,
        y,
        w: 2.9,
        h: 0.3,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(pk.d, {
        x: 9.6,
        y: y + 0.32,
        w: 2.9,
        h: 0.28,
        fontSize: 12,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 12. CTA
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };
    addRainbowHeader(s, pptx, { darkStripOnly: true });
    const n = nextPage();

    if (hasLogo) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: M,
        y: 1.2,
        w: 2.2,
        h: 0.58,
        fill: { color: C.white },
        line: { color: C.white },
        rectRadius: 0.12,
        shadow: makeShadow(),
      });
      s.addImage({
        path: logoPath,
        x: M + 0.14,
        y: 1.3,
        w: 1.92,
        h: 0.38,
      });
    }

    s.addText("Ready to develop leaders\nfrom the core outward?", {
      x: M,
      y: 2.15,
      w: 12,
      h: 1.25,
      fontSize: 34,
      fontFace: "Georgia",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // CTA buttons
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: M,
      y: 3.7,
      w: 3.5,
      h: 0.7,
      fill: { color: faces[5].color },
      line: { color: faces[5].color },
      rectRadius: 0.1,
      shadow: makeShadow(),
    });
    s.addText("Start free baseline", {
      x: M,
      y: 3.85,
      w: 3.5,
      h: 0.4,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.25,
      y: 3.7,
      w: 3.0,
      h: 0.7,
      fill: { color: C.darkChip },
      line: { color: "404040", width: 1.5 },
      rectRadius: 0.1,
    });
    s.addText("Book a pilot", {
      x: 4.25,
      y: 3.85,
      w: 3.0,
      h: 0.4,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });

    s.addText(
      [
        { text: "www.super-cube.me", options: { color: "93C5FD" } },
        { text: "   ·   ", options: { color: "737373" } },
        { text: "hello@super-cube.me", options: { color: "D4D4D4" } },
      ],
      {
        x: M,
        y: 4.8,
        w: 11,
        h: 0.4,
        fontSize: 16,
        fontFace: "Calibri",
        margin: 0,
      }
    );

    // Face chips
    faces.forEach((f, i) => {
      const x = M + i * 2.05;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 5.6,
        w: 1.9,
        h: 0.4,
        fill: { color: f.color },
        line: { color: f.color },
        rectRadius: 0.08,
      });
      s.addText(f.name, {
        x,
        y: 5.65,
        w: 1.9,
        h: 0.3,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
    });

    s.addText("Craig Ross Muller  ·  Super-Cube®  ·  Human-centric leadership", {
      x: M,
      y: 6.35,
      w: 11,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: "737373",
      margin: 0,
    });

    addFooter(s, n, TOTAL_PAGES, { dark: true });
  }

  // Write
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pptx.writeFile({ fileName: outPath });
  console.log("Wrote", outPath);
  console.log("Slides:", page);
  console.log("Size:", (fs.statSync(outPath).size / 1024).toFixed(1), "KB");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
