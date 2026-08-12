/**
 * Super-Cube® overview PowerPoint — Tesla light theme.
 * Output: public/downloads/super-cube-overview.pptx
 *
 * Light, calm, precise: monochrome Tesla palette + sparse construct accents.
 * Transparent logo (no white pill). Thin rainbow hairline under header.
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
const transparentLogoPath = path.join(assetsDir, "logo-transparent.png");
const hairlinePath = path.join(assetsDir, "rainbow-hairline.png");

// ── Tesla light tokens (no # for pptxgenjs) ────────────────────────────────
const C = {
  white: "FFFFFF",
  snow: "F4F4F4",
  ink: "171A20",
  muted: "5C5E62",
  faint: "8E8E8E",
  line: "E8E8E8",
  card: "FAFAFA",
};

/** Construct rainbow: Choices → Principles → Mental → Emotional → Physical → Spiritual */
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
const M = 0.55;
const FOOTER_Y = 7.1;
const TOTAL_PAGES = 12;

const sourceLogoPath = path.join(root, "public/brand/logo.png");

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fresh soft shadow every call (pptxgenjs mutates / reuses badly). */
function makeShadow(opacity = 0.08) {
  return {
    type: "outer",
    color: "000000",
    blur: 8,
    offset: 2,
    opacity,
  };
}

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

/**
 * Knock out near-white pixels so the logo sits cleanly on light slides.
 */
async function ensureTransparentLogo() {
  fs.mkdirSync(assetsDir, { recursive: true });
  if (!fs.existsSync(sourceLogoPath)) {
    console.warn("Source logo missing:", sourceLogoPath);
    return null;
  }

  const { data, info } = await sharp(sourceLogoPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);
  const threshold = 245;

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = out[o];
    const g = out[o + 1];
    const b = out[o + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      out[o + 3] = 0;
    } else if (r >= 230 && g >= 230 && b >= 230) {
      // Soft edge: partially transparent near-white fringe
      const avg = (r + g + b) / 3;
      const a = Math.round(((255 - avg) / (255 - 230)) * 255);
      out[o + 3] = Math.max(0, Math.min(255, a));
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(transparentLogoPath);

  return transparentLogoPath;
}

/** Thin multi-stop rainbow PNG for top edge (~6–8px visual). */
async function ensureRainbowHairline() {
  fs.mkdirSync(assetsDir, { recursive: true });
  const width = 2000;
  const height = 12;
  const stops = RAINBOW;
  const segments = stops.length - 1;
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
    .toFile(hairlinePath);

  return hairlinePath;
}

/**
 * Header: transparent logo top-left, optional eyebrow + title, thin rainbow under logo row.
 */
function addHeader(slide, pptx, opts = {}) {
  const { title, eyebrow, logo = true } = opts;
  const hairH = 0.07;

  slide.addImage({
    path: hairlinePath,
    x: 0,
    y: 0,
    w: W,
    h: hairH,
  });

  if (logo && fs.existsSync(transparentLogoPath)) {
    // logo.png aspect ~4.7:1
    slide.addImage({
      path: transparentLogoPath,
      x: M,
      y: 0.22,
      w: 1.65,
      h: 0.35,
    });
  }

  if (eyebrow) {
    slide.addText(eyebrow, {
      x: M,
      y: 0.72,
      w: W - 2 * M,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: C.faint,
      charSpacing: 1.5,
      margin: 0,
    });
  }

  if (title) {
    const titleY = eyebrow ? 0.98 : 0.72;
    slide.addText(title, {
      x: M,
      y: titleY,
      w: W - 2 * M,
      h: 0.48,
      fontSize: 28,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });
  }
}

/** Footer: left www · right n/total · faint hairline above */
function addFooter(slide, pptx, pageNum, totalPages) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: M,
    y: FOOTER_Y - 0.12,
    w: W - 2 * M,
    h: 0.01,
    fill: { color: C.line },
    line: { color: C.line, width: 0 },
  });

  slide.addText("www.super-cube.me", {
    x: M,
    y: FOOTER_Y,
    w: 5,
    h: 0.26,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.faint,
    margin: 0,
  });

  slide.addText(`${pageNum}/${totalPages}`, {
    x: W - M - 1.2,
    y: FOOTER_Y,
    w: 1.2,
    h: 0.26,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.faint,
    align: "right",
    margin: 0,
  });
}

function addCard(slide, pptx, { x, y, w, h, fill = C.card, shadow = true }) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: C.line, width: 1 },
    rectRadius: 0.08,
    ...(shadow ? { shadow: makeShadow(0.07) } : {}),
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  await ensureTransparentLogo();
  await ensureRainbowHairline();

  const hasLogo = fs.existsSync(transparentLogoPath);

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
    s.background = { color: C.white };
    const n = nextPage();

    s.addImage({
      path: hairlinePath,
      x: 0,
      y: 0,
      w: W,
      h: 0.08,
    });

    if (hasLogo) {
      s.addImage({
        path: transparentLogoPath,
        x: M,
        y: 1.35,
        w: 2.2,
        h: 0.47,
      });
    }

    s.addText("Super-Cube®", {
      x: M,
      y: 2.15,
      w: 12,
      h: 0.7,
      fontSize: 40,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    s.addText("Human-centric leadership developed from the core outward.", {
      x: M,
      y: 2.95,
      w: 11,
      h: 0.42,
      fontSize: 18,
      fontFace: "Calibri",
      color: C.muted,
      margin: 0,
    });

    // Face chips — thin colour bar + name (not solid filled blocks)
    faces.forEach((f, i) => {
      const x = M + i * 2.05;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 3.75,
        w: 1.9,
        h: 0.52,
        fill: { color: C.card },
        line: { color: C.line, width: 1 },
        rectRadius: 0.06,
      });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 3.75,
        w: 0.08,
        h: 0.52,
        fill: { color: f.color },
        line: { color: f.color, width: 0 },
      });
      s.addText(f.name, {
        x: x + 0.18,
        y: 3.88,
        w: 1.6,
        h: 0.28,
        fontSize: 12,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
    });

    s.addText(
      "Craig Ross Muller  ·  UKZN DBA 2020  ·  Schools · Corporate L&D · Coaches",
      {
        x: M,
        y: 4.7,
        w: 12,
        h: 0.32,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.faint,
        margin: 0,
      }
    );

    s.addText("Executive overview", {
      x: M,
      y: 6.35,
      w: 6,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.faint,
      margin: 0,
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. The challenge
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "THE CHALLENGE",
      title: "Leadership development is fragmented.",
    });
    const n = nextPage();

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
      const x = M + col * 6.15;
      const y = 1.7 + row * 2.45;

      addCard(s, pptx, { x, y, w: 5.9, h: 2.25 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 0.08,
        h: 2.25,
        fill: { color: p.c },
        line: { color: p.c, width: 0 },
      });
      s.addText(p.t, {
        x: x + 0.4,
        y: y + 0.4,
        w: 5.2,
        h: 0.38,
        fontSize: 17,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.d, {
        x: x + 0.4,
        y: y + 0.95,
        w: 5.2,
        h: 1.0,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. Philosophy → Theory → Model
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "FOUNDATION",
      title: "Philosophy → Theory → Model",
    });
    const n = nextPage();

    s.addText(
      "Super-Cube® is a practiceable model—grounded in philosophy and theory, not a free-floating fad.",
      {
        x: M,
        y: 1.55,
        w: W - 2 * M,
        h: 0.32,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      }
    );

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
    const flowY = 2.05;

    steps.forEach((st, i) => {
      const x = M + i * (cardW + gap);
      addCard(s, pptx, { x, y: flowY, w: cardW, h: 2.4 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: flowY,
        w: cardW,
        h: 0.06,
        fill: { color: st.color },
        line: { color: st.color, width: 0 },
      });
      s.addText(st.label, {
        x: x + 0.28,
        y: flowY + 0.28,
        w: cardW - 0.56,
        h: 0.26,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: st.color,
        charSpacing: 1,
        margin: 0,
      });
      s.addText(st.title, {
        x: x + 0.28,
        y: flowY + 0.58,
        w: cardW - 0.56,
        h: 0.34,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      st.items.forEach((item, j) => {
        s.addText(item, {
          x: x + 0.28,
          y: flowY + 1.1 + j * 0.35,
          w: cardW - 0.56,
          h: 0.32,
          fontSize: 13,
          fontFace: "Calibri",
          color: C.muted,
          margin: 0,
        });
      });

      if (i < steps.length - 1) {
        s.addText("→", {
          x: x + cardW - 0.05,
          y: flowY + 1.0,
          w: gap + 0.1,
          h: 0.35,
          fontSize: 16,
          fontFace: "Calibri",
          color: C.faint,
          align: "center",
          margin: 0,
        });
      }
    });

    // Bottom band
    const bandY = 4.7;
    addCard(s, pptx, { x: M, y: bandY, w: 6.05, h: 2.05 });
    s.addText("CONSTRUCT-LEVEL THEORIES", {
      x: M + 0.28,
      y: bandY + 0.18,
      w: 5.5,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: C.faint,
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
      const cx = M + 0.28 + col * 2.9;
      const cy = bandY + 0.55 + row * 0.45;
      s.addShape(pptx.shapes.OVAL, {
        x: cx,
        y: cy + 0.06,
        w: 0.14,
        h: 0.14,
        fill: { color: faces[i].color },
        line: { color: faces[i].color, width: 0 },
      });
      s.addText(`${ct.face}: ${ct.t}`, {
        x: cx + 0.24,
        y: cy,
        w: 2.55,
        h: 0.28,
        fontSize: 11,
        fontFace: "Calibri",
        color: C.ink,
        margin: 0,
      });
    });

    addCard(s, pptx, { x: M + 6.25, y: bandY, w: 6.03, h: 2.05 });
    s.addText("LITERATURE MAP", {
      x: M + 6.5,
      y: bandY + 0.18,
      w: 5.55,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: C.faint,
      charSpacing: 1,
      margin: 0,
    });
    s.addText("Classical schools → contemporary frames", {
      x: M + 6.5,
      y: bandY + 0.55,
      w: 5.55,
      h: 0.28,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(
      "Trait  ·  Behavioural  ·  Contingency  ·  Relational  ·  Shared  ·  Neuroscience  →  Integral frames (AQAL, I–Thou, Ubuntu)",
      {
        x: M + 6.5,
        y: bandY + 1.0,
        w: 5.55,
        h: 0.75,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      }
    );

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. The Super-Cube model (light)
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "THE MODEL",
      title: "Person at the centre. Six developable faces.",
    });
    const n = nextPage();

    s.addText(
      "Super-Cube® is a multidimensional leadership model: the individual sits at the core of a cube whose six faces are Choices, Principles, Mental, Emotional, Physical, and Spiritual—each a developable domain of human-centric leadership.",
      {
        x: M,
        y: 1.55,
        w: W - 2 * M,
        h: 0.55,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      }
    );

    // Centre person
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.15,
      y: 2.85,
      w: 3.0,
      h: 1.5,
      fill: { color: C.ink },
      line: { color: C.ink, width: 0 },
      rectRadius: 0.1,
      shadow: makeShadow(0.1),
    });
    s.addText("YOU", {
      x: 5.15,
      y: 3.15,
      w: 3.0,
      h: 0.42,
      fontSize: 22,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });
    s.addText("The developing leader", {
      x: 5.15,
      y: 3.65,
      w: 3.0,
      h: 0.32,
      fontSize: 12,
      fontFace: "Calibri",
      color: "B0B0B0",
      align: "center",
      margin: 0,
    });

    const positions = [
      { x: 0.55, y: 2.55 },
      { x: 2.8, y: 2.55 },
      { x: 8.35, y: 2.55 },
      { x: 10.6, y: 2.55 },
      { x: 2.8, y: 4.75 },
      { x: 8.35, y: 4.75 },
    ];
    faces.forEach((f, i) => {
      const p = positions[i];
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: p.x,
        y: p.y,
        w: 2.05,
        h: 0.95,
        fill: { color: C.card },
        line: { color: C.line, width: 1 },
        rectRadius: 0.08,
        shadow: makeShadow(0.06),
      });
      s.addShape(pptx.shapes.RECTANGLE, {
        x: p.x,
        y: p.y,
        w: 2.05,
        h: 0.06,
        fill: { color: f.color },
        line: { color: f.color, width: 0 },
      });
      s.addText(f.name, {
        x: p.x,
        y: p.y + 0.32,
        w: 2.05,
        h: 0.38,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        align: "center",
        margin: 0,
      });
    });

    s.addText("Develop from the core outward—measure, practise, re-measure.", {
      x: M,
      y: 6.3,
      w: 12,
      h: 0.28,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.faint,
      margin: 0,
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. Six faces detail
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "SIX FACES",
      title: "One cube. Six leadership capacities.",
    });
    const n = nextPage();

    faces.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = M + col * 4.1;
      const y = 1.7 + row * 2.45;

      addCard(s, pptx, { x, y, w: 3.9, h: 2.25 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 3.9,
        h: 0.06,
        fill: { color: f.color },
        line: { color: f.color, width: 0 },
      });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.28,
        y: y + 0.35,
        w: 0.28,
        h: 0.28,
        fill: { color: f.color },
        line: { color: f.color, width: 0 },
      });
      s.addText(f.name, {
        x: x + 0.7,
        y: y + 0.35,
        w: 2.9,
        h: 0.3,
        fontSize: 17,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.tagline, {
        x: x + 0.28,
        y: y + 0.9,
        w: 3.35,
        h: 0.45,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
      s.addText(f.theory, {
        x: x + 0.28,
        y: y + 1.5,
        w: 3.35,
        h: 0.32,
        fontSize: 12,
        fontFace: "Calibri",
        italic: true,
        color: f.color,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. Research foundation
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "RESEARCH FOUNDATION",
      title: "Empirically validated. Practice-oriented.",
    });
    const n = nextPage();

    // One accent ink card (allowed max one per slide)
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: M,
      y: 1.7,
      w: 6.1,
      h: 4.95,
      fill: { color: C.ink },
      line: { color: C.ink, width: 0 },
      rectRadius: 0.1,
      shadow: makeShadow(0.1),
    });
    s.addText("DOCTORAL RESEARCH", {
      x: M + 0.4,
      y: 2.05,
      w: 5.3,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: "A0A0A0",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("UKZN · DBA · 2020", {
      x: M + 0.4,
      y: 2.45,
      w: 5.3,
      h: 0.4,
      fontSize: 22,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(
      "A Leadership Skills Development Model for the Kwaden Group: A Case Study of an African FMCG Business-Network (Muller, C. R.).",
      {
        x: M + 0.4,
        y: 3.05,
        w: 5.3,
        h: 1.0,
        fontSize: 13,
        fontFace: "Calibri",
        color: "D0D0D0",
        margin: 0,
      }
    );
    s.addText(
      "Pragmatic explanatory sequential mixed methods: quantitative structure first, qualitative depth second—within an African FMCG business network.",
      {
        x: M + 0.4,
        y: 4.2,
        w: 5.3,
        h: 0.9,
        fontSize: 13,
        fontFace: "Calibri",
        color: "A8A8A8",
        margin: 0,
      }
    );
    s.addText("Survey N=132  ·  CFA CFI≈0.86\nInterviews N=10  ·  α≈0.60–0.80", {
      x: M + 0.4,
      y: 5.4,
      w: 5.3,
      h: 0.7,
      fontSize: 14,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

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
      const y = 1.7 + i * 1.7;
      addCard(s, pptx, { x: 6.95, y, w: 5.83, h: 1.55 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x: 6.95,
        y,
        w: 0.08,
        h: 1.55,
        fill: { color: f.c },
        line: { color: f.c, width: 0 },
      });
      s.addText(f.t, {
        x: 7.3,
        y: y + 0.28,
        w: 5.2,
        h: 0.35,
        fontSize: 20,
        fontFace: "Calibri",
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
        color: C.muted,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. Learn pathway
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "SUPER-CUBE® LEARN",
      title: "A 6-step pathway from orientation to certificate.",
    });
    const n = nextPage();

    const steps = [
      { n: "01", t: "Choose programme", d: "Kids · Adolescents · Adults", c: faces[0].color },
      { n: "02", t: "Orient", d: "Map philosophy · theory · model", c: faces[1].color },
      { n: "03", t: "Baseline", d: "Pre-assess all six faces", c: faces[2].color },
      { n: "04", t: "Learn six faces", d: "Courses + deliberate practice", c: faces[3].color },
      { n: "05", t: "Re-measure", d: "Post-assessment & growth delta", c: faces[4].color },
      { n: "06", t: "Report & certificate", d: "Personal report + verified cert", c: faces[5].color },
    ];

    steps.forEach((st, i) => {
      const x = 0.48 + i * 2.12;
      addCard(s, pptx, { x, y: 1.75, w: 2.0, h: 4.85, fill: i % 2 === 0 ? C.snow : C.card });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.75,
        w: 2.0,
        h: 0.06,
        fill: { color: st.c },
        line: { color: st.c, width: 0 },
      });
      s.addText(st.n, {
        x,
        y: 2.2,
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
        y: 3.0,
        w: 1.76,
        h: 1.1,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        align: "center",
        margin: 0,
      });
      s.addText(st.d, {
        x: x + 0.12,
        y: 4.4,
        w: 1.76,
        h: 1.2,
        fontSize: 12,
        fontFace: "Calibri",
        color: C.muted,
        align: "center",
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. Daily practice
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "DAILY PRACTICE",
      title: "Insight becomes behaviour.",
    });
    const n = nextPage();

    s.addText(
      "Beyond one-off courses: continuous face tracking, micro-practices, and a weekly plan keep growth alive between sessions.",
      {
        x: M,
        y: 1.55,
        w: W - 2 * M,
        h: 0.4,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
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
      const x = M + i * 4.1;
      addCard(s, pptx, { x, y: 2.2, w: 3.9, h: 4.4 });
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.35,
        y: 2.55,
        w: 0.58,
        h: 0.58,
        fill: { color: C.snow },
        line: { color: C.line, width: 1 },
        rectRadius: 0.08,
      });
      s.addText(String(i + 1), {
        x: x + 0.35,
        y: 2.68,
        w: 0.58,
        h: 0.35,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: p.c,
        align: "center",
        margin: 0,
      });
      s.addText(p.t, {
        x: x + 0.35,
        y: 3.45,
        w: 3.2,
        h: 0.38,
        fontSize: 19,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.sub.toUpperCase(), {
        x: x + 0.35,
        y: 3.95,
        w: 3.2,
        h: 0.28,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: p.c,
        charSpacing: 1,
        margin: 0,
      });
      s.addText(p.d, {
        x: x + 0.35,
        y: 4.5,
        w: 3.2,
        h: 1.6,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 9. Programmes
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "PROGRAMMES",
      title: "Same cube. Age-adapted language.",
    });
    const n = nextPage();

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
      const x = M + i * 4.1;
      addCard(s, pptx, { x, y: 1.7, w: 3.9, h: 3.9 });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.7,
        w: 3.9,
        h: 0.06,
        fill: { color: p.c },
        line: { color: p.c, width: 0 },
      });
      s.addText(p.name, {
        x: x + 0.35,
        y: 2.1,
        w: 3.2,
        h: 0.4,
        fontSize: 24,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.age, {
        x: x + 0.35,
        y: 2.55,
        w: 3.2,
        h: 0.3,
        fontSize: 13,
        fontFace: "Calibri",
        color: p.c,
        bold: true,
        margin: 0,
      });
      s.addText(p.tag, {
        x: x + 0.35,
        y: 3.2,
        w: 3.2,
        h: 0.9,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.note, {
        x: x + 0.35,
        y: 4.3,
        w: 3.2,
        h: 0.8,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
    });

    s.addText(
      "Built for  ·  Individuals  ·  Schools  ·  Corporate L&D  ·  Coaches",
      {
        x: M,
        y: 5.9,
        w: W - 2 * M,
        h: 0.32,
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
        y: 6.3,
        w: W - 2 * M,
        h: 0.28,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.muted,
        align: "center",
        margin: 0,
      }
    );

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 10. Organisations
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "ORGANISATIONS",
      title: "Seat packs, cohorts, and coach visibility.",
    });
    const n = nextPage();

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
      const x = M + col * 4.1;
      const y = 1.7 + row * 2.45;

      addCard(s, pptx, { x, y, w: 3.9, h: 2.25 });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.28,
        y: y + 0.35,
        w: 0.26,
        h: 0.26,
        fill: { color: f.c },
        line: { color: f.c, width: 0 },
      });
      s.addText(f.t, {
        x: x + 0.7,
        y: y + 0.32,
        w: 2.95,
        h: 0.32,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.d, {
        x: x + 0.28,
        y: y + 0.9,
        w: 3.35,
        h: 1.05,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 11. Pricing
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    addHeader(s, pptx, {
      eyebrow: "PRICING",
      title: "Start free. Pay once. No subscription.",
    });
    const n = nextPage();

    // Free
    addCard(s, pptx, { x: M, y: 1.7, w: 3.9, h: 4.9 });
    s.addText("BASELINE", {
      x: M + 0.35,
      y: 2.05,
      w: 3.2,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: C.faint,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Free", {
      x: M + 0.35,
      y: 2.5,
      w: 3.2,
      h: 0.55,
      fontSize: 34,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(
      "Device-local baseline across six faces. See your map before you commit to the full pathway.",
      {
        x: M + 0.35,
        y: 3.3,
        w: 3.2,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      }
    );
    s.addText("No card required", {
      x: M + 0.35,
      y: 5.85,
      w: 3.2,
      h: 0.32,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    // Full pathway — single ink accent card
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.7,
      y: 1.7,
      w: 3.9,
      h: 4.9,
      fill: { color: C.ink },
      line: { color: C.ink, width: 0 },
      rectRadius: 0.08,
      shadow: makeShadow(0.1),
    });
    s.addShape(pptx.shapes.RECTANGLE, {
      x: 4.7,
      y: 1.7,
      w: 3.9,
      h: 0.06,
      fill: { color: faces[5].color },
      line: { color: faces[5].color, width: 0 },
    });
    s.addText("FULL PATHWAY", {
      x: 5.05,
      y: 2.1,
      w: 3.2,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: "A0A0A0",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("R99  /  $6", {
      x: 5.05,
      y: 2.55,
      w: 3.2,
      h: 0.55,
      fontSize: 30,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText("once per learner", {
      x: 5.05,
      y: 3.15,
      w: 3.2,
      h: 0.28,
      fontSize: 13,
      fontFace: "Calibri",
      color: "A0A0A0",
      margin: 0,
    });
    s.addText(
      "Orient → courses → practice → re-measure → report & certificate. Same price for Kids, Adolescents, and Adults.",
      {
        x: 5.05,
        y: 3.7,
        w: 3.2,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: "D0D0D0",
        margin: 0,
      }
    );
    s.addText("Paystack checkout", {
      x: 5.05,
      y: 5.85,
      w: 3.2,
      h: 0.32,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // Seat packs
    addCard(s, pptx, { x: 8.9, y: 1.7, w: 3.9, h: 4.9 });
    s.addText("SEAT PACKS", {
      x: 9.25,
      y: 2.05,
      w: 3.2,
      h: 0.26,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: C.faint,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Volume discount", {
      x: 9.25,
      y: 2.5,
      w: 3.2,
      h: 0.4,
      fontSize: 20,
      fontFace: "Calibri",
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
      const y = 3.25 + i * 0.9;
      s.addShape(pptx.shapes.OVAL, {
        x: 9.25,
        y: y + 0.05,
        w: 0.18,
        h: 0.18,
        fill: { color: pk.c },
        line: { color: pk.c, width: 0 },
      });
      s.addText(pk.n, {
        x: 9.55,
        y,
        w: 2.9,
        h: 0.28,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(pk.d, {
        x: 9.55,
        y: y + 0.32,
        w: 2.9,
        h: 0.28,
        fontSize: 12,
        fontFace: "Calibri",
        color: C.muted,
        margin: 0,
      });
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 12. CTA (light elegant close)
  // ═════════════════════════════════════════════════════════════════════════
  {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    const n = nextPage();

    s.addImage({
      path: hairlinePath,
      x: 0,
      y: 0,
      w: W,
      h: 0.08,
    });

    if (hasLogo) {
      s.addImage({
        path: transparentLogoPath,
        x: M,
        y: 1.2,
        w: 2.0,
        h: 0.42,
      });
    }

    s.addText("Ready to develop leaders\nfrom the core outward?", {
      x: M,
      y: 2.0,
      w: 12,
      h: 1.15,
      fontSize: 34,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    // Primary CTA
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: M,
      y: 3.5,
      w: 3.4,
      h: 0.65,
      fill: { color: C.ink },
      line: { color: C.ink, width: 0 },
      rectRadius: 0.08,
      shadow: makeShadow(0.08),
    });
    s.addText("Start free baseline", {
      x: M,
      y: 3.65,
      w: 3.4,
      h: 0.38,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });

    // Secondary CTA
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.2,
      y: 3.5,
      w: 2.8,
      h: 0.65,
      fill: { color: C.white },
      line: { color: C.line, width: 1.5 },
      rectRadius: 0.08,
    });
    s.addText("Book a pilot", {
      x: 4.2,
      y: 3.65,
      w: 2.8,
      h: 0.38,
      fontSize: 15,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      align: "center",
      margin: 0,
    });

    s.addText(
      [
        { text: "www.super-cube.me", options: { color: C.ink, bold: true } },
        { text: "   ·   ", options: { color: C.faint } },
        { text: "hello@super-cube.me", options: { color: C.muted } },
      ],
      {
        x: M,
        y: 4.55,
        w: 11,
        h: 0.35,
        fontSize: 15,
        fontFace: "Calibri",
        margin: 0,
      }
    );

    // Face chips — light style
    faces.forEach((f, i) => {
      const x = M + i * 2.05;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 5.3,
        w: 1.9,
        h: 0.42,
        fill: { color: C.card },
        line: { color: C.line, width: 1 },
        rectRadius: 0.06,
      });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 5.3,
        w: 0.07,
        h: 0.42,
        fill: { color: f.color },
        line: { color: f.color, width: 0 },
      });
      s.addText(f.name, {
        x: x + 0.16,
        y: 5.38,
        w: 1.65,
        h: 0.28,
        fontSize: 11,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
    });

    s.addText("Craig Ross Muller  ·  Super-Cube®  ·  Human-centric leadership", {
      x: M,
      y: 6.1,
      w: 11,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.faint,
      margin: 0,
    });

    addFooter(s, pptx, n, TOTAL_PAGES);
  }

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
