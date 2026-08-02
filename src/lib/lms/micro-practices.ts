import { constructs, type ConstructId } from "@/lib/content";

export interface MicroPractice {
  id: string;
  constructId: ConstructId;
  title: string;
  minutes: number;
  prompt: string;
  reflection: string;
}

const bank: Record<ConstructId, Omit<MicroPractice, "constructId">[]> = {
  choices: [
    {
      id: "ch-1",
      title: "One decision, three options",
      minutes: 4,
      prompt:
        "Pick a real decision you are delaying. Write three viable options. Circle the one that best serves people and results.",
      reflection: "What value constrained your choice?",
    },
    {
      id: "ch-2",
      title: "Moral risk check",
      minutes: 3,
      prompt:
        "Before your next yes, ask: who could be harmed if this goes wrong? Write one mitigation.",
      reflection: "Did the risk change your decision?",
    },
  ],
  principles: [
    {
      id: "pr-1",
      title: "Name the non-negotiable",
      minutes: 3,
      prompt:
        "Write one principle you will not trade this week—even under pressure. Put it where you will see it.",
      reflection: "When will this principle be tested?",
    },
    {
      id: "pr-2",
      title: "Integrity micro-act",
      minutes: 5,
      prompt:
        "Do one small public act that aligns with a stated value (credit someone, correct a number, keep a hard promise).",
      reflection: "What did others notice?",
    },
  ],
  mental: [
    {
      id: "me-1",
      title: "Triple reframe",
      minutes: 4,
      prompt:
        "Take one stuck problem. Write it from personal, team, and system angles. Note which frame opens a new action.",
      reflection: "Which frame were you stuck in?",
    },
    {
      id: "me-2",
      title: "Learn one counter-view",
      minutes: 5,
      prompt:
        "Seek one perspective that disagrees with you today. Summarise it fairly in three sentences.",
      reflection: "What did you almost dismiss too fast?",
    },
  ],
  emotional: [
    {
      id: "em-1",
      title: "Name before solve",
      minutes: 3,
      prompt:
        "In your next tense moment, name one feeling (yours or theirs) before offering a solution.",
      reflection: "Did naming change the tone?",
    },
    {
      id: "em-2",
      title: "Recovery breath",
      minutes: 2,
      prompt:
        "Between meetings: 4 breaths in, 6 out, five rounds. Reset posture and facial tension.",
      reflection: "What emotion were you carrying?",
    },
  ],
  physical: [
    {
      id: "ph-1",
      title: "Presence reset",
      minutes: 3,
      prompt:
        "Stand, roll shoulders, walk 2 minutes, drink water. Re-enter with open posture.",
      reflection: "How did presence shift?",
    },
    {
      id: "ph-2",
      title: "Energy boundary",
      minutes: 4,
      prompt:
        "Block one recovery or movement slot this week on your calendar. Protect it like a board meeting.",
      reflection: "What usually steals that slot?",
    },
  ],
  spiritual: [
    {
      id: "sp-1",
      title: "Who benefits?",
      minutes: 3,
      prompt:
        "Write one sentence: who benefits if I lead well this month? Read it before a hard conversation.",
      reflection: "Does your diary match that purpose?",
    },
    {
      id: "sp-2",
      title: "Gratitude to contribution",
      minutes: 4,
      prompt:
        "Thank one person specifically for how they help the mission—not generic praise.",
      reflection: "What meaning did you reinforce?",
    },
  ],
};

export function getMicroPracticesFor(
  constructId: ConstructId
): MicroPractice[] {
  return (bank[constructId] ?? []).map((p) => ({
    ...p,
    constructId,
  }));
}

export function getAllMicroPractices(): MicroPractice[] {
  return constructs.flatMap((c) => getMicroPracticesFor(c.id));
}

/** Pick practice for weakest faces, rotate by day-of-year */
export function pickDailyMicroPractice(
  weakestIds: ConstructId[]
): MicroPractice {
  const pool =
    weakestIds.length > 0
      ? weakestIds.flatMap((id) => getMicroPracticesFor(id))
      : getAllMicroPractices();
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length]!;
}
