import type { ConstructId } from "@/lib/content";
import { constructs } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

/** One-line “win of the day” after completing a session */
export function sessionWinLine(
  constructId: ConstructId,
  programmeId: ProgrammeId,
  lessonTitle: string
): string {
  const c = constructs.find((x) => x.id === constructId);
  const face = c?.shortName ?? "leadership";

  if (programmeId === "kids") {
    const kids: Record<string, string> = {
      choices: "Today you practiced making a kind, wise choice.",
      principles: "Today you practiced keeping a promise to yourself or others.",
      mental: "Today you practiced thinking things through calmly.",
      emotional: "Today you practiced noticing feelings and using kind words.",
      physical: "Today you practiced looking after your body so you can lead well.",
      spiritual: "Today you practiced meaning, hope, and care for others.",
    };
    return kids[constructId] ?? `Today you grew your ${face} superpowers.`;
  }

  if (programmeId === "adolescents") {
    return `Win: You completed “${lessonTitle.slice(0, 48)}” on the ${face} face—small deliberate practice compounds.`;
  }

  return `Win of the day: You invested in the ${face} face (${lessonTitle.slice(0, 40)}${lessonTitle.length > 40 ? "…" : ""}). Name one situation this week where you’ll use it.`;
}

export function reflectionPrompt(
  constructId: ConstructId,
  programmeId: ProgrammeId
): { title: string; hint: string; placeholder: string } {
  const face =
    constructs.find((c) => c.id === constructId)?.shortName ?? "this face";

  if (programmeId === "kids") {
    return {
      title: "What will you try?",
      hint: "One small thing you can do this week—at home, school, or with friends.",
      placeholder: "I will try to…",
    };
  }

  if (programmeId === "adolescents") {
    return {
      title: "Your practice this week",
      hint: `Where will you use ${face}—school, sport, online, or with friends? Be specific.`,
      placeholder:
        "This week, when ___ happens, I will ___ (who, where, what you’ll do).",
    };
  }

  return {
    title: "Reflect before you leave",
    hint: `What will you practice on the ${face} face this week? Who will you serve differently?`,
    placeholder:
      "Write 2–5 sentences. Specific beats vague—name a meeting, stakeholder, decision, or team moment.",
  };
}
