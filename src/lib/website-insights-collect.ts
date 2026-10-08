/**
 * Accept a visit batch, enrich it, and forward it to the existing insights store.
 * The visitor IP is used only for the optional IPinfo lookup and is not written
 * onto the payload, the response, or a log line.
 */

import { clientIp, hit } from "@/lib/server/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  clientFamily,
  isPublicIp,
  networkFromIpinfo,
  planCollect,
  resolveIngestUrl,
  type NetworkFields,
} from "@/lib/website-insights";

const NO_STORE = { "cache-control": "no-store" };

function cookiePair(value: string, maxAge: number, secure: boolean): string {
  const parts = [
    `${VISITOR_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function empty(setCookie?: string): Response {
  const headers = new Headers(NO_STORE);
  if (setCookie) headers.set("set-cookie", setCookie);
  return new Response(null, { status: 204, headers });
}

async function lookupNetwork(ip: string, token: string, fetchImpl: typeof fetch): Promise<NetworkFields> {
  const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`;
  try {
    const res = await fetchImpl(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
    if (!res.ok) return {};
    const text = (await res.text()).slice(0, 20_000);
    return networkFromIpinfo(JSON.parse(text) as unknown);
  } catch {
    return {};
  }
}

async function signedInEmail(): Promise<string | undefined> {
  try {
    const supabase = await createClient();
    if (!supabase) return undefined;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? undefined;
  } catch {
    return undefined;
  }
}

export async function handleInsightsCollect(
  request: Request,
  deps?: {
    env?: Record<string, string | undefined>;
    now?: number;
    mint?: () => string;
    fetchImpl?: typeof fetch;
    sessionEmail?: () => Promise<string | undefined>;
    allow?: (visitorKey: string) => Promise<boolean>;
  },
): Promise<Response> {
  const env = deps?.env ?? process.env;
  const fetchImpl = deps?.fetchImpl ?? fetch;
  const secure = env.NODE_ENV === "production";
  const header = request.headers.get("cookie") ?? "";
  const cookie = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VISITOR_COOKIE}=`))
    ?.slice(VISITOR_COOKIE.length + 1);

  const body = (await request.text().catch(() => "")).slice(0, 16_000);
  const now = deps?.now ?? Date.now();
  const requestHost = (() => {
    try {
      return new URL(request.url).hostname;
    } catch {
      return "";
    }
  })();
  const ingestUrl = resolveIngestUrl(env.WEBSITE_INSIGHTS_INGEST_URL, requestHost);

  // Plan without network or email first so a dropped visit never looks them up.
  const family = clientFamily(request.headers.get("user-agent") ?? "");
  const planned = planCollect({
    headers: request.headers,
    cookie,
    body,
    now,
    mint: deps?.mint ?? (() => crypto.randomUUID()),
    family,
  });
  if (!planned.record) return empty(planned.clearCookie ? cookiePair("", 0, secure) : undefined);
  if (!ingestUrl) return empty();

  const ip = clientIp(request.headers);
  const allow =
    deps?.allow ??
    (async () =>
      (
        await hit(
          "insights-collect",
          [`vid:${planned.visitorId}`, isPublicIp(ip) ? `ip:${ip}` : ""].filter(Boolean),
        )
      ).allowed);
  if (!(await allow(`vid:${planned.visitorId}`))) return empty();

  const token = env.IPINFO_TOKEN?.trim();
  const [network, email] = await Promise.all([
    token && isPublicIp(ip) ? lookupNetwork(ip, token, fetchImpl) : Promise.resolve({}),
    deps?.sessionEmail ? deps.sessionEmail() : signedInEmail(),
  ]);

  const ready = planCollect({
    headers: request.headers,
    cookie,
    body,
    now,
    mint: () => planned.visitorId,
    family,
    network,
    email,
  });
  if (!ready.record) return empty();

  const secret = env.WEBSITE_INSIGHTS_INGEST_SECRET?.trim();
  try {
    const res = await fetchImpl(ingestUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
      headers: {
        "content-type": "text/plain",
        "x-insights-site": "super-cube",
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(ready.payload),
    });
    if (!res.ok) console.warn("[insights] forward", res.status);
  } catch {
    console.warn("[insights] forward failed");
  }

  return empty(cookiePair(ready.cookieValue, VISITOR_MAX_AGE, secure));
}
