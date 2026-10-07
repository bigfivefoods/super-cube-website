import type { SupabaseClient } from "@supabase/supabase-js";
import { learnerStage, type LearnerRow } from "@/lib/admin/learners";

export type Cohort = {
  id: string;
  code: string;
  name: string;
  kind: string;
  active: boolean;
  seat_limit: number | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  learners: number;
  staff: number;
};

export type SeatGrant = {
  id: string;
  org_id: string;
  seats: number;
  kind: string;
  reference: string | null;
  note: string | null;
  granted_by: string;
  created_at: string;
  revoked_at: string | null;
  revoked_by: string | null;
  revoked_reason: string | null;
};

export type Invite = {
  id: string;
  org_id: string;
  role: string;
  email: string | null;
  expires_at: string;
  max_uses: number;
  used_count: number;
  revoked: boolean;
  created_at: string;
};

export type ConsentRow = {
  id: string;
  learner_user_id: string | null;
  learner_display_name: string | null;
  learner_age_band: string;
  guardian_name: string;
  guardian_email: string | null;
  relationship: string;
  method: string;
  status: string;
  consent_text_version: string;
  granted_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
};

export type CertificateRow = {
  id: string;
  user_id: string | null;
  learner_name: string;
  programme_id: string | null;
  growth: number | null;
  issued_at: string;
  org_code: string | null;
  revoked: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
};

export type AuditRow = {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, unknown>;
  created_at: string;
};

const LIMIT = 2000;

export async function loadCohorts(db: SupabaseClient) {
  const [orgs, members, grants, invites] = await Promise.all([
    db
      .from("organisations")
      .select("id, code, name, kind, active, seat_limit, contact_email, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    db.from("org_members").select("org_id, role").limit(50000),
    db.from("org_seat_grants").select("*").order("created_at", { ascending: false }).limit(LIMIT),
    db
      .from("org_invites")
      .select("id, org_id, role, email, expires_at, max_uses, used_count, revoked, created_at")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  ]);
  const error = orgs.error?.message || members.error?.message || grants.error?.message || invites.error?.message || null;
  const counts = new Map<string, { learners: number; staff: number }>();
  for (const m of (members.data ?? []) as { org_id: string; role: string }[]) {
    const c = counts.get(m.org_id) ?? { learners: 0, staff: 0 };
    if (m.role === "learner") c.learners += 1;
    else c.staff += 1;
    counts.set(m.org_id, c);
  }
  const cohorts: Cohort[] = ((orgs.data ?? []) as Omit<Cohort, "learners" | "staff">[]).map((o) => ({
    ...o,
    learners: counts.get(o.id)?.learners ?? 0,
    staff: counts.get(o.id)?.staff ?? 0,
  }));
  return {
    error,
    cohorts,
    grants: (grants.data ?? []) as SeatGrant[],
    invites: (invites.data ?? []) as Invite[],
  };
}

export async function loadLearners(db: SupabaseClient): Promise<{ error: string | null; learners: LearnerRow[] }> {
  const demoOpen = process.env.NEXT_PUBLIC_DEMO_LMS_OPEN === "true";
  const [profiles, states, attempts, completions, certs, consents, members, orgs, subs] = await Promise.all([
    db.from("profiles").select("id, email, full_name, programme_id, created_at").order("created_at", { ascending: false }).limit(LIMIT),
    // Only two scalar fields from the synced blob: never reflections or answers
    db.from("learner_state").select("user_id, age_band:payload->profile->>ageBand, last_activity:payload->>lastActivityAt, updated_at").limit(LIMIT * 2),
    db.from("lms_attempts").select("user_id, phase, created_at").limit(LIMIT * 4),
    db.from("lms_lesson_completions").select("user_id").limit(100000),
    db.from("certificates").select("user_id, revoked").limit(LIMIT * 2),
    db.from("guardian_consents").select("learner_user_id, learner_age_band, status").limit(LIMIT * 2),
    db.from("org_members").select("user_id, org_id, role").limit(50000),
    db.from("organisations").select("id, code, active, seat_limit").limit(LIMIT),
    db.from("subscriptions").select("user_id, status, plan_id, paystack_subscription_code").eq("status", "active").limit(LIMIT * 2),
  ]);
  const error =
    [profiles, states, attempts, completions, certs, consents, members, orgs, subs].map((r) => r.error?.message).find(Boolean) ?? null;

  const state = new Map<string, { age_band: string | null; last_activity: string | null; updated_at: string | null }>();
  for (const s of (states.data ?? []) as { user_id: string; age_band: string | null; last_activity: string | null; updated_at: string | null }[]) {
    state.set(s.user_id, s);
  }
  const pre = new Map<string, string>();
  const post = new Map<string, string>();
  for (const a of (attempts.data ?? []) as { user_id: string; phase: string; created_at: string }[]) {
    const m = a.phase === "pre" ? pre : a.phase === "post" ? post : null;
    if (m && (!m.has(a.user_id) || a.created_at < m.get(a.user_id)!)) m.set(a.user_id, a.created_at);
  }
  const done = new Map<string, number>();
  for (const c of (completions.data ?? []) as { user_id: string }[]) done.set(c.user_id, (done.get(c.user_id) ?? 0) + 1);
  const certified = new Set(
    ((certs.data ?? []) as { user_id: string | null; revoked: boolean }[]).filter((c) => c.user_id && !c.revoked).map((c) => c.user_id!),
  );
  const consentOk = new Set<string>();
  const consentBand = new Map<string, string>();
  for (const c of (consents.data ?? []) as { learner_user_id: string | null; learner_age_band: string; status: string }[]) {
    if (!c.learner_user_id) continue;
    consentBand.set(c.learner_user_id, c.learner_age_band);
    if (c.status === "granted") consentOk.add(c.learner_user_id);
  }
  const orgById = new Map(((orgs.data ?? []) as { id: string; code: string; active: boolean; seat_limit: number | null }[]).map((o) => [o.id, o]));
  const cohortsOf = new Map<string, string[]>();
  const seated = new Set<string>();
  for (const m of (members.data ?? []) as { user_id: string; org_id: string; role: string }[]) {
    const o = orgById.get(m.org_id);
    if (!o) continue;
    cohortsOf.set(m.user_id, [...(cohortsOf.get(m.user_id) ?? []), o.code]);
    if (o.active && (o.seat_limit ?? 0) > 0) seated.add(m.user_id);
  }
  const paid = new Set(
    ((subs.data ?? []) as { user_id: string; plan_id: string; paystack_subscription_code: string | null }[])
      .filter((s) => s.paystack_subscription_code && !String(s.plan_id).endsWith("_demo"))
      .map((s) => s.user_id),
  );

  const now = Date.now();
  const learners = ((profiles.data ?? []) as { id: string; email: string | null; full_name: string | null; programme_id: string | null; created_at: string }[]).map(
    (p) => {
      const s = state.get(p.id);
      return learnerStage(
        {
          id: p.id,
          email: p.email,
          fullName: p.full_name,
          programmeId: p.programme_id,
          createdAt: p.created_at,
          ageBand: s?.age_band || consentBand.get(p.id) || null,
          lastActivityAt: s?.last_activity || s?.updated_at || null,
          preAt: pre.get(p.id) ?? null,
          postAt: post.get(p.id) ?? null,
          completions: done.get(p.id) ?? 0,
          certificateValid: certified.has(p.id),
          consentGranted: consentOk.has(p.id),
          entitled: demoOpen || paid.has(p.id) || seated.has(p.id),
          cohorts: cohortsOf.get(p.id) ?? [],
        },
        now,
      );
    },
  );
  return { error, learners };
}

export async function loadConsents(db: SupabaseClient) {
  const res = await db
    .from("guardian_consents")
    .select("id, learner_user_id, learner_display_name, learner_age_band, guardian_name, guardian_email, relationship, method, status, consent_text_version, granted_at, withdrawn_at, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  return { error: res.error?.message ?? null, consents: (res.data ?? []) as ConsentRow[] };
}

export async function loadCertificates(db: SupabaseClient) {
  const res = await db
    .from("certificates")
    .select("id, user_id, learner_name, programme_id, growth, issued_at, org_code, revoked, revoked_at, revoked_reason")
    .order("issued_at", { ascending: false })
    .limit(LIMIT);
  return { error: res.error?.message ?? null, certificates: (res.data ?? []) as CertificateRow[] };
}

export async function loadAudit(db: SupabaseClient) {
  const res = await db
    .from("admin_audit_log")
    .select("id, actor, action, target_type, target_id, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  return { error: res.error?.message ?? null, rows: (res.data ?? []) as AuditRow[] };
}

/** "j***@example.com": enough to recognise, not enough to harvest (POPIA minimisation). */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const [user, domain] = email.split("@");
  if (!domain) return "—";
  return `${user.slice(0, 1)}***@${domain}`;
}

/** Current time, outside render (React Compiler purity rule). */
export const nowMs = () => Date.now();
