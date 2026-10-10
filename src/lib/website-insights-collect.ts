/**
 * Accept a visit batch, enrich it, and forward it to the Big Five Group
 * insights store. The visitor IP is used only for the optional IPinfo lookup
 * and is not written onto the payload, the response, or a log line.
 *
 * The collect URL is fixed. The ingest key is read from INSIGHTS_INGEST_KEY
 * and sent as x-insights-key. If that key is missing, the beacon is accepted
 * and dropped.
 *
 * Crawlers and scripts (by User-Agent) are dropped here, and the User-Agent is
 * also forwarded as x-insights-ua so the store can apply the same rule. Place
 * comes from Vercel's edge headers; IPinfo, when configured, adds only the
 * organisation fields (and place if Vercel gave none).
 */

import { clientIp, hit } from "@/lib/server/rate-limit";
import {
  INSIGHTS_COLLECT_URL,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  clientFamily,
  geoFromHeaders,
  isBotUa,
  isPublicIp,
  networkFromIpinfo,
  planCollect,
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

export async function handleInsightsCollect(
  request: Request,
  deps?: {
    env?: Record<string, string | undefined>;
    now?: number;
    mint?: () => string;
    fetchImpl?: typeof fetch;
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

  // Plan without a network lookup first so a dropped visit never looks one up.
  const ua = request.headers.get("user-agent") ?? "";
  const family = clientFamily(ua);
  const planned = planCollect({
    headers: request.headers,
    cookie,
    body,
    now,
    mint: deps?.mint ?? (() => crypto.randomUUID()),
    family,
  });
  if (!planned.record) return empty(planned.clearCookie ? cookiePair("", 0, secure) : undefined);
  if (isBotUa(ua)) return empty();

  const key = env.INSIGHTS_INGEST_KEY?.trim();
  if (!key) return empty();

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
  const looked = token && isPublicIp(ip) ? await lookupNetwork(ip, token, fetchImpl) : {};
  const geo = geoFromHeaders(request.headers);
  const network: NetworkFields = geo.country
    ? {
        ...geo,
        organisation: looked.organisation,
        industry: looked.industry,
        size: looked.size,
        network: looked.network,
      }
    : looked;
  for (const k of Object.keys(network) as (keyof NetworkFields)[]) if (!network[k]) delete network[k];

  const ready = planCollect({
    headers: request.headers,
    cookie,
    body,
    now,
    mint: () => planned.visitorId,
    family,
    network,
  });
  if (!ready.record) return empty();

  try {
    const res = await fetchImpl(INSIGHTS_COLLECT_URL, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
      headers: {
        "content-type": "application/json",
        "x-insights-key": key,
        "x-insights-ua": ua.slice(0, 500),
      },
      body: JSON.stringify(ready.payload),
    });
    if (!res.ok) console.warn("[insights] forward", res.status);
  } catch {
    console.warn("[insights] forward failed");
  }

  return empty(cookiePair(ready.cookieValue, VISITOR_MAX_AGE, secure));
}
