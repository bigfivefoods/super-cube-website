import { constructs, type ConstructId } from "@/lib/content";

/** Pre → post gains from Super-Cube® interventions (percentage points / % improvement). */
export const interventionGains: {
  constructId: ConstructId | "overall";
  label: string;
  gainPct: number;
  color: string;
  colorSoft: string;
}[] = [
  {
    constructId: "choices",
    label: "Choices",
    gainPct: 26.6,
    color: constructs.find((c) => c.id === "choices")!.color,
    colorSoft: constructs.find((c) => c.id === "choices")!.colorSoft,
  },
  {
    constructId: "principles",
    label: "Principles",
    gainPct: 45.1,
    color: constructs.find((c) => c.id === "principles")!.color,
    colorSoft: constructs.find((c) => c.id === "principles")!.colorSoft,
  },
  {
    constructId: "mental",
    label: "Mental",
    gainPct: 29.7,
    color: constructs.find((c) => c.id === "mental")!.color,
    colorSoft: constructs.find((c) => c.id === "mental")!.colorSoft,
  },
  {
    constructId: "emotional",
    label: "Emotional",
    gainPct: 39.5,
    color: constructs.find((c) => c.id === "emotional")!.color,
    colorSoft: constructs.find((c) => c.id === "emotional")!.colorSoft,
  },
  {
    constructId: "physical",
    label: "Physical",
    gainPct: 27.7,
    color: constructs.find((c) => c.id === "physical")!.color,
    colorSoft: constructs.find((c) => c.id === "physical")!.colorSoft,
  },
  {
    constructId: "spiritual",
    label: "Spiritual",
    gainPct: 24.6,
    color: constructs.find((c) => c.id === "spiritual")!.color,
    colorSoft: constructs.find((c) => c.id === "spiritual")!.colorSoft,
  },
];

export const overallInterventionGain = 32.2;

/** Max for bar scaling (slightly above highest construct gain) */
export const interventionGainScaleMax = 50;
