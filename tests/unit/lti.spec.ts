/**
 * End-to-end LTI 1.3 against a mock platform: OIDC login, launch,
 * deep linking, names and roles, and a grade passback. No database.
 */
import { createServer, type Server } from "node:http";
import { generateKeyPairSync, type JsonWebKey as NodeJwk, type KeyObject } from "node:crypto";
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
import { PREFIXED_LOCALES } from "@/lib/i18n/config";
import { LMS_MESSAGES } from "@/lib/i18n/lms/catalogues";
import {
  AGS_SCORE_SCOPE,
  CLAIM_AGS,
  CLAIM_CONTENT_ITEMS,
  CLAIM_CONTEXT,
  CLAIM_CUSTOM,
  CLAIM_DEPLOYMENT_ID,
  CLAIM_DL_DATA,
  CLAIM_DL_SETTINGS,
  CLAIM_MESSAGE_TYPE,
  CLAIM_NRPS,
  CLAIM_RESOURCE_LINK,
  CLAIM_ROLES,
  CLAIM_TARGET_LINK_URI,
  CLAIM_VERSION,
  LTI_VERSION,
  MSG_DEEP,
  MSG_DEEP_RESPONSE,
  MSG_RESOURCE,
  NRPS_SCOPE,
} from "@/lib/lti/claims";
import { lti, LTI_STRINGS } from "@/lib/lti/copy";
import { clearJwksCache } from "@/lib/lti/flow";
import { handleLti } from "@/lib/lti/http";
import { keysFromPrivate, publicJwk } from "@/lib/lti/keys";
import { signJwt, verifyJwt } from "@/lib/lti/jwt";
import { registrationFrom } from "@/lib/lti/register";
import { createMemoryStore } from "@/lib/lti/store";
import { buildCsp, LTI_API_SOURCE, LTI_PAGE_SOURCE, SITE_SECURITY_SOURCE } from "@/lib/csp";

const CLIENT = "supercube-client";
const DEPLOY = "deploy-1";
const require = createRequire(process.cwd() + "/package.json");
const { getPathMatch } = require("next/dist/shared/lib/router/utils/path-match.js") as {
  getPathMatch: (path: string) => (pathname: string) => false | object;
};

test("mock platform: login, deep linking, launch, roster and grade passback", async () => {
  clearJwksCache();
  const platformKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const toolKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const store = createMemoryStore();
  const captured: { items: { custom?: { course_id?: string }; presentation?: { documentTarget?: string } }[]; data?: string; score?: Record<string, unknown>; tokenOk: boolean } = {
    items: [],
    tokenOk: false,
  };
  let mode: "deep" | "resource" = "deep";

  const platform = await serve(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/jwks") {
      return json({ keys: [publicJwk(platformKeys.publicKey, "platform-1")] });
    }
    if (url.pathname === "/auth") return authForm(url, platformKeys.privateKey, mode);
    if (url.pathname === "/return" && request.method === "POST") {
      const params = new URLSearchParams(await request.text());
      const token = params.get("JWT") || "";
      const jwks = (await fetch(new URL("/api/lti/jwks", box.tool).href).then((res) => res.json())) as { keys: NodeJwk[] };
      const { payload } = verifyJwt(token, jwks.keys);
      captured.items = (payload[CLAIM_CONTENT_ITEMS] as typeof captured.items) || [];
      captured.data = String(payload[CLAIM_DL_DATA] || "");
      expect(payload[CLAIM_MESSAGE_TYPE]).toBe(MSG_DEEP_RESPONSE);
      expect(payload[CLAIM_VERSION]).toBe(LTI_VERSION);
      expect(payload[CLAIM_DEPLOYMENT_ID]).toBe(DEPLOY);
      expect(payload.aud).toBe(box.platform);
      return new Response("ok");
    }
    if (url.pathname === "/token" && request.method === "POST") {
      const params = new URLSearchParams(await request.text());
      const assertion = params.get("client_assertion") || "";
      const jwks = (await fetch(new URL("/api/lti/jwks", box.tool).href).then((res) => res.json())) as { keys: NodeJwk[] };
      const { payload } = verifyJwt(assertion, jwks.keys);
      expect(payload.iss).toBe(CLIENT);
      expect(payload.sub).toBe(CLIENT);
      expect(payload.aud).toBe(new URL("/token", box.platform).href);
      expect(params.get("grant_type")).toBe("client_credentials");
      const scope = params.get("scope") || "";
      expect([AGS_SCORE_SCOPE, NRPS_SCOPE]).toContain(scope);
      captured.tokenOk = true;
      return json({ access_token: "platform-token", token_type: "Bearer", expires_in: 3600 });
    }
    if (url.pathname === "/lineitems/1/scores" && request.method === "POST") {
      expect(request.headers.get("authorization")).toBe("Bearer platform-token");
      captured.score = (await request.json()) as Record<string, unknown>;
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/nrps") {
      expect(request.headers.get("authorization")).toBe("Bearer platform-token");
      return json({
        id: new URL("/nrps", box.platform).href,
        members: [
          { status: "Active", user_id: "learner-1", name: "Ada Learner", email: "ada@example.com", roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"] },
          { status: "Active", user_id: "teacher-9", name: "Bo Instructor", email: "bo@example.com", roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"] },
          { status: "Inactive", user_id: "gone", name: "Inactive", roles: [] },
        ],
      });
    }
    return new Response("no", { status: 404 });
  });

  const box = { tool: "", platform: platform.url };
  const tool = await serve((request) =>
    handleLti(request, {
      store,
      keys: keysFromPrivate(toolKeys.privateKey, "supercube-lti-1"),
      now: () => Date.now(),
      fetch: globalThis.fetch.bind(globalThis),
      origin: box.tool,
    }),
  );
  box.tool = tool.url;

  const registered = await store.savePlatform({
    orgId: "org-1",
    orgCode: "ACME",
    name: "Company Moodle",
    issuer: platform.url,
    clientId: CLIENT,
    deploymentId: DEPLOY,
    authLoginUrl: new URL("/auth", platform.url).href,
    tokenUrl: new URL("/token", platform.url).href,
    jwksUrl: new URL("/jwks", platform.url).href,
  });

  try {
    mode = "deep";
    const deepLaunch = await oidc(tool.url, platform.url);
    expect(deepLaunch.message).toBe(MSG_DEEP);
    const picked = await fetch(new URL("/api/lti/deep-link", tool.url), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams([
        ["dl", deepLaunch.token],
        ["course", "adults"],
        ["course", "adults-choices"],
      ]),
    });
    expect(picked.status).toBe(200);
    const form = parseForm(await picked.text());
    const returned = await fetch(form.action, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(form.fields),
    });
    expect(returned.ok).toBe(true);
    expect(captured.data).toBe("moodle-data-1");
    expect(captured.items.map((item) => item.custom?.course_id).sort()).toEqual(["adults", "adults-choices"]);
    expect(captured.items.every((item) => item.presentation?.documentTarget === "window")).toBe(true);

    mode = "resource";
    const resource = await oidc(tool.url, platform.url);
    expect(resource.message).toBe(MSG_RESOURCE);
    const members = await store.listMembers(registered.id);
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({
      orgId: "org-1",
      subject: "learner-1",
      role: "learner",
      email: "ada@example.com",
      fullName: "Ada Learner",
    });
    expect(members[0].cohortId).toBeTruthy();

    const grade = await fetch(new URL("/api/lti/grade", tool.url), {
      method: "POST",
      headers: { "content-type": "application/json", "x-lti-launch": resource.token },
      body: JSON.stringify({ scoreGiven: 1, scoreMaximum: 1, activityProgress: "Completed", gradingProgress: "FullyGraded" }),
    });
    expect(grade.status).toBe(200);
    expect(await grade.json()).toMatchObject({ ok: true, status: "sent" });
    expect(captured.score).toMatchObject({
      userId: "learner-1",
      scoreGiven: 1,
      scoreMaximum: 1,
      activityProgress: "Completed",
      gradingProgress: "FullyGraded",
    });

    const roster = await fetch(new URL("/api/lti/nrps", tool.url), {
      method: "POST",
      headers: { "x-lti-launch": resource.token },
    });
    expect(roster.status).toBe(200);
    expect(await roster.json()).toMatchObject({ members: 2 });
    const linked = await store.listMembers(registered.id);
    expect(linked.map((row) => row.subject).sort()).toEqual(["learner-1", "teacher-9"]);
    expect(linked.find((row) => row.subject === "teacher-9")?.role).toBe("facilitator");
    expect(new Set(linked.map((row) => row.cohortId)).size).toBe(1);
    expect(linked.every((row) => row.orgId === "org-1")).toBe(true);
    expect(captured.tokenOk).toBe(true);

    const replay = await fetch(resource.launchUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: resource.rawBody,
      redirect: "manual",
    });
    expect(replay.status).toBe(400);
  } finally {
    await platform.close();
    await tool.close();
  }
});

test("a bad signature and an unknown platform are refused", async () => {
  clearJwksCache();
  const platformKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const toolKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const store = createMemoryStore();
  const platform = await serve(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/jwks") return json({ keys: [publicJwk(platformKeys.publicKey, "platform-1")] });
    if (url.pathname === "/auth") return authForm(url, other.privateKey, "resource");
    return new Response("no", { status: 404 });
  });
  const box = { tool: "" };
  const tool = await serve((request) =>
    handleLti(request, {
      store,
      keys: keysFromPrivate(toolKeys.privateKey),
      now: () => Date.now(),
      fetch: globalThis.fetch.bind(globalThis),
      origin: box.tool,
    }),
  );
  box.tool = tool.url;
  await store.savePlatform({
    orgId: "org-1",
    name: "Canvas",
    issuer: platform.url,
    clientId: CLIENT,
    deploymentId: DEPLOY,
    authLoginUrl: new URL("/auth", platform.url).href,
    tokenUrl: new URL("/token", platform.url).href,
    jwksUrl: new URL("/jwks", platform.url).href,
  });
  try {
    const started = await fetch(new URL("/api/lti/login", tool.url), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: loginBody(tool.url, platform.url),
      redirect: "manual",
    });
    const auth = await fetch(started.headers.get("location") || "", { redirect: "manual" });
    const form = parseForm(await auth.text());
    const launch = await fetch(form.action, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(form.fields),
      redirect: "manual",
    });
    expect(launch.status).toBe(401);

    const unknown = await fetch(new URL("/api/lti/login", tool.url), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: loginBody(tool.url, "https://unknown.example"),
      redirect: "manual",
    });
    expect(unknown.status).toBe(400);
  } finally {
    await platform.close();
    await tool.close();
  }
});

test("platform registration accepts https and refuses other hosts", () => {
  const orgId = "11111111-1111-4111-8111-111111111111";
  const good = registrationFrom(
    {
      name: "Company Moodle",
      issuer: "https://lms.example.com",
      clientId: "abc",
      deploymentId: "1",
      authLoginUrl: "https://lms.example.com/auth",
      tokenUrl: "https://lms.example.com/token",
      jwksUrl: "https://lms.example.com/jwks",
    },
    orgId,
  );
  expect(good.issuer).toBe("https://lms.example.com");
  expect(() =>
    registrationFrom(
      {
        name: "Bad",
        issuer: "http://evil.example/platform",
        clientId: "abc",
        deploymentId: "1",
        authLoginUrl: "http://evil.example/auth",
        tokenUrl: "https://lms.example.com/token",
        jwksUrl: "https://lms.example.com/jwks",
      },
      orgId,
    ),
  ).toThrow();
  expect(
    registrationFrom(
      {
        name: "Local Moodle",
        issuer: "http://localhost:8080",
        clientId: "abc",
        deploymentId: "1",
        authLoginUrl: "http://127.0.0.1:8080/auth",
        tokenUrl: "http://localhost:8080/token",
        jwksUrl: "http://localhost:8080/jwks",
      },
      orgId,
    ).authLoginUrl,
  ).toContain("127.0.0.1");
});

test("LTI copy is translated in every language and French uses vous", () => {
  expect(LTI_STRINGS.length).toBeGreaterThan(40);
  for (const locale of PREFIXED_LOCALES) {
    for (const english of LTI_STRINGS) {
      const value = LMS_MESSAGES[locale][english];
      expect(value, `${locale} ${english.slice(0, 48)}`).toBeTruthy();
      expect(value, locale).not.toBe(english);
      if (english.includes("Super-Cube®")) expect(value, locale).toContain("Super-Cube®");
      expect(value.toLowerCase(), locale).not.toContain("kwaden");
    }
  }
  expect(LMS_MESSAGES.fr[lti.giveB]).toMatch(/Vous/);
  expect(LMS_MESSAGES.fr[lti.issuerLine]).toContain("Super-Cube® by Big Five Group");
});

test("LTI screens can be framed and can post back; the rest of the site cannot", () => {
  const site = getPathMatch(SITE_SECURITY_SOURCE);
  const api = getPathMatch(LTI_API_SOURCE);
  const page = getPathMatch(LTI_PAGE_SOURCE);
  expect(Boolean(site("/"))).toBe(true);
  expect(Boolean(site("/learn"))).toBe(true);
  expect(Boolean(site("/pricing"))).toBe(true);
  expect(Boolean(site("/api/lti/deep-link"))).toBe(false);
  expect(Boolean(site("/lti/enter"))).toBe(false);
  expect(Boolean(api("/api/lti/deep-link"))).toBe(true);
  expect(Boolean(page("/lti/deep-link"))).toBe(true);
  expect(buildCsp({})).toContain("frame-ancestors 'self'");
  expect(buildCsp({})).toContain("form-action 'self' https://checkout.paystack.com");
  expect(buildCsp({}, "lti")).toContain("frame-ancestors *");
  expect(buildCsp({}, "lti")).toContain("https:");
  expect(buildCsp({}, "embed")).toContain("frame-ancestors *");
  expect(buildCsp({}, "embed")).not.toContain("frame-ancestors 'self'");
});

async function oidc(toolUrl: string, platformUrl: string) {
  const started = await fetch(new URL("/api/lti/login", toolUrl), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: loginBody(toolUrl, platformUrl),
    redirect: "manual",
  });
  expect(started.status).toBe(302);
  const location = started.headers.get("location") || "";
  expect(location.startsWith(new URL("/auth", platformUrl).href)).toBe(true);
  const auth = new URL(location);
  expect(auth.searchParams.get("response_type")).toBe("id_token");
  expect(auth.searchParams.get("response_mode")).toBe("form_post");
  expect(auth.searchParams.get("scope")).toBe("openid");
  expect(auth.searchParams.get("prompt")).toBe("none");
  expect(auth.searchParams.get("client_id")).toBe(CLIENT);
  expect(auth.searchParams.get("nonce")).toBeTruthy();
  const page = await fetch(location, { redirect: "manual" });
  const form = parseForm(await page.text());
  const rawBody = new URLSearchParams(form.fields);
  const launch = await fetch(form.action, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: rawBody,
    redirect: "manual",
  });
  expect(launch.status).toBe(303);
  const next = new URL(launch.headers.get("location") || "");
  const token = next.searchParams.get("dl") || next.searchParams.get("lt") || "";
  expect(token).toBeTruthy();
  return { token, message: next.pathname.includes("deep-link") ? MSG_DEEP : MSG_RESOURCE, launchUrl: form.action, rawBody };
}

function loginBody(toolUrl: string, issuer: string) {
  return new URLSearchParams({
    iss: issuer,
    login_hint: "learner-1",
    target_link_uri: new URL("/api/lti/launch", toolUrl).href,
    client_id: CLIENT,
    lti_deployment_id: DEPLOY,
    lti_message_hint: "hint",
  });
}

function authForm(url: URL, privateKey: KeyObject, mode: "deep" | "resource"): Response {
  const now = Math.floor(Date.now() / 1000);
  const redirect = url.searchParams.get("redirect_uri") || "";
  const nonce = url.searchParams.get("nonce") || "";
  const state = url.searchParams.get("state") || "";
  const clientId = url.searchParams.get("client_id") || CLIENT;
  const base: Record<string, unknown> = {
    iss: url.origin,
    aud: clientId,
    sub: "learner-1",
    nonce,
    iat: now,
    exp: now + 300,
    name: "Ada Learner",
    email: "ada@example.com",
    [CLAIM_MESSAGE_TYPE]: mode === "deep" ? MSG_DEEP : MSG_RESOURCE,
    [CLAIM_VERSION]: LTI_VERSION,
    [CLAIM_DEPLOYMENT_ID]: DEPLOY,
    [CLAIM_TARGET_LINK_URI]: redirect,
    [CLAIM_ROLES]: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
  };
  if (mode === "deep") {
    base[CLAIM_DL_SETTINGS] = {
      deep_link_return_url: new URL("/return", url.origin).href,
      accept_types: ["ltiResourceLink"],
      accept_presentation_document_targets: ["window"],
      accept_multiple: true,
      data: "moodle-data-1",
    };
  } else {
    base[CLAIM_RESOURCE_LINK] = { id: "rl-1" };
    base[CLAIM_CUSTOM] = { programme_id: "adults", course_id: "adults-choices" };
    base[CLAIM_CONTEXT] = { id: "course-42", title: "Leadership cohort" };
    base[CLAIM_AGS] = { scope: [AGS_SCORE_SCOPE], lineitem: new URL("/lineitems/1", url.origin).href };
    base[CLAIM_NRPS] = { context_memberships_url: new URL("/nrps", url.origin).href, service_versions: ["2.0"] };
  }
  const token = signJwt(base, privateKey, "platform-1");
  const html = `<!DOCTYPE html><html><body><form method="post" action="${redirect}"><input type="hidden" name="id_token" value="${token}"><input type="hidden" name="state" value="${state}"></form></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

function parseForm(html: string): { action: string; fields: Record<string, string> } {
  const action = decode((/action="([^"]*)"/.exec(html) || [])[1] || "");
  const fields: Record<string, string> = {};
  for (const match of html.matchAll(/name="([^"]+)" value="([^"]*)"/g)) fields[match[1]] = decode(match[2]);
  return { action, fields };
}

function decode(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function serve(handler: (request: Request) => Promise<Response>): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = createServer(async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const url = `http://127.0.0.1:${(server.address() as { port: number }).port}${req.url}`;
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value == null) continue;
        if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
        else headers.set(key, value);
      }
      const hasBody = req.method !== "GET" && req.method !== "HEAD";
      const request = new Request(url, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined });
      const response = await handler(request);
      res.statusCode = response.status;
      const cookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value);
      });
      if (cookies.length) res.setHeader("set-cookie", cookies);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.stack || error.message : "error");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done, reject) => server.close((err) => (err ? reject(err) : done()))),
      });
    });
  });
}
