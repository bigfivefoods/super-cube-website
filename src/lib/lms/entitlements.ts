/**
 * Access / entitlement model for Super-Cube® Learn.
 *
 * free:     orient + baseline (always)
 * demo:     full path on-device (demo unlock or DEMO_LMS_OPEN)
 * paid:     active subscription from Paystack
 * cohort:   future seat packs
 */

import type { ProgrammeId } from "@/lib/programmes";
import {
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
  if (state.subscription?.status === "active") {
    if (state.subscription.planId.endsWith("_demo") && !state.paystackReference) {
      return state.demoUnlocked ? "demo" : "paid";
    }
    if (state.paystackReference || !state.subscription.planId.includes("demo")) {
      return "paid";
    }
    return "demo";
  }
  if (state.demoUnlocked) return "demo";
  return "none";
}

/** Full pathway (courses, post, cert) */
export function hasFullPathwayAccess(state: LocalLmsState): boolean {
  if (demoLmsOpen()) return true;
  if (state.subscription?.status === "active") return true;
  return Boolean(state.demoUnlocked);
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
  state.demoUnlocked = true; // paid includes full device path
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
