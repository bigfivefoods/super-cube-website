import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CONSENT_REQUIRED_MESSAGE,
  consentCounts,
  isUnder18Band,
  type ConsentGrant,
} from "@/lib/lms/guardian-gate";
import { learnerAgeBand } from "@/lib/lms/server/share-links";

/**
 * Block attempts, lesson writes and answer sync for an under-18 learner
 * until a parent or guardian has recorded consent on their own account.
 * Returns a 403 response, or null when the learner may continue.
 */
export async function guardianConsentBlock(
  admin: SupabaseClient,
  userId: string,
): Promise<NextResponse | null> {
  const band = await learnerAgeBand(admin, userId);
  if (!isUnder18Band(band)) return null;
  const { data } = await admin
    .from("guardian_consents")
    .select("learner_user_id, recorded_by, status, method")
    .eq("learner_user_id", userId)
    .eq("status", "granted")
    .limit(5);
  const rows = (data ?? []) as ConsentGrant[];
  if (rows.some((row) => consentCounts(userId, row))) return null;
  return NextResponse.json(
    { error: "consent_required", message: CONSENT_REQUIRED_MESSAGE },
    { status: 403 },
  );
}
