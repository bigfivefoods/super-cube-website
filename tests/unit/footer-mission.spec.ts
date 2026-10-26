import { expect, test } from "@playwright/test";
import af from "@/lib/i18n/dict/af";
import ar from "@/lib/i18n/dict/ar";
import en from "@/lib/i18n/dict/en";
import fr from "@/lib/i18n/dict/fr";
import pt from "@/lib/i18n/dict/pt";
import sw from "@/lib/i18n/dict/sw";
import zu from "@/lib/i18n/dict/zu";
import { translateText } from "@/lib/i18n/pages/t";

const DICTS = { en, fr, ar, pt, sw, zu, af };

/** Exact bigfivegroup.africa footer lines (live site), plus Afrikaans which that site does not publish. */
const MISSION: Record<keyof typeof DICTS, readonly [string, string]> = {
  en: [
    "One group. One mission. We exist so Africa can prosper — feed, educate and empower.",
    "Regenerative. Sovereign. On-chain. On-purpose.",
  ],
  fr: [
    "Un groupe. Une mission. Nous existons pour que l'Afrique prospère : nourrir, éduquer et autonomiser.",
    "Régénérateur. Souverain. On-chain. Porteur de sens.",
  ],
  ar: [
    "مجموعة واحدة. رسالة واحدة. نحن موجودون لكي تزدهر أفريقيا: الإطعام والتعليم والتمكين.",
    "تجديدية. سيادية. على سلسلة الكتل. هادفة.",
  ],
  pt: [
    "Um grupo. Uma missão. Existimos para que a África prospere: alimentar, educar e capacitar.",
    "Regenerativo. Soberano. On-chain. Com propósito.",
  ],
  sw: [
    "Kundi moja. Dhamira moja. Tupo ili Afrika istawi: kulisha, kuelimisha na kuwezesha.",
    "Kurejesha. Huru. On-chain. Yenye kusudi.",
  ],
  zu: [
    "Iqembu elilodwa. Umgomo owodwa. Sikhona ukuze i-Afrika ichume: siyondla, siyafundisa futhi sinika amandla.",
    "Siyavuselela. Sizimele. On-chain. Sinenhloso.",
  ],
  af: [
    "Een groep. Een missie. Ons bestaan sodat Afrika kan floreer — voed, onderrig en bemagtig.",
    "Regeneratief. Soewerein. On-chain. Doelgerig.",
  ],
};

test.describe("footer group mission", () => {
  test("every language has the Big Five lines, and Super-Cube® keeps its mark", () => {
    for (const [locale, dict] of Object.entries(DICTS)) {
      const [mission, motto] = MISSION[locale as keyof typeof MISSION];
      expect(dict["footer.groupMission"], locale).toBe(mission);
      expect(dict["footer.groupMotto"], locale).toBe(motto);
      for (const line of [mission, motto, dict["footer.tagline"] ?? ""]) {
        expect(line, locale).not.toMatch(/Super-Cube(?!®)/);
      }
    }
  });

  test("a translated page string loads from that language only", () => {
    expect(translateText("en", "Start free")).toBe("Start free");
    expect(translateText("fr", "Start free")).toBe("Commencer gratuitement");
  });
});
