import { test, expect } from "@playwright/test";
import { getJourney, stepLabel, JOURNEY_TOTAL } from "@/lib/lms/journey";
import { getDashboardAction, getJournalAction } from "@/lib/lms/next-action";
import type { LocalLmsState } from "@/lib/lms/store";

const profile = {
  displayName: "Thandi Mokoena",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: "2026-10-01T08:00:00.000Z",
};

function state(extra: Partial<LocalLmsState> = {}): LocalLmsState {
  return { profile, lessonProgress: {}, attempts: [], reflections: {}, ...extra } as unknown as LocalLmsState;
}

test("step counter wording", () => {
  expect(JOURNEY_TOTAL).toBe(6);
  expect(stepLabel(3)).toBe("Step 3 of 6");
});

test("the programme picked in the profile counts as step 1", () => {
  const j = getJourney(state());
  expect(j.steps[0].status).toBe("done");
  expect(j.current.id).toBe("orient");
});

test("dashboard action walks profile → orientation → baseline before any journal prompt", () => {
  expect(getDashboardAction(state({ profile: undefined } as Partial<LocalLmsState>), false).kind).toBe("profile");
  expect(getDashboardAction(state(), true).kind).toBe("orient");
  expect(getJournalAction(state())).toBeNull();
  const oriented = state({
    orientation: { responses: {}, result: { label: "x" }, completedAt: "2026-10-02T08:00:00.000Z" },
  } as unknown as Partial<LocalLmsState>);
  expect(getDashboardAction(oriented, true).kind).toBe("baseline");
  expect(getJournalAction(oriented)?.kind).toBe("first_pulse");
});

test("without a programme the dashboard points at step 1", () => {
  const noProgramme = state({ profile: { ...profile, programmeId: undefined } } as unknown as Partial<LocalLmsState>);
  const a = getDashboardAction(noProgramme, false);
  expect(["programme", "profile"]).toContain(a.kind);
});
