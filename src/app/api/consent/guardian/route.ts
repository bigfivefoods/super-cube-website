import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CONSENT_TEXT_VERSION, GUARDIAN_RELATIONSHIPS } from "@/lib/lms/consent";
import { isUnder18Band } from "@/lib/lms/guardian-gate";
import { requireUser } from "@/lib/lms/server/context";
import { learnerAgeBand } from "@/lib/lms/server/share-links";
import { limitRequest } from "@/lib/server/rate-limit";

const EMAIL_RE = /^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/;

/**
 * Record a parent or guardian's consent for a learner under 18 (POPIA s35).
 * The signed-in account must be someone other than the learner. The learner
 * cannot attest for themselves. No email is sent.
 */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const limited = await limitRequest(request, "guardian-consent", [`user:${ctx.user.id}`]);
  if (limited) return limited;

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.withdraw === true) {
    const now = new Date().toISOString();
    await ctx.admin
      .from("guardian_consents")
      .update({ status: "withdrawn", withdrawn_at: now })
      .or(`learner_user_id.eq.${ctx.user.id},recorded_by.eq.${ctx.user.id}`)
      .eq("status", "granted");
    return NextResponse.json({ ok: true, withdrawn: true });
  }

  const guardianName = String(b.guardianName || "").trim().slice(0, 120);
  const relationship = String(b.relationship || "").trim().slice(0, 40);
  const ageBand = String(b.ageBand || "").trim().slice(0, 20);
  const guardianEmail = String(b.guardianEmail || "").trim().toLowerCase().slice(0, 200) || null;
  const learnerEmail = String(b.learnerEmail || "").trim().toLowerCase().slice(0, 200);
  if (!guardianName || guardianName.length < 2 || !relationship || !ageBand || b.attested !== true) {
    return NextResponse.json({ error: "Guardian name, relationship, age band and attestation are required" }, { status: 400 });
  }
  if (!(GUARDIAN_RELATIONSHIPS as readonly string[]).includes(relationship)) {
    return NextResponse.json({ error: "Unknown relationship" }, { status: 400 });
  }
  if (!isUnder18Band(ageBand)) {
    return NextResponse.json({ error: "Guardian consent is only for learners under 18" }, { status: 400 });
  }
  if (!EMAIL_RE.test(learnerEmail)) {
    return NextResponse.json(
      { error: "learner_email_required", message: "Enter the learner’s account email. Consent is recorded on the guardian’s account, not the learner’s." },
      { status: 400 },
    );
  }

  const { data: matches, error: lookupError } = await ctx.admin
    .from("profiles")
    .select("id, email")
    .ilike("email", learnerEmail)
    .limit(5);
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  const learners = ((matches ?? []) as { id: string; email: string | null }[]).filter(
    (row) => String(row.email || "").toLowerCase() === learnerEmail,
  );
  if (learners.length === 0) {
    return NextResponse.json({ error: "learner_not_found", message: "No learner account uses that email." }, { status: 404 });
  }
  if (learners.length > 1) {
    return NextResponse.json({ error: "learner_not_found", message: "More than one account uses that email." }, { status: 409 });
  }
  const learnerUserId = learners[0].id;
  if (learnerUserId === ctx.user.id || (ctx.user.email && ctx.user.email.toLowerCase() === learnerEmail)) {
    return NextResponse.json(
      {
        error: "consent_required",
        message: "A parent or guardian has to record consent on their own account. The learner cannot consent for themselves.",
      },
      { status: 403 },
    );
  }
  if (isUnder18Band(await learnerAgeBand(ctx.admin, ctx.user.id))) {
    return NextResponse.json(
      {
        error: "consent_required",
        message: "A parent or guardian has to record consent on their own account. The learner cannot consent for themselves.",
      },
      { status: 403 },
    );
  }

  const grantedAt = new Date().toISOString();
  const { data, error } = await ctx.admin
    .from("guardian_consents")
    .insert({
      learner_user_id: learnerUserId,
      learner_display_name: String(b.learnerName || "").trim().slice(0, 80) || null,
      learner_age_band: ageBand,
      guardian_name: guardianName,
      guardian_email: guardianEmail,
      relationship,
      method: "on_device_attestation",
      status: "granted",
      consent_text_version: CONSENT_TEXT_VERSION,
      granted_at: grantedAt,
      recorded_by: ctx.user.id,
    })
    .select("id, granted_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await rememberConsentOnLearner(ctx.admin, learnerUserId, {
    guardianName,
    guardianEmail: guardianEmail ?? undefined,
    relationship,
    ageBand,
    textVersion: CONSENT_TEXT_VERSION,
    grantedAt: (data as { granted_at?: string } | null)?.granted_at || grantedAt,
    method: "on_device_attestation",
    cloudSaved: true,
  });

  return NextResponse.json({ ok: true, consent: data });
}

/** So the learner's next sync picks up consent without dropping the rest of their blob. */
async function rememberConsentOnLearner(
  admin: SupabaseClient,
  learnerUserId: string,
  consent: Record<string, unknown>,
) {
  const { data, error } = await admin.from("learner_state").select("payload").eq("user_id", learnerUserId).maybeSingle();
  if (error) return;
  const current = (data as { payload?: unknown } | null)?.payload;
  const payload =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>), guardianConsent: consent }
      : { guardianConsent: consent };
  await admin.from("learner_state").upsert(
    { user_id: learnerUserId, payload, client_updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}
