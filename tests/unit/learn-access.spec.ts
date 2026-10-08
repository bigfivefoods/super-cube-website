import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STAGES } from "../../src/lib/admin/learners";
import { getCoursesForProgramme } from "../../src/lib/lms/curriculum";
import {
  baselineRecordedAt,
  completionCountsForGate,
  evaluatePostGate,
  POST_MIN_DAYS,
  SESSION_TRUST_MIN_MS,
} from "../../src/lib/lms/gates";
import {
  CONSENT_TEXT_VERSION,
} from "../../src/lib/lms/consent";
import {
  minorMaySyncAnswers,
  payloadHasAssessmentAnswers,
  redactAssessmentAnswers,
} from "../../src/lib/lms/guardian-gate";
import { guardianConsentBlock } from "../../src/lib/lms/server/guardian-gate";
import { mergeLmsStates, remoteStateForMerge } from "../../src/lib/lms/sync";
import type { LocalLmsState } from "../../src/lib/lms/store";

const LEARNER = "11111111-1111-4111-8111-111111111111";
const GUARDIAN = "22222222-2222-4222-8222-222222222222";

function adminStub(ageBand: string | null, consents: Record<string, unknown>[]): SupabaseClient {
  return {
    from(table: string) {
      const api = {
        select() {
          return api;
        },
        eq() {
          return api;
        },
        limit() {
          return api;
        },
        maybeSingle: async () => ({
          data: table === "learner_state" ? { age_band: ageBand } : null,
          error: null,
        }),
        then(resolve: (value: { data: unknown; error: null }) => unknown, reject?: (reason: unknown) => unknown) {
          const data = table === "guardian_consents" ? consents : [];
          return Promise.resolve({ data, error: null }).then(resolve, reject);
        },
      };
      return api;
    },
  } as unknown as SupabaseClient;
}

test("a backdated claim cannot open the after-test", () => {
  const now = new Date("2026-10-08T12:00:00.000Z");
  const recorded = baselineRecordedAt("2026-04-01T12:00:00.000Z", now.getTime());
  expect(recorded).toBe(now.toISOString());

  const everyLesson = getCoursesForProgramme("adults").flatMap((course) => course.lessons.map((lesson) => lesson.id));
  expect(everyLesson.length).toBeGreaterThan(10);

  const gate = evaluatePostGate({
    programmeId: "adults",
    preCompletedAt: recorded,
    completedLessonIds: everyLesson,
    now,
  });
  expect(gate.sessionsDone).toBe(gate.sessionsTotal);
  expect(gate.daysRemaining).toBe(POST_MIN_DAYS);
  expect(gate.ok).toBe(false);

  const bareIds = everyLesson.filter(() => completionCountsForGate(null, now.getTime()));
  expect(bareIds).toEqual([]);
  const monthAgo = new Date(now.getTime() - 40 * 86_400_000).toISOString();
  const untrusted = evaluatePostGate({
    programmeId: "adults",
    preCompletedAt: monthAgo,
    completedLessonIds: bareIds,
    now,
  });
  expect(untrusted.ok).toBe(false);
  expect(untrusted.sessionsDone).toBe(0);

  expect(completionCountsForGate(new Date(now.getTime() - 5_000).toISOString(), now.getTime())).toBe(false);
  expect(completionCountsForGate(new Date(now.getTime() - SESSION_TRUST_MIN_MS).toISOString(), now.getTime())).toBe(true);
});

test("a minor's attempt is rejected without consent recorded by someone else", async () => {
  const self = await guardianConsentBlock(
    adminStub("13-17", [{ learner_user_id: LEARNER, recorded_by: LEARNER, status: "granted", method: "on_device_attestation" }]),
    LEARNER,
  );
  expect(self?.status).toBe(403);
  expect(await self?.json()).toMatchObject({ error: "consent_required" });

  const none = await guardianConsentBlock(adminStub("under-13", []), LEARNER);
  expect(none?.status).toBe(403);

  const allowed = await guardianConsentBlock(
    adminStub("13-17", [{ learner_user_id: LEARNER, recorded_by: GUARDIAN, status: "granted", method: "on_device_attestation" }]),
    LEARNER,
  );
  expect(allowed).toBeNull();

  const adult = await guardianConsentBlock(adminStub("25-34", []), LEARNER);
  expect(adult).toBeNull();

  expect(minorMaySyncAnswers("13-17", LEARNER, [{ learner_user_id: LEARNER, recorded_by: LEARNER, status: "granted" }])).toBe(false);
  expect(minorMaySyncAnswers("13-17", LEARNER, [{ learner_user_id: LEARNER, recorded_by: GUARDIAN, status: "granted" }])).toBe(true);
  const blob = {
    profile: { ageBand: "13-17" },
    attempts: [{ responses: { a: 4 } }],
    assessmentDraft: { responses: { b: 2 } },
    serverEntitlement: { kind: "paid" },
  };
  expect(payloadHasAssessmentAnswers(blob)).toBe(true);
  const redacted = redactAssessmentAnswers(blob);
  expect(payloadHasAssessmentAnswers(redacted)).toBe(false);
  expect(redacted.profile).toEqual(blob.profile);
  expect(redacted.serverEntitlement).toEqual(blob.serverEntitlement);

  expect(STAGES.find((stage) => stage.id === "needs_consent")?.hint).toContain("someone other than the learner");
});

test("signing in on a second device keeps the cloud profile, consent and entitlement", () => {
  const remote: LocalLmsState = {
    lessonProgress: { "adults-choices-overview": "completed" },
    attempts: [],
    reflections: {},
    lastActivityAt: "2026-09-01T08:00:00.000Z",
    profile: {
      displayName: "Thandi",
      ageBand: "13-17",
      role: "student",
      context: "school",
      programmeId: "adolescents",
      profileCompletedAt: "2026-08-01T00:00:00.000Z",
    },
    guardianConsent: {
      guardianName: "Parent Nkosi",
      relationship: "Parent",
      ageBand: "13-17",
      textVersion: CONSENT_TEXT_VERSION,
      grantedAt: "2026-08-02T00:00:00.000Z",
      method: "on_device_attestation",
    },
    serverEntitlement: {
      kind: "paid",
      programmeId: "adolescents",
      userId: "u1",
      checkedAt: "2026-09-01T00:00:00.000Z",
    },
  };
  const secondDevice: LocalLmsState = {
    lessonProgress: {},
    attempts: [],
    reflections: {},
    lastActivityAt: "2026-10-08T12:00:00.000Z",
    practiceStreak: { current: 1, best: 1, lastDate: "2026-10-08" },
  };

  const merged = mergeLmsStates(secondDevice, remoteStateForMerge(remote));
  expect(merged.profile?.displayName).toBe("Thandi");
  expect(merged.profile?.ageBand).toBe("13-17");
  expect(merged.guardianConsent?.guardianName).toBe("Parent Nkosi");
  expect(merged.serverEntitlement).toMatchObject({ kind: "paid", userId: "u1" });
  expect(remoteStateForMerge(remote).profile?.profileCompletedAt).toBe(remote.profile?.profileCompletedAt);
});
