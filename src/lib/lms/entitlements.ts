/**
 * Access / entitlement model for Super-Cube® Learn.
 *
 * free:     orient + baseline (always)
 * demo:     free sample only (Choices overview and its first skill)
 * paid:     Paystack payment verified server-side, or a cohort seat
 * open:     NEXT_PUBLIC_DEMO_LMS_OPEN=true (whole LMS free; never in production)
 *
 * These client checks are UX only. The server enforces entitlement in
 * /api/lms/attempts, /api/lms/progress and /api/certificates/issue.
 */

import type { ProgrammeId } from "@/lib/programmes";
import {
  hasLocalAccess,
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
  type LocalSubscription,
} from "@/lib/lms/store";

export type EntitlementTier = "none" | "demo" | "paid" | "open";

export function demoLmsOpen(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true";
}

export function getEntitlementTier(state: LocalLmsState): EntitlementTier {
  if (demoLmsOpen()) return "open";
  if (hasLocalAccess(state)) return "paid";
  if (state.demoUnlocked) return "demo";
  return "none";
}

/** Full pathway (all sessions, post assessment, certificate). Demo = samples only. */
export function hasFullPathwayAccess(state: LocalLmsState): boolean {
  return hasLocalAccess(state);
}

/** Free funnel: orient + pre always allowed */
export function canAccessBaseline(_state: LocalLmsState): boolean {
  return true;
}

export function canAccessCourses(state: LocalLmsState): boolean {
  return hasFullPathwayAccess(state);
}

export type ActivatePaidInput = {
  programmeId: ProgrammeId;
  planId?: string;
  email?: string;
  fullName?: string;
  paystackReference?: string;
  currency?: string;
  amountCents?: number;
  /** Seat pack fields */
  orgCode?: string;
  seats?: number;
  packId?: string;
  orgName?: string;
};

/** Activate paid (or verified) subscription on this device */
export function activatePaidSubscription(
  input: ActivatePaidInput
): LocalLmsState {
  const state = loadLmsState();
  const programmeId = input.programmeId;
  const planId = input.planId || `${programmeId}_once`;

  const sub: LocalSubscription = {
    programmeId,
    planId,
    status: "active",
    activatedAt: state.subscription?.activatedAt || new Date().toISOString(),
    paystackReference: input.paystackReference,
  };
  state.subscription = sub;
  if (input.paystackReference) {
    state.paystackReference = input.paystackReference;
  }
  if (input.orgCode) {
    state.orgCode = input.orgCode;
  }
  if (input.seats && input.packId) {
    state.seatPack = {
      packId: input.packId,
      seats: input.seats,
      orgCode: input.orgCode,
      orgName: input.orgName,
      purchasedAt: new Date().toISOString(),
    };
  }
  state.user = {
    email:
      input.email ||
      state.user?.email ||
      "learner@super-cube.me",
    fullName:
      input.fullName ||
      state.user?.fullName ||
      state.profile?.displayName ||
      "Learner",
    programmeId,
  };
  if (state.profile && !state.profile.displayName && state.user.fullName) {
    state.profile = { ...state.profile, displayName: state.user.fullName };
  }
  saveLmsState(state);
  return state;
}
