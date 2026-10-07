import { expect, test } from "@playwright/test";
import { contrastRatio } from "../../src/lib/contrast";
import { PROGRAMME_THEME } from "../../src/lib/programme-theme";

const FACES = ["#B32026", "#5D1F5E", "#ED8F20", "#367638", "#16979A", "#26408C"];

test("band text passes WCAG AA on every gradient stop", () => {
  for (const [id, t] of Object.entries(PROGRAMME_THEME)) {
    for (const stop of t.stops) {
      expect(contrastRatio(t.ink, stop), `${id} ink on ${stop}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.accent, stop), `${id} accent on ${stop}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("programme colours are not cube face colours", () => {
  const all = Object.values(PROGRAMME_THEME).flatMap((t) => t.stops.map((s) => s.toUpperCase()));
  for (const f of FACES) expect(all).not.toContain(f);
});
