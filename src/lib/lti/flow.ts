/**
 * LTI 1.3 login, launch, deep linking, grade passback and names-and-roles.
 * Route handlers and the mock-platform test both call these functions.
 */
import { randomBytes, randomUUID, timingSafeEqual, type JsonWebKey } from "node:crypto";
import { courseFromClaims, findLtiCourse, launchPath, ltiCatalog, type LtiCourse } from "@/lib/lti/catalog";
import {
  ACTIVITY,
  AGS_LINEITEM_SCOPE,
  AGS_SCORE_SCOPE,
  CLAIM_AGS,
  CLAIM_CONTENT_ITEMS,
  CLAIM_CONTEXT,
  CLAIM_CUSTOM,
  CLAIM_DEPLOYMENT_ID,
  CLAIM_DL_DATA,
  CLAIM_DL_SETTINGS,
  CLAIM_LAUNCH_PRESENTATION,
  CLAIM_MESSAGE_TYPE,
  CLAIM_NRPS,
  CLAIM_RESOURCE_LINK,
  CLAIM_ROLES,
  CLAIM_TARGET_LINK_URI,
  CLAIM_VERSION,
  CLIENT_ASSERTION_TYPE,
  GRADING,
  LTI_VERSION,
  MSG_DEEP,
  MSG_DEEP_RESPONSE,
  MSG_RESOURCE,
  NRPS_MIME,
  NRPS_SCOPE,
  SCORE_MIME,
  type ActivityProgress,
  type GradingProgress,
} from "@/lib/lti/claims";
import { LtiProtocolError } from "@/lib/lti/errors";
import type { LtiKeys } from "@/lib/lti/keys";
import { signJwt, verifyJwt } from "@/lib/lti/jwt";
import type { LaunchRecord, LtiPlatform, LtiStore } from "@/lib/lti/store";
import { asLaunchUrl, isAllowedPlatformUrl, toolUrls } from "@/lib/lti/urls";

export type LtiDeps = {
  store: LtiStore;
  keys: LtiKeys;
  now: () => number;
  fetch: typeof fetch;
  origin: string;
};

export type ScoreInput = {
  scoreGiven: number;
  scoreMaximum: number;
  activityProgress: ActivityProgress;
  gradingProgress: GradingProgress;
};

const LOCALES = new Set(["en", "fr", "ar", "pt", "sw", "zu", "af"]);
const jwksCache = new Map<string, { keys: JsonWebKey[]; at: number }>();

export function clearJwksCache(): void {
  jwksCache.clear();
}

export async function beginLogin(params: URLSearchParams, deps: LtiDeps): Promise<{ location: string }> {
  const issuer = params.get("iss")?.trim() || "";
  const loginHint = params.get("login_hint")?.trim() || "";
  const targetRaw = params.get("target_link_uri")?.trim() || "";
  const clientId = params.get("client_id")?.trim() || null;
  const deploymentId = params.get("lti_deployment_id")?.trim() || null;
  const messageHint = params.get("lti_message_hint")?.trim() || "";
  if (!issuer || !loginHint || !targetRaw) {
    throw new LtiProtocolError(400, "login", "The platform did not send a complete sign-in request.");
  }
  const target = asLaunchUrl(targetRaw, deps.origin);
  if (!target) throw new LtiProtocolError(400, "target", "The launch address is not this Super-Cube® tool.");
  const platform = await deps.store.findForLogin({ issuer, clientId, deploymentId });
  if (platform === "ambiguous") {
    throw new LtiProtocolError(400, "deployment", "The platform must send a deployment id.");
  }
  if (!platform) throw new LtiProtocolError(400, "unknown_platform", "This platform is not registered with Super-Cube®.");
  if (!isAllowedPlatformUrl(platform.authLoginUrl)) {
    throw new LtiProtocolError(400, "auth", "The platform login address is not allowed.");
  }
  const state = secret();
  const nonce = secret();
  await deps.store.putState({
    state,
    nonce,
    platformId: platform.id,
    targetLinkUri: target,
    expiresAt: deps.now() + 10 * 60 * 1000,
  });
  const auth = new URL(platform.authLoginUrl);
  auth.searchParams.set("scope", "openid");
  auth.searchParams.set("response_type", "id_token");
  auth.searchParams.set("response_mode", "form_post");
  auth.searchParams.set("prompt", "none");
  auth.searchParams.set("client_id", platform.clientId);
  auth.searchParams.set("redirect_uri", target);
  auth.searchParams.set("login_hint", loginHint.slice(0, 500));
  auth.searchParams.set("state", state);
  auth.searchParams.set("nonce", nonce);
  if (messageHint && messageHint.length <= 2000) auth.searchParams.set("lti_message_hint", messageHint);
  return { location: auth.href };
}

export async function completeLaunch(
  params: URLSearchParams,
  deps: LtiDeps,
): Promise<{ location: string }> {
  const idToken = params.get("id_token")?.trim() || "";
  const state = params.get("state")?.trim() || "";
  if (!idToken || !state) throw new LtiProtocolError(400, "launch", "The platform did not return a launch token.");
  const pending = await deps.store.takeState(state, deps.now());
  if (!pending) throw new LtiProtocolError(400, "state", "This sign-in has expired. Start the launch again from your learning platform.");
  const platform = await deps.store.getPlatform(pending.platformId);
  if (!platform) throw new LtiProtocolError(400, "unknown_platform", "This platform is not registered with Super-Cube®.");
  const keys = await platformKeys(platform.jwksUrl, deps);
  const { payload } = verifyJwt(idToken, keys);
  assertFresh(payload, deps.now());
  if (payload.iss !== platform.issuer) throw new LtiProtocolError(401, "issuer", "The launch token was not issued by the registered platform.");
  if (!audMatches(payload, platform.clientId)) throw new LtiProtocolError(401, "audience", "The launch token was not issued for this tool.");
  const nonce = str(payload, "nonce");
  if (!nonce || !same(nonce, pending.nonce)) throw new LtiProtocolError(401, "nonce", "The launch token nonce does not match this sign-in.");
  const target = str(payload, CLAIM_TARGET_LINK_URI);
  if (target !== pending.targetLinkUri) throw new LtiProtocolError(401, "target", "The launch address changed during sign-in.");
  if (str(payload, CLAIM_VERSION) !== LTI_VERSION) throw new LtiProtocolError(400, "version", "Super-Cube® accepts LTI 1.3 only.");
  if (str(payload, CLAIM_DEPLOYMENT_ID) !== platform.deploymentId) {
    throw new LtiProtocolError(401, "deployment", "The deployment id does not match the registered platform.");
  }
  const messageType = str(payload, CLAIM_MESSAGE_TYPE);
  const subject = str(payload, "sub");
  if (!subject || subject.length > 255) throw new LtiProtocolError(400, "subject", "The launch did not name a user.");
  const person = personFrom(payload);
  const locale = localeOf(payload);
  const context = contextOf(payload);

  if (messageType === MSG_DEEP) {
    const settings = deepSettings(payload);
    const launch = blankLaunch(platform, {
      messageType,
      subject,
      resourceLinkId: null,
      programmeId: null,
      courseId: null,
      contextId: context.id,
      fullName: person.name,
      email: person.email,
      locale,
      agsLineitemUrl: null,
      agsScopes: [],
      nrpsUrl: null,
      returnUrl: settings.returnUrl,
      dlData: settings.data,
      acceptMultiple: settings.acceptMultiple,
    });
    await deps.store.saveLaunch(launch);
    const token = secret();
    await deps.store.putToken({ token, launchId: launch.id, kind: "deep", expiresAt: deps.now() + 15 * 60 * 1000 });
    return { location: `${toolUrls(deps.origin).deepLinkUrl}?dl=${encodeURIComponent(token)}` };
  }

  if (messageType !== MSG_RESOURCE) {
    throw new LtiProtocolError(400, "message", "Super-Cube® does not accept this LTI message.");
  }
  const resource = resourceOf(payload);
  if (!resource) throw new LtiProtocolError(400, "resource", "The launch did not include a resource link.");
  const custom = customOf(payload);
  const course = courseFromClaims(custom.programme_id || null, custom.course_id || null);
  const ags = agsOf(payload);
  const nrps = nrpsOf(payload);
  const link = await deps.store.mapMember({
    platform,
    subject,
    email: person.email,
    fullName: person.name,
    role: roleFrom(payload[CLAIM_ROLES]),
    contextId: context.id,
    contextTitle: context.title,
    programmeId: course.programmeId,
  });
  const launch = blankLaunch(platform, {
    messageType,
    subject,
    resourceLinkId: resource,
    programmeId: course.programmeId,
    courseId: course.id,
    contextId: context.id,
    fullName: person.name,
    email: person.email,
    locale,
    agsLineitemUrl: ags.lineitem,
    agsScopes: ags.scopes,
    nrpsUrl: nrps,
    returnUrl: null,
    dlData: null,
    acceptMultiple: true,
    userLinkId: link.id,
  });
  await deps.store.saveLaunch(launch);
  const token = secret();
  await deps.store.putToken({ token, launchId: launch.id, kind: "enter", expiresAt: deps.now() + 12 * 60 * 60 * 1000 });
  return { location: `${toolUrls(deps.origin).enterUrl}?lt=${encodeURIComponent(token)}` };
}

export type DeepOffer = {
  locale: string;
  acceptMultiple: boolean;
  courses: LtiCourse[];
};

export async function readDeepOffer(token: string, deps: LtiDeps): Promise<DeepOffer> {
  const launch = await deepLaunch(token, deps);
  return {
    locale: launch.locale && LOCALES.has(launch.locale) ? launch.locale : "en",
    acceptMultiple: launch.acceptMultiple,
    courses: ltiCatalog(),
  };
}

export async function deepLinkResponse(token: string, courseIds: string[], deps: LtiDeps): Promise<string> {
  const launch = await deepLaunch(token, deps);
  const platform = await deps.store.getPlatform(launch.platformId);
  if (!platform) throw new LtiProtocolError(400, "unknown_platform", "This platform is not registered with Super-Cube®.");
  const unique = [...new Set(courseIds.map((id) => id.trim()).filter(Boolean))];
  const courses = unique.map((id) => findLtiCourse(id)).filter((course): course is LtiCourse => Boolean(course));
  if (courses.length !== unique.length || courses.length === 0) {
    throw new LtiProtocolError(400, "courses", "Select at least one course.");
  }
  if (!launch.acceptMultiple && courses.length !== 1) {
    throw new LtiProtocolError(400, "courses", "The platform asked for a single item. Choose one course.");
  }
  if (!deps.keys.privateKey) {
    throw new LtiProtocolError(503, "no_key", "The tool signing key is not configured.");
  }
  const now = Math.floor(deps.now() / 1000);
  const items = courses.map((course) => ({
    type: "ltiResourceLink",
    title: course.title,
    text: course.description,
    url: toolUrls(deps.origin).launchUrl,
    presentation: { documentTarget: "window" },
    window: { targetName: "_blank" },
    custom: { programme_id: course.programmeId, course_id: course.id },
  }));
  const payload: Record<string, unknown> = {
    iss: platform.clientId,
    aud: platform.issuer,
    iat: now,
    exp: now + 300,
    nonce: secret(),
    [CLAIM_MESSAGE_TYPE]: MSG_DEEP_RESPONSE,
    [CLAIM_VERSION]: LTI_VERSION,
    [CLAIM_DEPLOYMENT_ID]: launch.deploymentId,
    [CLAIM_CONTENT_ITEMS]: items,
  };
  if (launch.dlData) payload[CLAIM_DL_DATA] = launch.dlData;
  const jwt = signJwt(payload, deps.keys.privateKey, deps.keys.kid);
  const back = launch.returnUrl || "";
  if (!isAllowedPlatformUrl(back)) throw new LtiProtocolError(400, "return", "The platform return address is not allowed.");
  return autoPost(back, jwt);
}

export type EnterSession = {
  programmeId: string;
  courseId: string;
  orgCode: string | null;
  fullName: string | null;
  email: string | null;
  locale: string;
  nextPath: string;
};

export async function readEnterSession(token: string, deps: LtiDeps): Promise<EnterSession> {
  const row = await deps.store.getToken(token, deps.now());
  if (!row || row.kind !== "enter") {
    throw new LtiProtocolError(400, "session", "This launch has expired. Start again from your learning platform.");
  }
  const found = await deps.store.getLaunch(row.launchId);
  if (!found) throw new LtiProtocolError(400, "session", "This launch has expired. Start again from your learning platform.");
  const course = courseFromClaims(found.launch.programmeId, found.launch.courseId);
  return {
    programmeId: course.programmeId,
    courseId: course.id,
    orgCode: found.platform.orgCode,
    fullName: found.launch.fullName,
    email: found.launch.email,
    locale: found.launch.locale && LOCALES.has(found.launch.locale) ? found.launch.locale : "en",
    nextPath: launchPath(course),
  };
}

export async function postGrade(
  token: string,
  score: ScoreInput,
  deps: LtiDeps,
): Promise<{ status: "sent" | "failed" | "skipped"; httpStatus: number | null }> {
  if (!validScore(score)) throw new LtiProtocolError(400, "score", "The score is not a completion the platform can store.");
  const row = await deps.store.getToken(token, deps.now());
  if (!row || row.kind !== "enter") throw new LtiProtocolError(401, "session", "Sign in from your learning platform again.");
  const found = await deps.store.getLaunch(row.launchId);
  if (!found) throw new LtiProtocolError(401, "session", "Sign in from your learning platform again.");
  const { launch, platform } = found;
  if (!launch.agsLineitemUrl) {
    await deps.store.saveGrade({ ...score, launchId: launch.id, status: "skipped", httpStatus: null });
    return { status: "skipped", httpStatus: null };
  }
  const scope = agsScope(launch.agsScopes);
  try {
    const access = await serviceToken(platform, scope, deps);
    const endpoint = scoresUrl(launch.agsLineitemUrl);
    const res = await deps.fetch(endpoint, {
      method: "POST",
      redirect: "manual",
      headers: {
        authorization: `Bearer ${access}`,
        "content-type": SCORE_MIME,
        accept: "application/json",
      },
      body: JSON.stringify({
        userId: launch.subject,
        scoreGiven: score.scoreGiven,
        scoreMaximum: score.scoreMaximum,
        activityProgress: score.activityProgress,
        gradingProgress: score.gradingProgress,
        timestamp: new Date(deps.now()).toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    const status = res.ok ? "sent" : "failed";
    await deps.store.saveGrade({ ...score, launchId: launch.id, status, httpStatus: res.status });
    if (!res.ok) throw new LtiProtocolError(502, "grade", "The platform did not accept the score.");
    return { status, httpStatus: res.status };
  } catch (error) {
    if (!(error instanceof LtiProtocolError && error.code === "grade")) {
      await deps.store.saveGrade({ ...score, launchId: launch.id, status: "failed", httpStatus: null });
    }
    throw error;
  }
}

export async function syncNamesAndRoles(token: string, deps: LtiDeps): Promise<{ members: number }> {
  const row = await deps.store.getToken(token, deps.now());
  if (!row || row.kind !== "enter") throw new LtiProtocolError(401, "session", "Sign in from your learning platform again.");
  const found = await deps.store.getLaunch(row.launchId);
  if (!found?.launch.nrpsUrl) throw new LtiProtocolError(400, "nrps", "This launch did not include names and roles.");
  const access = await serviceToken(found.platform, NRPS_SCOPE, deps);
  const members = await membershipPages(found.launch.nrpsUrl, access, deps);
  let count = 0;
  for (const member of members) {
    if (member.status && member.status !== "Active") continue;
    if (!member.userId) continue;
    await deps.store.mapMember({
      platform: found.platform,
      subject: member.userId,
      email: member.email,
      fullName: member.name,
      role: roleFrom(member.roles),
      contextId: found.launch.contextId,
      contextTitle: null,
      programmeId: found.launch.programmeId,
    });
    count += 1;
  }
  return { members: count };
}

async function deepLaunch(token: string, deps: LtiDeps): Promise<LaunchRecord> {
  const row = await deps.store.getToken(token, deps.now());
  if (!row || row.kind !== "deep") {
    throw new LtiProtocolError(400, "deep", "This link has expired. Start content selection again from your learning platform.");
  }
  const found = await deps.store.getLaunch(row.launchId);
  if (!found) {
    throw new LtiProtocolError(400, "deep", "This link has expired. Start content selection again from your learning platform.");
  }
  return found.launch;
}

async function serviceToken(platform: LtiPlatform, scope: string, deps: LtiDeps): Promise<string> {
  if (!deps.keys.privateKey) throw new LtiProtocolError(503, "no_key", "The tool signing key is not configured.");
  if (!isAllowedPlatformUrl(platform.tokenUrl)) throw new LtiProtocolError(400, "token", "The platform token address is not allowed.");
  const now = Math.floor(deps.now() / 1000);
  const assertion = signJwt(
    { iss: platform.clientId, sub: platform.clientId, aud: platform.tokenUrl, iat: now, exp: now + 300, jti: randomUUID() },
    deps.keys.privateKey,
    deps.keys.kid,
  );
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_assertion_type: CLIENT_ASSERTION_TYPE,
    client_assertion: assertion,
    scope,
  });
  const res = await deps.fetch(platform.tokenUrl, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (res.status >= 300) throw new LtiProtocolError(502, "token", "The platform did not issue a service token.");
  const json = (await res.json().catch(() => null)) as { access_token?: string } | null;
  if (!json?.access_token) throw new LtiProtocolError(502, "token", "The platform did not issue a service token.");
  return json.access_token;
}

type Member = { userId: string | null; name: string | null; email: string | null; roles: unknown; status: string | null };

async function membershipPages(start: string, access: string, deps: LtiDeps): Promise<Member[]> {
  const out: Member[] = [];
  let url: string | null = start;
  const origin = new URL(start).origin;
  for (let page = 0; page < 5 && url; page += 1) {
    if (!isAllowedPlatformUrl(url) || new URL(url).origin !== origin) break;
    const res = await deps.fetch(url, {
      redirect: "manual",
      headers: { authorization: `Bearer ${access}`, accept: NRPS_MIME },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new LtiProtocolError(502, "nrps", "The platform did not return the roster.");
    const body = (await res.json().catch(() => null)) as { members?: Record<string, unknown>[] } | null;
    for (const member of body?.members ?? []) {
      out.push({
        userId: typeof member.user_id === "string" ? member.user_id : null,
        name: typeof member.name === "string" ? clean(member.name) : null,
        email: typeof member.email === "string" ? member.email : null,
        roles: member.roles,
        status: typeof member.status === "string" ? member.status : null,
      });
    }
    url = nextLink(res.headers.get("link"));
  }
  return out;
}

function nextLink(header: string | null): string | null {
  if (!header) return null;
  const match = /<([^>]+)>;\s*rel="next"/.exec(header);
  return match?.[1] ?? null;
}

async function platformKeys(url: string, deps: LtiDeps): Promise<JsonWebKey[]> {
  const now = deps.now();
  const hit = jwksCache.get(url);
  if (hit && now - hit.at < 10 * 60 * 1000) return hit.keys;
  if (!isAllowedPlatformUrl(url)) throw new LtiProtocolError(400, "jwks", "The platform key set address is not allowed.");
  const res = await deps.fetch(url, {
    redirect: "manual",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status >= 300) throw new LtiProtocolError(502, "jwks", "The platform key set could not be read.");
  const body = (await res.json().catch(() => null)) as { keys?: JsonWebKey[] } | null;
  const keys = (body?.keys ?? []).filter((key) => key && key.kty === "RSA" && (key.use === undefined || key.use === "sig"));
  if (keys.length === 0) throw new LtiProtocolError(502, "jwks", "The platform key set has no RSA keys.");
  jwksCache.set(url, { keys, at: now });
  return keys;
}

function blankLaunch(platform: LtiPlatform, extra: Omit<LaunchRecord, "id" | "platformId" | "deploymentId" | "userLinkId"> & { userLinkId?: string | null }): LaunchRecord {
  return {
    id: randomUUID(),
    platformId: platform.id,
    deploymentId: platform.deploymentId,
    userLinkId: extra.userLinkId ?? null,
    messageType: extra.messageType,
    resourceLinkId: extra.resourceLinkId,
    programmeId: extra.programmeId,
    courseId: extra.courseId,
    contextId: extra.contextId,
    subject: extra.subject,
    agsLineitemUrl: extra.agsLineitemUrl,
    agsScopes: extra.agsScopes,
    nrpsUrl: extra.nrpsUrl,
    returnUrl: extra.returnUrl,
    dlData: extra.dlData,
    acceptMultiple: extra.acceptMultiple,
    locale: extra.locale,
    fullName: extra.fullName,
    email: extra.email,
  };
}

function agsScope(scopes: string[]): string {
  if (scopes.length === 0 || scopes.includes(AGS_SCORE_SCOPE)) return AGS_SCORE_SCOPE;
  if (scopes.includes(AGS_LINEITEM_SCOPE)) return AGS_LINEITEM_SCOPE;
  throw new LtiProtocolError(400, "ags_scope", "The platform did not grant the score service.");
}

function scoresUrl(lineitem: string): string {
  const bare = lineitem.replace(/\/$/, "");
  return bare.endsWith("/scores") ? bare : `${bare}/scores`;
}

function validScore(score: ScoreInput): boolean {
  return (
    Number.isFinite(score.scoreGiven) &&
    Number.isFinite(score.scoreMaximum) &&
    score.scoreMaximum > 0 &&
    score.scoreGiven >= 0 &&
    score.scoreGiven <= score.scoreMaximum &&
    (ACTIVITY as readonly string[]).includes(score.activityProgress) &&
    (GRADING as readonly string[]).includes(score.gradingProgress)
  );
}

function assertFresh(payload: Record<string, unknown>, nowMs: number): void {
  const now = Math.floor(nowMs / 1000);
  const exp = Number(payload.exp);
  const iat = Number(payload.iat);
  if (!Number.isFinite(exp) || exp < now - 60) throw new LtiProtocolError(401, "expired", "The launch token has expired.");
  if (!Number.isFinite(iat) || iat > now + 60 || iat < now - 600) {
    throw new LtiProtocolError(401, "stale", "The launch token is outside the allowed clock window.");
  }
}

function audMatches(payload: Record<string, unknown>, clientId: string): boolean {
  const aud = payload.aud;
  const list = Array.isArray(aud) ? aud.map(String) : typeof aud === "string" ? [aud] : [];
  if (!list.includes(clientId)) return false;
  if (list.length > 1 && payload.azp !== clientId) return false;
  return true;
}

function roleFrom(roles: unknown): "learner" | "facilitator" {
  const list = Array.isArray(roles) ? roles.map(String) : [];
  const staff = list.some((role) => /Instructor|Administrator|Faculty|TeachingAssistant|ContentDeveloper|Mentor/i.test(role));
  return staff ? "facilitator" : "learner";
}

function personFrom(payload: Record<string, unknown>): { name: string | null; email: string | null } {
  const email = str(payload, "email");
  const named = str(payload, "name");
  const given = str(payload, "given_name") || "";
  const family = str(payload, "family_name") || "";
  const combined = `${given} ${family}`.trim();
  return { name: clean(named || combined || ""), email };
}

function localeOf(payload: Record<string, unknown>): string | null {
  const pres = obj(payload[CLAIM_LAUNCH_PRESENTATION]);
  const raw = pres && typeof pres.locale === "string" ? pres.locale : "";
  const primary = raw.toLowerCase().split("-")[0];
  return LOCALES.has(primary) ? primary : null;
}

function contextOf(payload: Record<string, unknown>): { id: string | null; title: string | null } {
  const ctx = obj(payload[CLAIM_CONTEXT]);
  if (!ctx) return { id: null, title: null };
  const id = typeof ctx.id === "string" ? ctx.id.slice(0, 255) : null;
  const title = typeof ctx.title === "string" ? ctx.title : typeof ctx.label === "string" ? ctx.label : null;
  return { id, title: title ? clean(title) : null };
}

function resourceOf(payload: Record<string, unknown>): string | null {
  const link = obj(payload[CLAIM_RESOURCE_LINK]);
  const id = link && typeof link.id === "string" ? link.id : "";
  return id ? id.slice(0, 255) : null;
}

function customOf(payload: Record<string, unknown>): Record<string, string> {
  const raw = obj(payload[CLAIM_CUSTOM]);
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") out[key.toLowerCase()] = value;
  }
  return out;
}

function agsOf(payload: Record<string, unknown>): { lineitem: string | null; scopes: string[] } {
  const raw = obj(payload[CLAIM_AGS]);
  if (!raw) return { lineitem: null, scopes: [] };
  const lineitem = typeof raw.lineitem === "string" && isAllowedPlatformUrl(raw.lineitem) ? raw.lineitem : null;
  const scopes = Array.isArray(raw.scope) ? raw.scope.map(String) : [];
  return { lineitem, scopes };
}

function nrpsOf(payload: Record<string, unknown>): string | null {
  const raw = obj(payload[CLAIM_NRPS]);
  const url = raw && typeof raw.context_memberships_url === "string" ? raw.context_memberships_url : "";
  return url && isAllowedPlatformUrl(url) ? url : null;
}

function deepSettings(payload: Record<string, unknown>): { returnUrl: string; data: string | null; acceptMultiple: boolean; acceptTypes: string[] } {
  const raw = obj(payload[CLAIM_DL_SETTINGS]);
  const returnUrl = raw && typeof raw.deep_link_return_url === "string" ? raw.deep_link_return_url : "";
  if (!isAllowedPlatformUrl(returnUrl)) {
    throw new LtiProtocolError(400, "return", "The platform did not send a return address for content selection.");
  }
  const acceptTypes = Array.isArray(raw?.accept_types) ? raw.accept_types.map(String) : [];
  if (acceptTypes.length > 0 && !acceptTypes.some((type) => /^(ltiResourceLink|link|\*)$/i.test(type))) {
    throw new LtiProtocolError(400, "accept", "The platform does not accept a course link.");
  }
  const data = raw && typeof raw.data === "string" ? raw.data.slice(0, 8000) : null;
  const acceptMultiple = raw?.accept_multiple === false ? false : true;
  return { returnUrl, data, acceptMultiple, acceptTypes };
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function autoPost(action: string, jwt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Super-Cube®</title></head>
<body>
<p>Returning you to your learning platform…</p>
<form id="lti-return" method="post" action="${esc(action)}">
<input type="hidden" name="JWT" value="${esc(jwt)}">
<button type="submit">Continue</button>
</form>
<script>document.getElementById("lti-return").submit();</script>
</body>
</html>`;
}

function str(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function obj(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function clean(value: string): string | null {
  const text = value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120);
  return text || null;
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function secret(): string {
  return randomBytes(32).toString("base64url");
}
