import { NextResponse } from "next/server";
import { CONSENT_TEXT_VERSION } from "@/lib/lms/consent";
import { requireUser } from "@/lib/lms/server/context";

/**
 * Record a parent/guardian's consent for a learner under 18 (POPIA s35).
 * Phase 0 method: on-device attestation by the guardian. No email is sent.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.withdraw === true) {
    await ctx.admin
      .from("guardian_consents")
      .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
      .eq("learner_user_id", ctx.user.id)
      .eq("status", "granted");
    return NextResponse.json({ ok: true, withdrawn: true });
  }

  const guardianName = String(b.guardianName || "").trim().slice(0, 120);
  const relationship = String(b.relationship || "").trim().slice(0, 40);
  const ageBand = String(b.ageBand || "").trim().slice(0, 20);
  const guardianEmail = String(b.guardianEmail || "").trim().toLowerCase().slice(0, 200) || null;
  if (!guardianName || !relationship || !ageBand || b.attested !== true) {
    return NextResponse.json({ error: "Guardian name, relationship, age band and attestation are required" }, { status: 400 });
  }

  const { data, error } = await ctx.admin
    .from("guardian_consents")
    .insert({
      learner_user_id: ctx.user.id,
      learner_display_name: String(b.learnerName || "").trim().slice(0, 80) || null,
      learner_age_band: ageBand,
      guardian_name: guardianName,
      guardian_email: guardianEmail,
      relationship,
      method: "on_device_attestation",
      status: "granted",
      consent_text_version: CONSENT_TEXT_VERSION,
      granted_at: new Date().toISOString(),
    })
    .select("id, granted_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, consent: data });
}
