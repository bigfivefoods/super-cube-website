import { NextResponse } from "next/server";
import { consentCounts, type ConsentGrant } from "@/lib/lms/guardian-gate";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement } from "@/lib/lms/server/entitlement";
import { loadLearning } from "@/lib/lms/server/learning";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

/** Server view of the learner: entitlement, attempts (server-scored), completions, post gate. */
export async function GET(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) {
    return NextResponse.json({ signedIn: false, error: ctx.error }, { status: ctx.status });
  }
  const programmeParam = new URL(request.url).searchParams.get("programme") || "adults";
  const programmeId = (getProgramme(programmeParam)?.id ?? "adults") as ProgrammeId;

  const [entitlement, learning, certificate, consent] = await Promise.all([
    getServerEntitlement(ctx.admin, ctx.user.id),
    loadLearning(ctx.admin, ctx.user.id, programmeId),
    ctx.admin
      .from("certificates")
      .select("id, issued_at, revoked")
      .eq("user_id", ctx.user.id)
      .eq("programme_id", programmeId)
      .eq("revoked", false)
      .maybeSingle(),
    ctx.admin
      .from("guardian_consents")
      .select("id, status, granted_at, learner_user_id, recorded_by, method, learner_age_band, consent_text_version, guardian_name, relationship")
      .eq("learner_user_id", ctx.user.id)
      .eq("status", "granted")
      .limit(5),
  ]);

  return NextResponse.json({
    signedIn: true,
    userId: ctx.user.id,
    email: ctx.user.email,
    programmeId,
    entitlement,
    attempts: learning.attempts.map((a) => ({
      id: a.id,
      phase: a.phase,
      programmeId: a.programme_id,
      overall: a.overall,
      constructScores: a.construct_scores,
      responses: a.responses,
      completedAt: a.created_at,
    })),
    completions: learning.completions,
    postGate: learning.gate,
    certificate: certificate.data ?? null,
    guardianConsent: (() => {
      const row = ((consent.data ?? []) as (ConsentGrant & {
        id: string;
        granted_at: string;
        learner_age_band: string;
        consent_text_version: string;
        guardian_name: string;
        relationship: string;
      })[]).find((item) => consentCounts(ctx.user.id, item));
      if (!row) return null;
      return {
        id: row.id,
        status: row.status,
        granted_at: row.granted_at,
        learner_age_band: row.learner_age_band,
        consent_text_version: row.consent_text_version,
        guardian_name: row.guardian_name,
        relationship: row.relationship,
      };
    })(),
  });
}
