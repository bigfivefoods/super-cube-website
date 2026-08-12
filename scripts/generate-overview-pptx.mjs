/**
 * Generate Super-Cube® overview PowerPoint (widescreen executive deck).
 * Output: public/downloads/super-cube-overview.pptx
 */
import PptxGenJS from "pptxgenjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "public/downloads/super-cube-overview.pptx");

// Brand tokens
const C = {
  ink: "0A0A0A",
  inkSoft: "141414",
  paper: "FAFAFA",
  white: "FFFFFF",
  muted: "6B7280",
  slate: "475569",
  line: "E5E7EB",
  lineDark: "262626",
  blue: "3B82F6",
  blueSoft: "DBEAFE",
  cream: "F5F5F4",
};

// Site construct colours (from content.ts)
const faces = [
  {
    name: "Choices",
    tagline: "Decision-making under complexity",
    color: "B32026",
  },
  {
    name: "Principles",
    tagline: "Ethical foundations & trust",
    color: "5D1F5E",
  },
  {
    name: "Mental",
    tagline: "Clarity, vision, problem-solving",
    color: "ED8F20",
  },
  {
    name: "Emotional",
    tagline: "Self & social intelligence",
    color: "367638",
  },
  {
    name: "Physical",
    tagline: "Energy, presence, stamina",
    color: "16979A",
  },
  {
    name: "Spiritual",
    tagline: "Purpose, contribution, example",
    color: "26408C",
  },
];

const logoPath = path.join(root, "public/brand/logo.png");
const logoMarkPath = path.join(root, "public/brand/logo-mark.png");
const hasLogo = fs.existsSync(logoPath);

function addFooter(slide, opts = {}) {
  const { dark = false, page = "" } = opts;
  const col = dark ? "A3A3A3" : C.muted;
  slide.addText("Super-Cube®  ·  Confidential overview", {
    x: 0.55,
    y: 7.1,
    w: 10,
    h: 0.28,
    fontSize: 10,
    fontFace: "Calibri",
    color: col,
    margin: 0,
  });
  if (page) {
    slide.addText(String(page), {
      x: 12.2,
      y: 7.1,
      w: 0.7,
      h: 0.28,
      fontSize: 10,
      fontFace: "Calibri",
      color: col,
      align: "right",
      margin: 0,
    });
  }
}

function addEyebrow(slide, text, x = 0.7, y = 0.45, dark = false) {
  slide.addText(text.toUpperCase(), {
    x,
    y,
    w: 11,
    h: 0.28,
    fontSize: 11,
    fontFace: "Calibri",
    color: dark ? "93C5FD" : C.blue,
    bold: true,
    charSpacing: 2,
    margin: 0,
  });
}

function addTitle(slide, text, x = 0.7, y = 0.8, w = 11.5, dark = false) {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.7,
    fontSize: 32,
    fontFace: "Calibri",
    bold: true,
    color: dark ? C.white : C.ink,
    margin: 0,
  });
}

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "Craig Ross Muller";
  pptx.title = "Super-Cube® Overview";
  pptx.subject = "Human-centric leadership developed from the core outward";
  pptx.company = "Super-Cube";

  // ─────────────────────────────────────────────
  // 1. Title
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };

    // Left accent panel
    s.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 0.18,
      h: 7.5,
      fill: { color: C.blue },
      line: { color: C.blue },
    });

    if (hasLogo) {
      s.addImage({
        path: logoPath,
        x: 0.7,
        y: 1.35,
        w: 3.6,
        h: 0.76,
      });
    }

    s.addText("Super-Cube®", {
      x: 0.7,
      y: 2.35,
      w: 11,
      h: 0.85,
      fontSize: 48,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    s.addText("Human-centric leadership developed from the core outward.", {
      x: 0.7,
      y: 3.25,
      w: 10,
      h: 0.55,
      fontSize: 20,
      fontFace: "Calibri",
      color: "D4D4D4",
      margin: 0,
    });

    s.addShape(pptx.shapes.RECTANGLE, {
      x: 0.7,
      y: 4.05,
      w: 1.4,
      h: 0.06,
      fill: { color: C.blue },
      line: { color: C.blue },
    });

    s.addText(
      [
        { text: "www.super-cube.me", options: { color: "93C5FD" } },
        { text: "   ·   ", options: { color: "737373" } },
        { text: "Craig Ross Muller", options: { color: "A3A3A3" } },
        { text: "   ·   ", options: { color: "737373" } },
        { text: "UKZN 2020", options: { color: "A3A3A3" } },
      ],
      {
        x: 0.7,
        y: 4.4,
        w: 11,
        h: 0.4,
        fontSize: 14,
        fontFace: "Calibri",
        margin: 0,
      }
    );

    s.addText("Executive overview  ·  Schools · Corporate L&D · Coaches", {
      x: 0.7,
      y: 6.7,
      w: 11,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: "737373",
      margin: 0,
    });
  }

  // ─────────────────────────────────────────────
  // 2. The problem
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "The challenge");
    addTitle(s, "Leadership development is fragmented.", 0.7, 0.75);

    const problems = [
      {
        t: "Siloed skill fads",
        d: "One-off modules on communication, resilience, or EQ—without a coherent whole-person model that links them.",
      },
      {
        t: "Hard to measure growth",
        d: "Attendance and smile sheets replace pre/post capability data. Leaders cannot see which faces moved—and which did not.",
      },
      {
        t: "No shared language",
        d: "Schools, companies, and coaches use different frameworks. Cohorts lack one map that works from age 5 to senior leadership.",
      },
      {
        t: "Imported, incomplete models",
        d: "Trait lists and Western templates under-weight ethics, body, purpose, and relational philosophy—especially in African contexts.",
      },
    ];

    problems.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.7 + col * 6.15;
      const y = 1.75 + row * 2.35;

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 5.85,
        h: 2.1,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.12,
      });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 0.12,
        h: 2.1,
        fill: { color: C.blue },
        line: { color: C.blue },
      });
      s.addText(p.t, {
        x: x + 0.4,
        y: y + 0.35,
        w: 5.2,
        h: 0.4,
        fontSize: 18,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.d, {
        x: x + 0.4,
        y: y + 0.85,
        w: 5.2,
        h: 0.95,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "2" });
  }

  // ─────────────────────────────────────────────
  // 3. The Super-Cube® model
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };
    addEyebrow(s, "The model", 0.7, 0.45, true);
    addTitle(s, "Person at the centre. Six developable faces.", 0.7, 0.8, 12, true);

    s.addText(
      "Super-Cube® is a multidimensional leadership model: the individual sits at the core of a cube whose six faces are Choices, Principles, Mental, Emotional, Physical, and Spiritual—each a developable domain of human-centric leadership.",
      {
        x: 0.7,
        y: 1.6,
        w: 12,
        h: 0.7,
        fontSize: 15,
        fontFace: "Calibri",
        color: "D4D4D4",
        margin: 0,
      }
    );

    // Centre person
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.15,
      y: 2.85,
      w: 3.0,
      h: 1.5,
      fill: { color: "1A1A1A" },
      line: { color: C.blue, width: 2 },
      rectRadius: 0.12,
    });
    s.addText("YOU", {
      x: 5.15,
      y: 3.15,
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
      y: 3.6,
      w: 3.0,
      h: 0.35,
      fontSize: 12,
      fontFace: "Calibri",
      color: "A3A3A3",
      align: "center",
      margin: 0,
    });

    // Six face chips around centre
    const positions = [
      { x: 0.7, y: 2.55 },
      { x: 3.0, y: 2.55 },
      { x: 8.35, y: 2.55 },
      { x: 10.65, y: 2.55 },
      { x: 3.0, y: 4.85 },
      { x: 8.35, y: 4.85 },
    ];
    faces.forEach((f, i) => {
      const p = positions[i];
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: p.x,
        y: p.y,
        w: 2.15,
        h: 1.0,
        fill: { color: f.color },
        line: { color: f.color },
        rectRadius: 0.1,
      });
      s.addText(f.name, {
        x: p.x,
        y: p.y + 0.3,
        w: 2.15,
        h: 0.4,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        align: "center",
        margin: 0,
      });
    });

    s.addText(
      "Develop from the core outward—measure, practise, re-measure.",
      {
        x: 0.7,
        y: 6.35,
        w: 12,
        h: 0.35,
        fontSize: 13,
        fontFace: "Calibri",
        color: "737373",
        margin: 0,
      }
    );
    addFooter(s, { dark: true, page: "3" });
  }

  // ─────────────────────────────────────────────
  // 4. Six faces
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Six faces");
    addTitle(s, "One cube. Six leadership capacities.", 0.7, 0.75);

    faces.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.7 + col * 4.1;
      const y = 1.7 + row * 2.5;

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 3.9,
        h: 2.25,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.12,
      });
      // colour bar top
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 3.9,
        h: 0.14,
        fill: { color: f.color },
        line: { color: f.color },
      });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.3,
        y: y + 0.45,
        w: 0.38,
        h: 0.38,
        fill: { color: f.color },
        line: { color: f.color },
      });
      s.addText(f.name, {
        x: x + 0.85,
        y: y + 0.48,
        w: 2.8,
        h: 0.35,
        fontSize: 18,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.tagline, {
        x: x + 0.3,
        y: y + 1.15,
        w: 3.3,
        h: 0.7,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "4" });
  }

  // ─────────────────────────────────────────────
  // 5. Research foundation
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Research foundation");
    addTitle(s, "Empirically validated. Practice-oriented.", 0.7, 0.75);

    // Left column - thesis
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7,
      y: 1.65,
      w: 6.3,
      h: 4.9,
      fill: { color: C.ink },
      line: { color: C.ink },
      rectRadius: 0.12,
    });
    s.addText("DOCTORAL RESEARCH", {
      x: 1.05,
      y: 1.95,
      w: 5.6,
      h: 0.3,
      fontSize: 11,
      fontFace: "Calibri",
      bold: true,
      color: "93C5FD",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("UKZN · DBA · 2020", {
      x: 1.05,
      y: 2.35,
      w: 5.6,
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
        x: 1.05,
        y: 2.9,
        w: 5.6,
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
        x: 1.05,
        y: 4.05,
        w: 5.6,
        h: 0.9,
        fontSize: 13,
        fontFace: "Calibri",
        color: "A3A3A3",
        margin: 0,
      }
    );
    s.addText(
      [
        { text: "Survey N=132  ·  CFA CFI≈0.86\n", options: { breakLine: false } },
        { text: "Interviews N=10  ·  α≈0.60–0.80", options: {} },
      ],
      {
        x: 1.05,
        y: 5.15,
        w: 5.6,
        h: 0.7,
        fontSize: 14,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        margin: 0,
      }
    );

    // Right - framing
    const frames = [
      {
        t: "Ubuntu",
        d: "People as subjects-in-relation—leadership that honours shared humanity.",
      },
      {
        t: "I–Thou (Buber)",
        d: "Mutual respect: learners are whole beings, not objects of control.",
      },
      {
        t: "Integral / AQAL",
        d: "Higher-order framing that holds mind, culture, systems, and body together.",
      },
    ];
    frames.forEach((f, i) => {
      const y = 1.65 + i * 1.65;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.25,
        y,
        w: 5.35,
        h: 1.5,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.1,
      });
      s.addText(f.t, {
        x: 7.55,
        y: y + 0.3,
        w: 4.8,
        h: 0.35,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.d, {
        x: 7.55,
        y: y + 0.7,
        w: 4.8,
        h: 0.55,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "5" });
  }

  // ─────────────────────────────────────────────
  // 6. How Super-Cube Learn works
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Super-Cube® Learn");
    addTitle(s, "A 6-step pathway from orientation to certificate.", 0.7, 0.75);

    const steps = [
      { n: "01", t: "Choose programme", d: "Kids · Adolescents · Adults" },
      { n: "02", t: "Orient", d: "Map how you think about leadership" },
      { n: "03", t: "Baseline", d: "Pre-assess all six faces" },
      { n: "04", t: "Learn six faces", d: "Courses + deliberate practice" },
      { n: "05", t: "Re-measure", d: "Post-assessment & growth delta" },
      { n: "06", t: "Report & certificate", d: "Personal report + verified cert" },
    ];

    steps.forEach((st, i) => {
      const x = 0.55 + i * 2.12;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.85,
        w: 2.0,
        h: 4.3,
        fill: { color: i % 2 === 0 ? C.ink : C.white },
        line: { color: i % 2 === 0 ? C.ink : C.line },
        rectRadius: 0.1,
      });
      s.addText(st.n, {
        x,
        y: 2.2,
        w: 2.0,
        h: 0.4,
        fontSize: 20,
        fontFace: "Calibri",
        bold: true,
        color: i % 2 === 0 ? "93C5FD" : C.blue,
        align: "center",
        margin: 0,
      });
      s.addText(st.t, {
        x: x + 0.12,
        y: 3.0,
        w: 1.76,
        h: 1.2,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: i % 2 === 0 ? C.white : C.ink,
        align: "center",
        margin: 0,
      });
      s.addText(st.d, {
        x: x + 0.12,
        y: 4.4,
        w: 1.76,
        h: 1.1,
        fontSize: 12,
        fontFace: "Calibri",
        color: i % 2 === 0 ? "A3A3A3" : C.slate,
        align: "center",
        margin: 0,
      });
    });

    addFooter(s, { page: "6" });
  }

  // ─────────────────────────────────────────────
  // 7. Daily practice
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Daily practice");
    addTitle(s, "Insight becomes behaviour.", 0.7, 0.75);

    s.addText(
      "Beyond one-off courses: continuous face tracking, micro-practices, and a weekly plan keep growth alive between sessions.",
      {
        x: 0.7,
        y: 1.5,
        w: 12,
        h: 0.45,
        fontSize: 15,
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
        c: C.blue,
      },
      {
        t: "Micro-practices",
        sub: "Small reps",
        d: "Short, targeted actions matched to weaker faces so deliberate practice fits real schedules.",
        c: "5D1F5E",
      },
      {
        t: "Weekly plan",
        sub: "Focus & review",
        d: "A simple plan that names focus faces, wins, and next steps—ready for coaches and cohorts.",
        c: "16979A",
      },
    ];

    practices.forEach((p, i) => {
      const x = 0.7 + i * 4.15;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 2.2,
        w: 3.95,
        h: 4.15,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.12,
      });
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.35,
        y: 2.55,
        w: 0.7,
        h: 0.7,
        fill: { color: p.c },
        line: { color: p.c },
        rectRadius: 0.1,
      });
      s.addText(String(i + 1), {
        x: x + 0.35,
        y: 2.68,
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
        y: 3.5,
        w: 3.25,
        h: 0.4,
        fontSize: 20,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.sub.toUpperCase(), {
        x: x + 0.35,
        y: 3.95,
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
        y: 4.45,
        w: 3.25,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "7" });
  }

  // ─────────────────────────────────────────────
  // 8. Who it's for
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Audiences");
    addTitle(s, "Built for people who develop people.", 0.7, 0.75);

    const audiences = [
      {
        t: "Individuals",
        d: "Self-directed leaders who want a free baseline, a clear growth map, and a personal report.",
      },
      {
        t: "Schools",
        d: "Age-adapted pathways for kids and adolescents—shared language for character and leadership.",
      },
      {
        t: "Corporate L&D",
        d: "Cohort codes, seat packs, pre/post evidence, and CSV export for talent programmes.",
      },
      {
        t: "Coaches",
        d: "Heat maps across faces, private learner journals, and tools to guide deliberate practice.",
      },
    ];

    audiences.forEach((a, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.7 + col * 6.2;
      const y = 1.7 + row * 2.4;

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 5.95,
        h: 2.2,
        fill: { color: row === 0 && col === 0 ? C.ink : C.white },
        line: { color: row === 0 && col === 0 ? C.ink : C.line },
        rectRadius: 0.12,
      });
      const dark = row === 0 && col === 0;
      s.addText(a.t, {
        x: x + 0.4,
        y: y + 0.4,
        w: 5.15,
        h: 0.45,
        fontSize: 22,
        fontFace: "Calibri",
        bold: true,
        color: dark ? C.white : C.ink,
        margin: 0,
      });
      s.addText(a.d, {
        x: x + 0.4,
        y: y + 1.0,
        w: 5.15,
        h: 0.85,
        fontSize: 14,
        fontFace: "Calibri",
        color: dark ? "D4D4D4" : C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "8" });
  }

  // ─────────────────────────────────────────────
  // 9. Programmes
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Programmes");
    addTitle(s, "Same cube. Age-adapted language.", 0.7, 0.75);

    const progs = [
      {
        name: "Kids",
        age: "Ages 5–12",
        tag: "Growing character, curiosity, and kindness.",
        note: "Stories, play-based practice, parent/teacher support.",
        c: "ED8F20",
      },
      {
        name: "Adolescents",
        age: "Ages 13–21",
        tag: "Identity, influence, and wise decisions.",
        note: "School, sport, first jobs, digital life scenarios.",
        c: "367638",
      },
      {
        name: "Adults",
        age: "Ages 22+",
        tag: "Human-centric leadership for work and life.",
        note: "Full pathway: assess → learn → practise → report.",
        c: "26408C",
      },
    ];

    progs.forEach((p, i) => {
      const x = 0.7 + i * 4.15;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.7,
        w: 3.95,
        h: 4.7,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.12,
      });
      s.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.7,
        w: 3.95,
        h: 1.35,
        fill: { color: p.c },
        line: { color: p.c },
      });
      // round bottom of colour header by overlaying nothing - just keep square top
      s.addText(p.name, {
        x: x + 0.3,
        y: 1.95,
        w: 3.35,
        h: 0.45,
        fontSize: 24,
        fontFace: "Calibri",
        bold: true,
        color: C.white,
        margin: 0,
      });
      s.addText(p.age, {
        x: x + 0.3,
        y: 2.45,
        w: 3.35,
        h: 0.35,
        fontSize: 14,
        fontFace: "Calibri",
        color: "FFFFFF",
        margin: 0,
      });
      s.addText(p.tag, {
        x: x + 0.3,
        y: 3.4,
        w: 3.35,
        h: 1.1,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(p.note, {
        x: x + 0.3,
        y: 4.65,
        w: 3.35,
        h: 1.0,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "9" });
  }

  // ─────────────────────────────────────────────
  // 10. For organisations
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Organisations");
    addTitle(s, "Seat packs, cohorts, and coach visibility.", 0.7, 0.75);

    const orgFeatures = [
      {
        t: "Seat packs",
        d: "10 / 20 / 50 seats with volume discounts for classrooms, departments, and school or company licences.",
      },
      {
        t: "Cohort codes",
        d: "Learners join with a simple code—roster stays under coach and admin control.",
      },
      {
        t: "Coach heat map",
        d: "See face strengths and gaps across a cohort so facilitation targets what matters.",
      },
      {
        t: "CSV export",
        d: "Progress and outcomes export for L&D systems, boards, and safeguarding records.",
      },
      {
        t: "Private journals",
        d: "Learner reflections stay private; coaches get aggregate signals without oversharing.",
      },
      {
        t: "Facilitator kit",
        d: "8-week cohort pattern: orient, baseline, faces, re-measure, certify—ready for staff rooms.",
      },
    ];

    orgFeatures.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.7 + col * 4.15;
      const y = 1.7 + row * 2.45;

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 3.95,
        h: 2.25,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.1,
      });
      s.addShape(pptx.shapes.OVAL, {
        x: x + 0.3,
        y: y + 0.35,
        w: 0.32,
        h: 0.32,
        fill: { color: C.blue },
        line: { color: C.blue },
      });
      s.addText(f.t, {
        x: x + 0.8,
        y: y + 0.35,
        w: 2.9,
        h: 0.35,
        fontSize: 16,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(f.d, {
        x: x + 0.3,
        y: y + 0.95,
        w: 3.35,
        h: 1.0,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "10" });
  }

  // ─────────────────────────────────────────────
  // 11. Pricing snapshot
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    addEyebrow(s, "Pricing");
    addTitle(s, "Start free. Pay once. No subscription.", 0.7, 0.75);

    // Free card
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7,
      y: 1.7,
      w: 3.9,
      h: 4.7,
      fill: { color: C.white },
      line: { color: C.line },
      rectRadius: 0.12,
    });
    s.addText("BASELINE", {
      x: 1.0,
      y: 2.05,
      w: 3.3,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: C.blue,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Free", {
      x: 1.0,
      y: 2.5,
      w: 3.3,
      h: 0.6,
      fontSize: 36,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });
    s.addText(
      "Device-local baseline across six faces. See your map before you commit to the full pathway.",
      {
        x: 1.0,
        y: 3.3,
        w: 3.3,
        h: 1.4,
        fontSize: 14,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      }
    );
    s.addText("No card required", {
      x: 1.0,
      y: 5.5,
      w: 3.3,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    // Full pathway
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.85,
      y: 1.7,
      w: 3.9,
      h: 4.7,
      fill: { color: C.ink },
      line: { color: C.ink },
      rectRadius: 0.12,
    });
    s.addText("FULL PATHWAY", {
      x: 5.15,
      y: 2.05,
      w: 3.3,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: "93C5FD",
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("R99  /  $6", {
      x: 5.15,
      y: 2.5,
      w: 3.3,
      h: 0.6,
      fontSize: 32,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText("once per learner", {
      x: 5.15,
      y: 3.15,
      w: 3.3,
      h: 0.3,
      fontSize: 14,
      fontFace: "Calibri",
      color: "A3A3A3",
      margin: 0,
    });
    s.addText(
      "Orient → courses → practice → re-measure → report & certificate. Same price for Kids, Adolescents, and Adults.",
      {
        x: 5.15,
        y: 3.7,
        w: 3.3,
        h: 1.5,
        fontSize: 14,
        fontFace: "Calibri",
        color: "D4D4D4",
        margin: 0,
      }
    );
    s.addText("Paystack checkout", {
      x: 5.15,
      y: 5.5,
      w: 3.3,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // Seat packs
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 9.0,
      y: 1.7,
      w: 3.6,
      h: 4.7,
      fill: { color: C.white },
      line: { color: C.line },
      rectRadius: 0.12,
    });
    s.addText("SEAT PACKS", {
      x: 9.3,
      y: 2.05,
      w: 3.0,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      bold: true,
      color: C.blue,
      charSpacing: 1.5,
      margin: 0,
    });
    s.addText("Volume discount", {
      x: 9.3,
      y: 2.5,
      w: 3.0,
      h: 0.45,
      fontSize: 22,
      fontFace: "Calibri",
      bold: true,
      color: C.ink,
      margin: 0,
    });

    const packs = [
      { n: "10 seats", d: "10% off  ·  pilot" },
      { n: "20 seats", d: "15% off  ·  popular" },
      { n: "50 seats", d: "20% off  ·  licence" },
    ];
    packs.forEach((pk, i) => {
      const y = 3.25 + i * 0.75;
      s.addText(pk.n, {
        x: 9.3,
        y,
        w: 3.0,
        h: 0.3,
        fontSize: 15,
        fontFace: "Calibri",
        bold: true,
        color: C.ink,
        margin: 0,
      });
      s.addText(pk.d, {
        x: 9.3,
        y: y + 0.28,
        w: 3.0,
        h: 0.28,
        fontSize: 12,
        fontFace: "Calibri",
        color: C.slate,
        margin: 0,
      });
    });

    addFooter(s, { page: "11" });
  }

  // ─────────────────────────────────────────────
  // 12. Call to action
  // ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };

    s.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 0.18,
      h: 7.5,
      fill: { color: C.blue },
      line: { color: C.blue },
    });

    if (hasLogo) {
      s.addImage({
        path: logoPath,
        x: 0.7,
        y: 1.1,
        w: 2.8,
        h: 0.59,
      });
    }

    s.addText("Ready to develop leaders\nfrom the core outward?", {
      x: 0.7,
      y: 2.0,
      w: 11.5,
      h: 1.4,
      fontSize: 36,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      margin: 0,
    });

    // CTA buttons as shapes
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7,
      y: 3.7,
      w: 3.4,
      h: 0.7,
      fill: { color: C.blue },
      line: { color: C.blue },
      rectRadius: 0.08,
    });
    s.addText("Start free baseline", {
      x: 0.7,
      y: 3.85,
      w: 3.4,
      h: 0.4,
      fontSize: 16,
      fontFace: "Calibri",
      bold: true,
      color: C.white,
      align: "center",
      margin: 0,
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.35,
      y: 3.7,
      w: 3.0,
      h: 0.7,
      fill: { color: "1A1A1A" },
      line: { color: "404040", width: 1.5 },
      rectRadius: 0.08,
    });
    s.addText("Book a pilot", {
      x: 4.35,
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
        x: 0.7,
        y: 4.8,
        w: 11,
        h: 0.4,
        fontSize: 16,
        fontFace: "Calibri",
        margin: 0,
      }
    );

    s.addText(
      "Craig Ross Muller  ·  Super-Cube®  ·  Human-centric leadership",
      {
        x: 0.7,
        y: 6.5,
        w: 11,
        h: 0.35,
        fontSize: 12,
        fontFace: "Calibri",
        color: "737373",
        margin: 0,
      }
    );
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pptx.writeFile({ fileName: outPath });
  console.log("Wrote", outPath);
  console.log("Slides:", pptx.slides?.length ?? 12);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
