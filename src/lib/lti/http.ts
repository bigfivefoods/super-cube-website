/**
 * HTTP surface for the LTI tool. Next.js routes delegate here so the
 * mock-platform test can drive the same handlers over a plain server.
 */
import { clientIp, hashKey, memoryHit } from "@/lib/server/rate-limit";
import type { ActivityProgress, GradingProgress } from "@/lib/lti/claims";
import { asProtocolError, LtiProtocolError } from "@/lib/lti/errors";
import {
  beginLogin,
  completeLaunch,
  deepLinkResponse,
  postGrade,
  readEnterSession,
  syncNamesAndRoles,
  type LtiDeps,
} from "@/lib/lti/flow";
import { productionDeps } from "@/lib/lti/production";

const LAUNCH_COOKIE = "sc_lti";
const ACTIVE_COOKIE = "sc_lti_active";

export async function handleLti(request: Request, deps?: LtiDeps): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  try {
    const resolved = deps ?? (await productionDeps(request));
    if (request.method === "GET" && path.endsWith("/jwks")) return jwks(resolved);
    if ((request.method === "GET" || request.method === "POST") && path.endsWith("/login")) {
      limit(request, "lti-login");
      return await login(request, resolved);
    }
    if (request.method === "POST" && path.endsWith("/launch")) {
      limit(request, "lti-launch");
      return await launch(request, resolved);
    }
    if (request.method === "POST" && path.endsWith("/deep-link")) return await deep(request, resolved);
    if (request.method === "POST" && path.endsWith("/grade")) return await grade(request, resolved);
    if (request.method === "POST" && path.endsWith("/nrps")) return await nrps(request, resolved);
    if (request.method === "GET" && path.endsWith("/session")) return await session(request, resolved);
    return json({ error: "not_found" }, 404);
  } catch (error) {
    const err = asProtocolError(error);
    const browser = path.endsWith("/launch") || path.endsWith("/login") || path.endsWith("/deep-link");
    if (browser) return html(err.message, err.status);
    return json({ error: err.code, message: err.message }, err.status);
  }
}

function jwks(deps: LtiDeps): Response {
  if (!deps.keys.publicKey) return json({ error: "not_configured" }, 503);
  return json(deps.keys.jwks, 200, { "cache-control": "public, max-age=300" });
}

async function login(request: Request, deps: LtiDeps): Promise<Response> {
  const params = await readParams(request);
  const { location } = await beginLogin(params, deps);
  return redirect(location, 302);
}

async function launch(request: Request, deps: LtiDeps): Promise<Response> {
  const params = await readParams(request);
  const { location } = await completeLaunch(params, deps);
  return redirect(location, 303);
}

async function deep(request: Request, deps: LtiDeps): Promise<Response> {
  const { token, courses } = await readDeepBody(request);
  const htmlBody = await deepLinkResponse(token, courses, deps);
  return new Response(htmlBody, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}

async function grade(request: Request, deps: LtiDeps): Promise<Response> {
  const token = await launchToken(request);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const activity = String(body?.activityProgress || "");
  const grading = String(body?.gradingProgress || "");
  const result = await postGrade(
    token,
    {
      scoreGiven: Number(body?.scoreGiven),
      scoreMaximum: Number(body?.scoreMaximum),
      activityProgress: activity as ActivityProgress,
      gradingProgress: grading as GradingProgress,
    },
    deps,
  );
  return json({ ok: true, ...result });
}

async function nrps(request: Request, deps: LtiDeps): Promise<Response> {
  const token = await launchToken(request);
  const result = await syncNamesAndRoles(token, deps);
  return json({ ok: true, ...result });
}

async function session(request: Request, deps: LtiDeps): Promise<Response> {
  const token = launchTokenSync(request);
  const view = await readEnterSession(token, deps);
  const secure = new URL(request.url).protocol === "https:";
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const cookie of sessionCookies(token, secure)) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify(view), { status: 200, headers });
}

function sessionCookies(token: string, secure: boolean): string[] {
  const base = `Path=/; Max-Age=${12 * 60 * 60}; SameSite=Lax${secure ? "; Secure" : ""}`;
  return [`${LAUNCH_COOKIE}=${encodeURIComponent(token)}; HttpOnly; ${base}`, `${ACTIVE_COOKIE}=1; ${base}`];
}

async function launchToken(request: Request): Promise<string> {
  const header = request.headers.get("x-lti-launch")?.trim();
  if (header) return header;
  if (request.method === "POST") {
    const cloned = request.clone();
    const body = (await cloned.json().catch(() => null)) as { token?: string } | null;
    if (body?.token) return body.token;
  }
  return launchTokenSync(request);
}

function launchTokenSync(request: Request): string {
  const header = request.headers.get("x-lti-launch")?.trim();
  if (header) return header;
  const url = new URL(request.url);
  return url.searchParams.get("lt") || url.searchParams.get("dl") || readCookie(request.headers.get("cookie"), LAUNCH_COOKIE) || "";
}

async function readDeepBody(request: Request): Promise<{ token: string; courses: string[] }> {
  const type = request.headers.get("content-type") || "";
  const text = await request.text();
  if (type.includes("application/json")) {
    const body = JSON.parse(text) as { token?: string; dl?: string; courses?: unknown };
    const courses = Array.isArray(body.courses) ? body.courses.map(String) : [];
    return { token: String(body.token || body.dl || ""), courses };
  }
  const params = new URLSearchParams(text);
  return { token: params.get("dl") || params.get("token") || "", courses: params.getAll("course") };
}

async function readParams(request: Request): Promise<URLSearchParams> {
  if (request.method === "GET" || request.method === "HEAD") return new URL(request.url).searchParams;
  const type = request.headers.get("content-type") || "";
  const text = await request.text();
  if (type.includes("application/json")) {
    const body = JSON.parse(text) as Record<string, unknown>;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value != null) params.set(key, String(value));
    }
    return params;
  }
  return new URLSearchParams(text);
}

function limit(request: Request, bucket: string): void {
  const key = hashKey(bucket, `ip:${clientIp(request.headers)}`);
  const hit = memoryHit(bucket, key, { limit: 120, windowSec: 600 });
  if (!hit.allowed) {
    throw new LtiProtocolError(429, "rate", "Too many requests. Please wait a few minutes and try again.");
  }
}

function redirect(location: string, status: number): Response {
  return new Response(null, {
    status,
    headers: { location, "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

function json(body: unknown, status = 200, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...extra },
  });
}

function html(message: string, status: number): Response {
  const page = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Super-Cube®</title></head><body><h1>Super-Cube®</h1><p>${escapeHtml(message)}</p></body></html>`;
  return new Response(page, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
