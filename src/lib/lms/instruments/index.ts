/**
 * Instrument registry.
 *  - v1 (standard form): the 28-item (Adults) instrument used on the platform today.
 *    It is a later version of the 18-item survey in Dr Muller's DBA research, not the
 *    thesis survey itself. Unchanged, so baseline and after-test results stay comparable.
 *  - v2 (draft): behaviourally anchored frequency items (about one-third
 *    reverse-keyed) plus situational judgement items, with Kids and Teens forms
 *    and a parallel observer (360) form. OFF in production until Dr Muller signs off.
 * A learner's after-test always uses the same version as their baseline.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { buildAssessmentItems, LIKERT_LABELS, type AssessmentItem } from "@/lib/lms/assessment-items";
import type { ProgrammeId } from "@/lib/programmes";
import { HONESTY_ITEM, V2_BANK, V2_SCALE } from "@/lib/lms/instruments/v2-bank";

export type InstrumentVersion = "v1" | "v2";

export const INSTRUMENT_LABELS: Record<InstrumentVersion, string> = {
  v1: "v1 (standard form)",
  v2: "v2 (behavioural + situational judgement, draft for sign-off)",
};

export function instrumentIdFor(programmeId: ProgrammeId, version: InstrumentVersion): string {
  return `super_cube_${programmeId}_${version}`;
}

/** Version from an instrument id or an item id; anything unknown is treated as v1. */
export function versionOf(idOrItemId: string | null | undefined): InstrumentVersion {
  return /_v2(-|$)/.test(String(idOrItemId ?? "")) ? "v2" : "v1";
}

/** Version used by a set of stored responses (keys are item ids). */
export function versionOfResponses(responses: Record<string, unknown> | null | undefined): InstrumentVersion {
  return Object.keys(responses ?? {}).some((k) => versionOf(k) === "v2") ? "v2" : "v1";
}

/** Server-side switch. Default OFF: only "on" enables v2 for new baselines. */
export function isInstrumentV2EnabledServer(): boolean {
  return (process.env.LMS_INSTRUMENT_V2 ?? "").trim().toLowerCase() === "on";
}

/** Browser-side switch (must match the server one). Default OFF. */
export function isInstrumentV2EnabledClient(): boolean {
  return (process.env.NEXT_PUBLIC_LMS_INSTRUMENT_V2 ?? "").trim().toLowerCase() === "on";
}

function buildV2Items(programmeId: ProgrammeId): AssessmentItem[] {
  const instrumentId = instrumentIdFor(programmeId, "v2");
  const bank = V2_BANK[programmeId];
  const scale = V2_SCALE[programmeId];
  const items: AssessmentItem[] = [];
  let order = 0;
  for (const c of constructs) {
    const face = bank[c.id as ConstructId];
    face.likert.forEach((l, i) => {
      items.push({
        id: `${instrumentId}-${c.id}-L${i + 1}`,
        instrumentId,
        constructId: c.id,
        prompt: l.self,
        itemType: "likert_5",
        sortOrder: order++,
        reverse: l.reverse,
        skill: l.skill,
        scaleLabels: scale,
        observerPrompt: l.observer,
      });
    });
    face.sjt.forEach((s, i) => {
      items.push({
        id: `${instrumentId}-${c.id}-S${i + 1}`,
        instrumentId,
        constructId: c.id,
        prompt: s.scenario,
        itemType: "sjt",
        sortOrder: order++,
        skill: s.skill,
        options: s.options.map((opt, j) => ({
          value: j + 1,
          text: opt.text,
          key: opt.key,
          score: Math.round(((opt.key - 1) / 3) * 1000) / 10,
          why: opt.why,
        })),
      });
    });
  }
  return items;
}

const cache = new Map<string, AssessmentItem[]>();

export function buildInstrumentItems(programmeId: ProgrammeId, version: InstrumentVersion = "v1"): AssessmentItem[] {
  const key = `${programmeId}|${version}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const items = version === "v2" ? buildV2Items(programmeId) : buildAssessmentItems(programmeId);
  cache.set(key, items);
  return items;
}

/** Scale labels for a Likert item (v1 agreement, v2 frequency). */
export function scaleLabelsFor(item: Pick<AssessmentItem, "scaleLabels">): readonly string[] {
  return item.scaleLabels ?? LIKERT_LABELS;
}

export function honestyItem(programmeId: ProgrammeId) {
  return { id: `${instrumentIdFor(programmeId, "v2")}-honesty-1`, ...HONESTY_ITEM[programmeId] };
}

export type ObserverItem = { id: string; constructId: ConstructId; prompt: string; reverse: boolean; skill: string };

/** Observer (360) form: parallel third-person wording of the v2 self-report items. */
export function observerItems(programmeId: ProgrammeId, learnerFirstName?: string): ObserverItem[] {
  const name = (learnerFirstName || "").trim() || "this person";
  return buildInstrumentItems(programmeId, "v2")
    .filter((i) => i.itemType === "likert_5" && i.observerPrompt)
    .map((i) => {
      const text = i.observerPrompt!.replace(/\{name\}/g, name);
      return {
        id: i.id.replace("_v2-", "_v2obs-"),
        constructId: i.constructId,
        prompt: text.charAt(0).toUpperCase() + text.slice(1),
        reverse: Boolean(i.reverse),
        skill: i.skill ?? "",
      };
    });
}

/** Summary counts, used by docs, tests and the admin preview. */
export function instrumentSummary(programmeId: ProgrammeId, version: InstrumentVersion) {
  const items = buildInstrumentItems(programmeId, version);
  const likert = items.filter((i) => i.itemType === "likert_5");
  const sjt = items.filter((i) => i.itemType === "sjt");
  return {
    items: items.length,
    likert: likert.length,
    reverse: likert.filter((i) => i.reverse).length,
    sjt: sjt.length,
    perFace: constructs.map((c) => ({
      faceId: c.id,
      likert: likert.filter((i) => i.constructId === c.id).length,
      reverse: likert.filter((i) => i.constructId === c.id && i.reverse).length,
      sjt: sjt.filter((i) => i.constructId === c.id).length,
    })),
  };
}
