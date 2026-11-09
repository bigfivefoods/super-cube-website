/**
 * Service-role persistence. Rows are invisible to the browser (RLS, no policies).
 * The org-admin API checks membership before it calls save or delete.
 */
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LtiProtocolError } from "@/lib/lti/errors";
import type {
  GradePass,
  LaunchRecord,
  LaunchToken,
  LoginState,
  LtiPlatform,
  LtiStore,
  MemberInput,
  PlatformInput,
  PlatformLookup,
  UserLink,
} from "@/lib/lti/store";

type DbError = { code?: string; message?: string } | null;

export function createSupabaseLtiStore(admin: SupabaseClient): LtiStore {
  return {
    findForLogin: (query) => findForLogin(admin, query),
    getPlatform: (id) => getPlatform(admin, id),
    listPlatforms: (orgIds) => listPlatforms(admin, orgIds),
    savePlatform: (input) => savePlatform(admin, input),
    deletePlatform: (id, orgId) => deletePlatform(admin, id, orgId),
    putState: (row) => putState(admin, row),
    takeState: (state, now) => takeState(admin, state, now),
    saveLaunch: (row) => saveLaunch(admin, row),
    getLaunch: (id) => getLaunch(admin, id),
    putToken: (row) => putToken(admin, row),
    getToken: (token, now) => getToken(admin, token, now),
    mapMember: (input) => mapMember(admin, input),
    listMembers: (platformId) => listMembers(admin, platformId),
    saveGrade: (row) => saveGrade(admin, row),
  };
}

function missing(error: DbError): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message ?? "");
}

function raise(error: DbError): never {
  if (missing(error)) {
    throw new LtiProtocolError(503, "not_ready", "LMS connection is not switched on yet.");
  }
  if (error?.code === "23505") throw new LtiProtocolError(409, "duplicate", "That platform is already registered.");
  throw new LtiProtocolError(500, "store", "LMS launch is not configured on this server yet.");
}

function platformFrom(row: Record<string, unknown>): LtiPlatform {
  const org = row.organisations as { code?: string } | { code?: string }[] | null;
  const code = Array.isArray(org) ? org[0]?.code : org?.code;
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    orgCode: code ?? null,
    name: String(row.name),
    issuer: String(row.issuer),
    clientId: String(row.client_id),
    deploymentId: String(row.deployment_id),
    authLoginUrl: String(row.auth_login_url),
    tokenUrl: String(row.token_url),
    jwksUrl: String(row.jwks_url),
  };
}

async function findForLogin(admin: SupabaseClient, query: PlatformLookup): Promise<LtiPlatform | "ambiguous" | null> {
  let q = admin.from("lti_platforms").select("*, organisations(code)").eq("issuer", query.issuer);
  if (query.clientId) q = q.eq("client_id", query.clientId);
  if (query.deploymentId) q = q.eq("deployment_id", query.deploymentId);
  const { data, error } = await q.limit(5);
  if (error) raise(error);
  const rows = (data ?? []) as Record<string, unknown>[];
  if (!query.deploymentId && rows.length > 1) return "ambiguous";
  return rows[0] ? platformFrom(rows[0]) : null;
}

async function getPlatform(admin: SupabaseClient, id: string): Promise<LtiPlatform | null> {
  const { data, error } = await admin.from("lti_platforms").select("*, organisations(code)").eq("id", id).maybeSingle();
  if (error) raise(error);
  return data ? platformFrom(data as Record<string, unknown>) : null;
}

async function listPlatforms(admin: SupabaseClient, orgIds: string[]): Promise<LtiPlatform[]> {
  if (orgIds.length === 0) return [];
  const { data, error } = await admin.from("lti_platforms").select("*, organisations(code)").in("org_id", orgIds);
  if (error) raise(error);
  return ((data ?? []) as Record<string, unknown>[]).map(platformFrom);
}

async function savePlatform(admin: SupabaseClient, input: PlatformInput): Promise<LtiPlatform> {
  const row = {
    org_id: input.orgId,
    name: input.name,
    issuer: input.issuer,
    client_id: input.clientId,
    deployment_id: input.deploymentId,
    auth_login_url: input.authLoginUrl,
    token_url: input.tokenUrl,
    jwks_url: input.jwksUrl,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await admin.from("lti_platforms").insert(row).select("*, organisations(code)").single();
  if (error || !data) raise(error);
  return platformFrom(data as Record<string, unknown>);
}

async function deletePlatform(admin: SupabaseClient, id: string, orgId: string): Promise<boolean> {
  const { data, error } = await admin.from("lti_platforms").delete().eq("id", id).eq("org_id", orgId).select("id");
  if (error) raise(error);
  return ((data ?? []) as unknown[]).length > 0;
}

async function putState(admin: SupabaseClient, row: LoginState): Promise<void> {
  const { error } = await admin.from("lti_login_states").insert({
    state: row.state,
    nonce: row.nonce,
    platform_id: row.platformId,
    target_link_uri: row.targetLinkUri,
    expires_at: new Date(row.expiresAt).toISOString(),
  });
  if (error) raise(error);
}

async function takeState(admin: SupabaseClient, state: string, now: number): Promise<LoginState | null> {
  const { data, error } = await admin.from("lti_login_states").delete().eq("state", state).select("*").maybeSingle();
  if (error) raise(error);
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const expiresAt = Date.parse(String(row.expires_at));
  if (!(expiresAt > now)) return null;
  return {
    state: String(row.state),
    nonce: String(row.nonce),
    platformId: String(row.platform_id),
    targetLinkUri: String(row.target_link_uri),
    expiresAt,
  };
}

function launchToRow(row: LaunchRecord): Record<string, unknown> {
  return {
    id: row.id,
    platform_id: row.platformId,
    user_link_id: row.userLinkId,
    message_type: row.messageType,
    resource_link_id: row.resourceLinkId,
    programme_id: row.programmeId,
    course_id: row.courseId,
    context_id: row.contextId,
    subject: row.subject,
    deployment_id: row.deploymentId,
    ags_lineitem_url: row.agsLineitemUrl,
    ags_scopes: row.agsScopes,
    nrps_url: row.nrpsUrl,
    return_url: row.returnUrl,
    dl_data: row.dlData,
    accept_multiple: row.acceptMultiple,
    locale: row.locale,
    full_name: row.fullName,
    email: row.email,
  };
}

function launchFrom(row: Record<string, unknown>): LaunchRecord {
  return {
    id: String(row.id),
    platformId: String(row.platform_id),
    userLinkId: row.user_link_id ? String(row.user_link_id) : null,
    messageType: String(row.message_type),
    resourceLinkId: row.resource_link_id ? String(row.resource_link_id) : null,
    programmeId: row.programme_id ? String(row.programme_id) : null,
    courseId: row.course_id ? String(row.course_id) : null,
    contextId: row.context_id ? String(row.context_id) : null,
    subject: String(row.subject),
    deploymentId: String(row.deployment_id),
    agsLineitemUrl: row.ags_lineitem_url ? String(row.ags_lineitem_url) : null,
    agsScopes: Array.isArray(row.ags_scopes) ? row.ags_scopes.map(String) : [],
    nrpsUrl: row.nrps_url ? String(row.nrps_url) : null,
    returnUrl: row.return_url ? String(row.return_url) : null,
    dlData: row.dl_data ? String(row.dl_data) : null,
    acceptMultiple: row.accept_multiple !== false,
    locale: row.locale ? String(row.locale) : null,
    fullName: row.full_name ? String(row.full_name) : null,
    email: row.email ? String(row.email) : null,
  };
}

async function saveLaunch(admin: SupabaseClient, row: LaunchRecord): Promise<void> {
  const { error } = await admin.from("lti_launches").insert(launchToRow(row));
  if (error) raise(error);
}

async function getLaunch(admin: SupabaseClient, id: string) {
  const { data, error } = await admin
    .from("lti_launches")
    .select("*, lti_platforms(*, organisations(code))")
    .eq("id", id)
    .maybeSingle();
  if (error) raise(error);
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const platformRow = row.lti_platforms as Record<string, unknown> | Record<string, unknown>[] | null;
  const platform = Array.isArray(platformRow) ? platformRow[0] : platformRow;
  if (!platform) return null;
  return { launch: launchFrom(row), platform: platformFrom(platform) };
}

async function putToken(admin: SupabaseClient, row: LaunchToken): Promise<void> {
  const { error } = await admin.from("lti_launch_tokens").insert({
    token: row.token,
    launch_id: row.launchId,
    kind: row.kind,
    expires_at: new Date(row.expiresAt).toISOString(),
  });
  if (error) raise(error);
}

async function getToken(admin: SupabaseClient, token: string, now: number): Promise<LaunchToken | null> {
  const { data, error } = await admin.from("lti_launch_tokens").select("*").eq("token", token).maybeSingle();
  if (error) raise(error);
  if (!data) return null;
  const row = data as Record<string, unknown>;
  const expiresAt = Date.parse(String(row.expires_at));
  if (!(expiresAt > now)) return null;
  const kind = row.kind === "deep" ? "deep" : "enter";
  return { token, launchId: String(row.launch_id), kind, expiresAt };
}

async function listMembers(admin: SupabaseClient, platformId: string): Promise<UserLink[]> {
  const { data, error } = await admin.from("lti_user_links").select("*").eq("platform_id", platformId);
  if (error) raise(error);
  return ((data ?? []) as Record<string, unknown>[]).map(userFrom);
}

function userFrom(row: Record<string, unknown>): UserLink {
  return {
    id: String(row.id),
    platformId: String(row.platform_id),
    subject: String(row.subject),
    userId: row.user_id ? String(row.user_id) : null,
    orgId: String(row.org_id),
    cohortId: row.cohort_id ? String(row.cohort_id) : null,
    email: row.email ? String(row.email) : null,
    fullName: row.full_name ? String(row.full_name) : null,
    role: row.role === "facilitator" ? "facilitator" : "learner",
  };
}

async function saveGrade(admin: SupabaseClient, row: GradePass): Promise<void> {
  const { error } = await admin.from("lti_grade_passes").insert({
    launch_id: row.launchId,
    score_given: row.scoreGiven,
    score_maximum: row.scoreMaximum,
    activity_progress: row.activityProgress,
    grading_progress: row.gradingProgress,
    status: row.status,
    http_status: row.httpStatus,
  });
  if (error) raise(error);
}

function accountEmail(email: string | null, issuer: string, subject: string): string {
  const clean = email?.trim().toLowerCase() ?? "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) && clean.length <= 200) return clean;
  const hash = createHash("sha256").update(`${issuer}\n${subject}`).digest("hex").slice(0, 24);
  return `lti.${hash}@users.super-cube.me`;
}

async function ensureUser(admin: SupabaseClient, email: string, fullName: string | null): Promise<string | null> {
  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName || undefined, lti: true },
  });
  if (created.data.user?.id) return created.data.user.id;
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  return link.data.user?.id ?? null;
}

async function ensureCohort(
  admin: SupabaseClient,
  input: MemberInput,
): Promise<string | null> {
  if (!input.contextId) return null;
  const { data: existing, error } = await admin
    .from("lti_contexts")
    .select("cohort_id")
    .eq("platform_id", input.platform.id)
    .eq("context_id", input.contextId)
    .maybeSingle();
  if (error) {
    if (missing(error)) return null;
    raise(error);
  }
  const found = existing as { cohort_id?: string | null } | null;
  if (found?.cohort_id) return found.cohort_id;
  const title = (input.contextTitle || "LMS cohort").replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120);
  const name = title.length >= 2 ? title : "LMS cohort";
  const programme = input.programmeId === "kids" || input.programmeId === "adolescents" || input.programmeId === "adults"
    ? input.programmeId
    : null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());
  const created = await admin
    .from("cohorts")
    .insert({
      org_id: input.platform.orgId,
      name,
      programme_id: programme,
      start_on: today,
      timezone: "Africa/Johannesburg",
      status: "active",
    })
    .select("id")
    .single();
  if (created.error || !created.data) return null;
  const cohortId = String((created.data as { id: string }).id);
  await admin.from("lti_contexts").insert({
    platform_id: input.platform.id,
    context_id: input.contextId,
    context_title: name,
    cohort_id: cohortId,
    programme_id: programme,
  });
  return cohortId;
}

async function upsertOrgMember(admin: SupabaseClient, orgId: string, userId: string, role: UserLink["role"], name: string | null) {
  const { data } = await admin.from("org_members").select("role").eq("org_id", orgId).eq("user_id", userId).maybeSingle();
  const current = (data as { role?: string } | null)?.role;
  if (current === "admin" || current === "coach") return;
  const next = role === "facilitator" ? "coach" : "learner";
  if (!current) {
    await admin.from("org_members").insert({
      org_id: orgId,
      user_id: userId,
      role: next,
      display_name: name?.slice(0, 80) || null,
    });
    return;
  }
  if (current === "learner" && next === "coach") {
    await admin.from("org_members").update({ role: "coach", display_name: name?.slice(0, 80) || null }).eq("org_id", orgId).eq("user_id", userId);
  }
}

async function upsertCohortMember(admin: SupabaseClient, cohortId: string, userId: string, role: UserLink["role"], name: string | null) {
  const next = role === "facilitator" ? "facilitator" : "learner";
  const { data } = await admin.from("cohort_members").select("role").eq("cohort_id", cohortId).eq("user_id", userId).maybeSingle();
  const current = (data as { role?: string } | null)?.role;
  if (!current) {
    await admin.from("cohort_members").insert({
      cohort_id: cohortId,
      user_id: userId,
      role: next,
      display_name: name?.slice(0, 80) || null,
    });
    return;
  }
  if (current === "learner" && next === "facilitator") {
    await admin.from("cohort_members").update({ role: "facilitator" }).eq("cohort_id", cohortId).eq("user_id", userId);
  }
}

async function mapMember(admin: SupabaseClient, input: MemberInput): Promise<UserLink> {
  const email = accountEmail(input.email, input.platform.issuer, input.subject);
  let userId: string | null = null;
  try {
    userId = await ensureUser(admin, email, input.fullName);
  } catch {
    userId = null;
  }
  let cohortId: string | null = null;
  if (userId) {
    try {
      cohortId = await ensureCohort(admin, input);
      await upsertOrgMember(admin, input.platform.orgId, userId, input.role, input.fullName);
      if (cohortId) await upsertCohortMember(admin, cohortId, userId, input.role, input.fullName);
    } catch {
      cohortId = null;
    }
  }
  const { data: existing } = await admin
    .from("lti_user_links")
    .select("*")
    .eq("platform_id", input.platform.id)
    .eq("subject", input.subject)
    .maybeSingle();
  const previous = existing ? userFrom(existing as Record<string, unknown>) : null;
  const role = previous?.role === "facilitator" ? "facilitator" : input.role;
  const row = {
    id: previous?.id || randomUUID(),
    platform_id: input.platform.id,
    subject: input.subject,
    user_id: userId || previous?.userId || null,
    org_id: input.platform.orgId,
    cohort_id: cohortId || previous?.cohortId || null,
    email,
    full_name: input.fullName || previous?.fullName || null,
    role,
    updated_at: new Date().toISOString(),
  };
  const saved = await admin.from("lti_user_links").upsert(row, { onConflict: "platform_id,subject" }).select("*").single();
  if (saved.error || !saved.data) raise(saved.error);
  return userFrom(saved.data as Record<string, unknown>);
}
