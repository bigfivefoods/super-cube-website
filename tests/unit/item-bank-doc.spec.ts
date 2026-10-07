/**
 * Generates the v2 item bank review document from code (not a test):
 *   GEN_DOCS=/abs/out/dir npx playwright test -c playwright.unit.config.ts item-bank-doc
 * Skipped in CI and normal runs.
 */
import { test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { constructs } from "@/lib/content";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { honestyItem, instrumentSummary, INSTRUMENT_LABELS } from "@/lib/lms/instruments";
import { HONESTY_ITEM, OBSERVER_DONT_KNOW, SJT_INSTRUCTIONS, SJT_WEIGHT, V2_BANK, V2_SCALE } from "@/lib/lms/instruments/v2-bank";

const OUT = process.env.GEN_DOCS;
const PROGRAMMES: ProgrammeId[] = ["adults", "adolescents", "kids"];
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function build(): string {
  const out: string[] = [];
  out.push("# Super-Cube® instrument v2 · item bank (draft for sign-off)");
  out.push("");
  out.push("_Generated from `src/lib/lms/instruments/v2-bank.ts`. Edit the code, not this file._");
  out.push("");
  out.push(`- **${INSTRUMENT_LABELS.v1}**: the 28-item instrument (a later version of the 18-item DBA survey), unchanged and still the live default.`);
  out.push(`- **${INSTRUMENT_LABELS.v2}**: behind \`LMS_INSTRUMENT_V2=on\` (server) and \`NEXT_PUBLIC_LMS_INSTRUMENT_V2=on\` (browser). Default **OFF**. Admin preview: \`/admin/instrument-v2\` (never writes learner data).`);
  out.push("- Observer (360) form: parallel third-person wording of every v2 Likert item, behind `LMS_360=on` / `NEXT_PUBLIC_LMS_360=on`, adults only. Results show only when at least 3 raters in a group have answered, and per face only when 3 raters observed that face.");
  out.push("");
  out.push("## Design rules applied");
  out.push("");
  out.push("1. Behavioural Likert items on a **frequency** scale (what you do, not what you believe about yourself).");
  out.push("2. Reverse-keyed items describe the opposite behaviour positively, with no \"not\" (van Sonderen, Sanderman & Coyne, 2013). About one-third reversed for Adults and Teens; one per face for Kids (Mellor & Moore, 2014).");
  out.push("3. Situational judgement items ask for the **most effective** response; each option has a **provisional** 1–4 effectiveness key (McDaniel et al., 2007) that an expert panel must confirm.");
  out.push(`4. Face score = ${Math.round((1 - SJT_WEIGHT) * 100)}% Likert + ${Math.round(SJT_WEIGHT * 100)}% SJT when both are present (provisional weight).`);
  out.push("5. A separate honesty (validity) item is checked before interpretation and never enters a face score.");
  out.push("6. Kids items use short sentences, word labels and concrete situations; a grown-up may read them aloud.");
  out.push("");
  out.push("## Counts");
  out.push("");
  out.push("| Programme | Items | Likert | Reverse | SJT |");
  out.push("|---|---:|---:|---:|---:|");
  for (const p of PROGRAMMES) {
    const s = instrumentSummary(p, "v2");
    out.push(`| ${getProgramme(p)?.name} | ${s.items} | ${s.likert} | ${s.reverse} | ${s.sjt} |`);
  }
  out.push("");
  for (const p of PROGRAMMES) {
    out.push(`## ${getProgramme(p)?.name}`);
    out.push("");
    out.push(`**Scale (1–5):** ${V2_SCALE[p].join(" · ")}. Observer form adds "${OBSERVER_DONT_KNOW}" (not scored).`);
    out.push("");
    out.push(`**SJT instructions:** ${SJT_INSTRUCTIONS[p]}`);
    out.push("");
    for (const c of constructs) {
      const face = V2_BANK[p][c.id];
      out.push(`### ${c.name}`);
      out.push("");
      out.push("| # | Skill | Keyed | Self-report | Observer (360) |");
      out.push("|---|---|---|---|---|");
      face.likert.forEach((l, i) => {
        out.push(`| L${i + 1} | ${cell(l.skill)} | ${l.reverse ? "**Reverse**" : "Forward"} | ${cell(l.self)} | ${cell(l.observer)} |`);
      });
      out.push("");
      face.sjt.forEach((sj, i) => {
        out.push(`**S${i + 1} · ${sj.skill}.** ${sj.scenario}`);
        out.push("");
        out.push("| Option | Provisional key (1–4) | Feedback after the attempt |");
        out.push("|---|:---:|---|");
        sj.options.forEach((o) => out.push(`| ${cell(o.text)} | ${o.key}${o.key === 4 ? " (most effective)" : ""} | ${cell(o.why)} |`));
        out.push("");
      });
    }
    const h = HONESTY_ITEM[p];
    out.push(`**Honesty item** (\`${honestyItem(p).id}\`): ${h.prompt} (${h.labels.join(" · ")}). Answers at or below "Partly" flag the attempt for cautious interpretation.`);
    out.push("");
  }
  out.push("## Sign-off checklist for Dr Craig R. Muller");
  out.push("");
  out.push("- [ ] Item wording approved per face and programme (or edits marked).");
  out.push("- [ ] SJT keys confirmed by an expert panel (suggest 5+ experienced leaders/educators rating each option independently; keep options with clear agreement).");
  out.push("- [ ] Kids form length and parent/guardian read-aloud guidance approved.");
  out.push("- [ ] SJT weight (30%) approved, or a different weight chosen.");
  out.push("- [ ] Native-speaker translation (isiZulu, Afrikaans) commissioned following ITC guidelines; no machine translation.");
  out.push("- [ ] Pilot and norming plan agreed before v2 is switched on for learners.");
  out.push("");
  return out.join("\n");
}

test.describe("item bank document", () => {
  test.skip(!OUT, "set GEN_DOCS to an output directory");
  test("write item-bank-v2.md", () => {
    writeFileSync(join(OUT!, "item-bank-v2.md"), build());
  });
});
