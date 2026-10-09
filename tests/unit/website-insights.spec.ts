import { expect, test } from "@playwright/test";
import { handleInsightsCollect } from "@/lib/website-insights-collect";
import {
  INSIGHTS_COLLECT_URL,
  VISITOR_MAX_AGE,
  clickEvent,
  clientFamily,
  geoFromHeaders,
  isBotUa,
  isPublicIp,
  networkFromIpinfo,
  planCollect,
  requestOptedOut,
  sanitizeClientEvent,
  screenBand,
  scrollBand,
  isSamePageLink,
} from "@/lib/website-insights";

const EVENT_ID = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

const NOW = Date.UTC(2026, 9, 8);
const IP = "203.0.113.9";
const MINT = () => "11111111-1111-4111-8111-111111111111";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Mobile";

const ipinfo = {
  ip: IP,
  hostname: "visitor.example",
  city: "Pietermaritzburg",
  region: "KwaZulu-Natal",
  country: "ZA",
  loc: "-29.6006,30.3794",
  postal: "3201",
  timezone: "Africa/Johannesburg",
  org: "AS64500 Example Fibre",
  company: { name: "Example Fibre", type: "isp", industry: "Telecommunications", size: "1000-5000" },
  privacy: { vpn: false, proxy: false, tor: false, hosting: false },
};

function headers(extra?: Record<string, string>) {
  return new Headers(extra);
}

test("screen width is a band and scroll depth is a quartile", () => {
  expect(screenBand(390)).toBe("phone");
  expect(screenBand(800)).toBe("tablet");
  expect(screenBand(1280)).toBe("laptop");
  expect(screenBand(1920)).toBe("desktop");
  expect(screenBand(0)).toBeUndefined();
  expect(scrollBand(0, 1000, 400)).toBe(0);
  expect(scrollBand(450, 1000, 400)).toBe(70);
  // One screen down a long page (home) is no longer rounded to 0%.
  expect(scrollBand(800, 7366, 800)).toBe(10);
  expect(scrollBand(5950, 7366, 800)).toBe(100);
  expect(isSamePageLink("/", "https://www.super-cube.me/")).toBe(true);
  expect(isSamePageLink("https://www.super-cube.me/", "https://www.super-cube.me/")).toBe(true);
  expect(isSamePageLink("/#faq", "https://www.super-cube.me/")).toBe(false);
  expect(isSamePageLink("/about", "https://www.super-cube.me/")).toBe(false);
  expect(isSamePageLink("/", "https://www.super-cube.me/", "_blank")).toBe(false);
  expect(scrollBand(0, 400, 400)).toBe(100);
});

test("private links, raw IPs and client-supplied email are not recordable", () => {
  expect(sanitizeClientEvent({ k: "pageview", p: "https://www.super-cube.me/admin" })).toBeNull();
  expect(sanitizeClientEvent({ k: "pageview", p: "https://www.super-cube.me/share/report/abc123" })?.p).toBe(
    "/share/report/:token",
  );
  const event = sanitizeClientEvent({
    k: "pageview",
    p: "https://www.super-cube.me/pricing?utm_source=linkedin&utm_content=hero&utm_term=leaders&email=a@b.c",
    r: "https://www.linkedin.com/feed?token=secret",
    u: { s: "linkedin", m: "social", c: "book", n: "hero", t: "leaders" },
    lang: "en-ZA",
    screen: "laptop",
    ip: IP,
    email: "person@example.com",
  });
  expect(event?.p).toBe("/pricing");
  expect(event?.r).toBe("https://www.linkedin.com/feed");
  expect(event?.utm_source).toBe("linkedin");
  expect(event?.utm_content).toBe("hero");
  expect(event?.utm_term).toBe("leaders");
  expect(event?.id).toMatch(EVENT_ID);
  expect(JSON.stringify(event)).not.toContain(IP);
  expect(JSON.stringify(event)).not.toContain("person@example.com");
  expect(JSON.stringify(event)).not.toContain("email=a");
  expect("email" in (event ?? {})).toBe(false);
});

test("a button click is stored as click, and each event keeps a valid id", () => {
  const page = "https://www.super-cube.me/book";
  const supplied = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const click = sanitizeClientEvent({ k: "button", p: page, l: "Book a pilot", id: supplied });
  expect(click?.k).toBe("click");
  expect(click?.id).toBe(supplied);
  const minted = sanitizeClientEvent({ k: "pageview", p: "/pricing", id: "not-an-id" });
  expect(minted?.id).toMatch(EVENT_ID);
  expect(minted?.id).not.toBe("not-an-id");
});

test("engage needs half a second on the page or a scroll past the top", () => {
  expect(sanitizeClientEvent({ k: "engage", p: "/pricing", ms: 499, scroll: 0 })).toBeNull();
  expect(sanitizeClientEvent({ k: "engage", p: "/pricing", ms: 500 })?.ms).toBe(500);
  expect(sanitizeClientEvent({ k: "engage", p: "/pricing", scroll: 25 })?.scroll).toBe(25);
  expect(sanitizeClientEvent({ k: "engage", p: "/pricing", scroll: 30 })?.scroll).toBe(30);
  expect(sanitizeClientEvent({ k: "engage", p: "/pricing", scroll: 33 })?.scroll).toBeUndefined();
});

test("clicks keep a file name, an outbound site name, or a button label", () => {
  const page = "https://www.super-cube.me/book";
  expect(clickEvent({ pageUrl: page, href: "https://www.super-cube.me/super-cube-leadership-book.pdf", download: true, button: false, label: "" })?.l).toBe(
    "super-cube-leadership-book.pdf",
  );
  expect(clickEvent({ pageUrl: page, href: "https://www.un.org/sustainabledevelopment?q=1", download: false, button: false, label: "UN" })?.l).toBe(
    "un.org",
  );
  expect(clickEvent({ pageUrl: page, href: "https://203.0.113.9/x", download: false, button: false, label: "" })).toBeNull();
  const button = clickEvent({ pageUrl: page, href: null, download: false, button: true, label: "Book a pilot" });
  expect(button?.k).toBe("click");
  expect(button?.l).toBe("Book a pilot");
  expect(button?.id).toMatch(EVENT_ID);
  expect(clickEvent({ pageUrl: page, href: null, download: false, button: true, label: "a@b.c" })).toBeNull();
  expect(clickEvent({ pageUrl: "https://www.super-cube.me/admin", href: null, download: false, button: true, label: "Save" })).toBeNull();
});

test("Do Not Track and Global Privacy Control record nothing and clear the cookie", () => {
  expect(requestOptedOut(headers({ dnt: "1" }))).toBe(true);
  expect(requestOptedOut(headers({ "sec-gpc": "1" }))).toBe(true);
  const plan = planCollect({
    headers: headers({ dnt: "1" }),
    cookie: "11111111-1111-4111-8111-111111111111.2.19600.4",
    body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/pricing", ip: IP }] }),
    now: NOW,
    mint: MINT,
  });
  expect(plan.record).toBe(false);
  if (!plan.record) expect(plan.clearCookie).toBe(true);
});

test("a new visit gets a random id and a return visit keeps it", () => {
  const first = planCollect({
    headers: headers(),
    cookie: undefined,
    body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/pricing", ns: true }] }),
    now: NOW,
    mint: MINT,
    family: clientFamily("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"),
    network: networkFromIpinfo(ipinfo),
  });
  expect(first.record).toBe(true);
  if (!first.record) return;
  expect(first.visitorId).toBe(MINT());
  expect(first.cookieValue.startsWith(MINT())).toBe(true);
  const event = first.payload.e[0];
  expect(event?.returning).toBe(false);
  expect(event?.frequency).toBe(1);
  expect(event?.recency_days).toBeUndefined();
  expect(event?.device).toBe("desktop");
  expect(event?.browser).toBe("Chrome");
  expect(event?.os).toBe("Windows");
  expect(event?.city).toBe("Pietermaritzburg");
  expect(event?.region).toBe("KwaZulu-Natal");
  expect(event?.country).toBe("ZA");
  expect(event?.timezone).toBe("Africa/Johannesburg");
  expect(event?.organisation).toBe("Example Fibre");
  expect(event?.industry).toBe("Telecommunications");
  expect(event?.size).toBe("1000-5000");
  expect(event?.network).toBe("isp");
  expect(event?.id).toMatch(EVENT_ID);
  expect(event && "email" in event).toBe(false);
  expect(first.payload.v).toBe(1);
  expect(first.payload.site).toBe("super-cube.me");
  expect("host" in first.payload).toBe(false);
  const wire = JSON.stringify(first.payload);
  expect(wire).not.toContain(IP);
  expect(wire).not.toContain("-29.6006");
  expect(wire).not.toContain("3201");
  expect(wire).not.toContain("visitor.example");

  const again = planCollect({
    headers: headers(),
    cookie: first.cookieValue,
    body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/", ns: true }] }),
    now: NOW + 3 * 86_400_000,
    mint: () => "22222222-2222-4222-8222-222222222222",
  });
  expect(again.record).toBe(true);
  if (!again.record) return;
  expect(again.visitorId).toBe(MINT());
  expect(again.payload.e[0]?.returning).toBe(true);
  expect(again.payload.e[0]?.frequency).toBe(2);
  expect(again.payload.e[0]?.recency_days).toBe(3);
});

test("network lookup drops coordinates and treats a VPN as the network type", () => {
  expect(isPublicIp(IP)).toBe(true);
  expect(isPublicIp("10.1.1.1")).toBe(false);
  expect(isPublicIp("192.168.0.8")).toBe(false);
  expect(isPublicIp("::1")).toBe(false);
  const vpn = networkFromIpinfo({ ...ipinfo, privacy: { vpn: true, hosting: true } });
  expect(vpn.network).toBe("vpn");
  expect(JSON.stringify(vpn)).not.toContain(IP);
});

test("a batch keeps at most ten events and the canonical site", () => {
  const events = Array.from({ length: 12 }, (_, i) => ({ k: "pageview", p: `/p${i}` }));
  const plan = planCollect({
    headers: headers(),
    cookie: undefined,
    body: JSON.stringify({ v: 1, site: "bigfivegroup.africa", e: events }),
    now: NOW,
    mint: MINT,
  });
  expect(plan.record).toBe(true);
  if (!plan.record) return;
  expect(plan.payload.e).toHaveLength(10);
  expect(plan.payload.site).toBe("super-cube.me");
  expect(JSON.stringify(plan.payload)).not.toContain("bigfivegroup.africa");
  expect(plan.payload.e.every((event) => EVENT_ID.test(event.id))).toBe(true);
});

test("the collect route forwards a visit and sets the 180-day cookie", async () => {
  const calls: { url: string; body?: string; headers: Headers }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({
      url,
      body: typeof init?.body === "string" ? init.body : undefined,
      headers: new Headers(init?.headers),
    });
    if (url.includes("ipinfo.io")) {
      return new Response(JSON.stringify(ipinfo), { status: 200 });
    }
    return new Response(null, { status: 204 });
  };
  const res = await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        "user-agent": UA,
        "x-forwarded-for": IP,
        cookie: "other=1",
      },
      body: JSON.stringify({
        v: 1,
        site: "www.super-cube.me",
        e: [
          {
            id: "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB",
            k: "pageview",
            p: "/pricing",
            ns: true,
            lang: "en-ZA",
            screen: "phone",
            u: { s: "linkedin", m: "social", c: "book", n: "hero", t: "leaders" },
            landing: "/",
            pages: ["/", "/pricing"],
            ip: IP,
            email: "spoof@example.com",
          },
          { k: "button", p: "/pricing", l: "Book a pilot" },
        ],
      }),
    }),
    {
      env: {
        NODE_ENV: "production",
        WEBSITE_INSIGHTS_INGEST_URL: "https://evil.example/collect",
        WEBSITE_INSIGHTS_INGEST_SECRET: "old-secret",
        INSIGHTS_INGEST_KEY: "test-ingest-key",
        IPINFO_TOKEN: "token-not-committed",
      },
      now: NOW,
      mint: MINT,
      fetchImpl,
      allow: async () => true,
    },
  );
  expect(res.status).toBe(204);
  expect(await res.text()).toBe("");
  const setCookie = res.headers.get("set-cookie") ?? "";
  expect(setCookie).toContain("sc_visitor=");
  expect(setCookie).toContain(`Max-Age=${VISITOR_MAX_AGE}`);
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("Secure");
  expect(setCookie).not.toContain("learner@example.com");
  expect(setCookie).not.toContain(IP);

  expect(calls.map((c) => c.url.split("?")[0])).toEqual([
    `https://ipinfo.io/${encodeURIComponent(IP)}/json`,
    INSIGHTS_COLLECT_URL,
  ]);
  const forwarded = calls[1]?.body ?? "";
  const payload = JSON.parse(forwarded) as { v: number; site: string; host?: string; e: Record<string, unknown>[] };
  expect(payload.v).toBe(1);
  expect(payload.site).toBe("super-cube.me");
  expect(payload.host).toBeUndefined();
  expect(Object.keys(payload).sort()).toEqual(["e", "site", "v"]);
  expect(payload.e[0]).toMatchObject({
    // id and vid are the visitor cookie id; the browser's event id moves to eid.
    id: "11111111-1111-4111-8111-111111111111",
    vid: "11111111-1111-4111-8111-111111111111",
    eid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    k: "pageview",
    p: "/pricing",
    screen: "phone",
    device: "mobile",
    os: "iOS",
    city: "Pietermaritzburg",
    organisation: "Example Fibre",
    returning: false,
    utm_source: "linkedin",
    utm_content: "hero",
    utm_term: "leaders",
  });
  expect(payload.e[1]).toMatchObject({ k: "click", p: "/pricing", l: "Book a pilot" });
  expect(payload.e[1]?.id).toBe("11111111-1111-4111-8111-111111111111");
  expect(payload.e[1]?.eid).toMatch(EVENT_ID);
  expect(payload.e[1]?.eid).not.toBe(payload.e[1]?.id);
  expect(calls[1]?.headers.get("x-insights-ua")).toContain("iPhone");
  expect(forwarded).not.toContain(IP);
  expect(forwarded).not.toContain("spoof@example.com");
  expect(forwarded).not.toContain("learner@example.com");
  expect(forwarded).not.toContain("-29.6006");
  expect(forwarded).not.toContain("bigfivegroup.africa");
  expect(calls[1]?.headers.get("x-insights-key")).toBe("test-ingest-key");
  expect(calls[1]?.headers.get("authorization")).toBeNull();
  expect(calls.some((c) => c.url.includes("evil.example"))).toBe(false);
  expect(calls.some((c) => c.url.includes("token-not-committed") && c.url.includes("bigfivegroup"))).toBe(false);
});

test("Do Not Track does not look up, forward, or set a cookie", async () => {
  let called = false;
  const res = await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: { dnt: "1", "sec-gpc": "1", "x-forwarded-for": IP, cookie: "sc_visitor=11111111-1111-4111-8111-111111111111.2.19600.1" },
      body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/", ip: IP }] }),
    }),
    {
      env: {
        INSIGHTS_INGEST_KEY: "test-ingest-key",
        IPINFO_TOKEN: "token",
      },
      fetchImpl: async () => {
        called = true;
        return new Response("no");
      },
      allow: async () => true,
    },
  );
  expect(called).toBe(false);
  expect(res.status).toBe(204);
  const setCookie = res.headers.get("set-cookie") ?? "";
  expect(setCookie).toContain("Max-Age=0");
  expect(setCookie).not.toContain("learner@example.com");
});

test("without the ingest key nothing is forwarded and no cookie is set", async () => {
  let called = false;
  const res = await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: { "x-forwarded-for": IP },
      body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/pricing", ns: true }] }),
    }),
    {
      env: {
        IPINFO_TOKEN: "token",
        WEBSITE_INSIGHTS_INGEST_URL: "https://bigfivegroup.africa/api/insights/collect",
        WEBSITE_INSIGHTS_INGEST_SECRET: "old-secret",
      },
      fetchImpl: async () => {
        called = true;
        return new Response("no");
      },
      allow: async () => true,
    },
  );
  expect(called).toBe(false);
  expect(res.headers.get("set-cookie")).toBeNull();
});

test("every event in a batch carries the visitor id; page-speed readings carry none", () => {
  const plan = planCollect({
    headers: headers(),
    cookie: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.3.20000.2",
    body: JSON.stringify({
      v: 1,
      e: [
        { k: "pageview", p: "/book" },
        { k: "engage", p: "/book", ms: 4000, scroll: 50 },
        { k: "vital", p: "/book", l: "LCP", v: 1834.4444 },
        { k: "vital", p: "/book", l: "cls", v: 42 },
        { k: "vital", p: "/book", l: "fid", v: 12 },
      ],
    }),
    now: NOW,
    mint: MINT,
    family: { device: "mobile", browser: "Safari", os: "iOS" },
    network: { country: "ZA", city: "Durban", organisation: "Example Fibre" },
  });
  expect(plan.record).toBe(true);
  if (!plan.record) return;
  const [view, engage, vital] = plan.payload.e;
  expect(plan.payload.e).toHaveLength(3);
  expect(view?.id).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  expect(engage?.id).toBe(view?.id);
  expect(engage?.vid).toBe(view?.id);
  expect(view?.eid).toMatch(EVENT_ID);
  expect(engage?.eid).not.toBe(view?.eid);
  expect(view?.returning).toBe(true);
  expect(vital).toEqual({ id: vital?.eid, eid: vital?.eid, k: "vital", p: "/book", l: "lcp", v: 1834.444, device: "mobile" });
  expect(vital?.id).not.toBe(view?.id);
});

test("Vercel edge headers give coarse place; IPinfo adds the organisation only", async () => {
  expect(
    geoFromHeaders(
      new Headers({
        "x-vercel-ip-country": "za",
        "x-vercel-ip-country-region": "KZN",
        "x-vercel-ip-city": "Pietermaritzburg%20Central",
        "x-vercel-ip-timezone": "Africa/Johannesburg",
      }),
    ),
  ).toEqual({ country: "ZA", region: "KZN", city: "Pietermaritzburg Central", timezone: "Africa/Johannesburg" });
  expect(geoFromHeaders(new Headers({ "x-vercel-ip-city": "Durban" }))).toEqual({});

  const calls: { url: string; body?: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, body: typeof init?.body === "string" ? init.body : undefined });
    if (url.includes("ipinfo.io")) return new Response(JSON.stringify(ipinfo), { status: 200 });
    return new Response(null, { status: 204 });
  };
  await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: {
        "user-agent": UA,
        "x-forwarded-for": IP,
        "x-vercel-ip-country": "ZA",
        "x-vercel-ip-country-region": "GP",
        "x-vercel-ip-city": "Johannesburg",
      },
      body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/", ns: true }] }),
    }),
    { env: { INSIGHTS_INGEST_KEY: "k", IPINFO_TOKEN: "t" }, now: NOW, mint: MINT, fetchImpl, allow: async () => true },
  );
  const payload = JSON.parse(calls[calls.length - 1]?.body ?? "{}") as { e: Record<string, unknown>[] };
  expect(payload.e[0]).toMatchObject({ country: "ZA", region: "GP", city: "Johannesburg", organisation: "Example Fibre" });
  expect(JSON.stringify(payload)).not.toContain("Pietermaritzburg");
  expect(JSON.stringify(payload)).not.toContain(IP);
});

test("crawlers and scripts are dropped before any lookup or forward", async () => {
  expect(isBotUa("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
  expect(isBotUa("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0 Safari/537.36")).toBe(true);
  expect(isBotUa("curl/8.4.0")).toBe(true);
  expect(isBotUa("")).toBe(true);
  expect(isBotUa(UA)).toBe(false);
  let called = false;
  const res = await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: { "user-agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "x-forwarded-for": IP },
      body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/", ns: true }] }),
    }),
    {
      env: { INSIGHTS_INGEST_KEY: "k", IPINFO_TOKEN: "t" },
      fetchImpl: async () => {
        called = true;
        return new Response(null, { status: 204 });
      },
      allow: async () => true,
    },
  );
  expect(res.status).toBe(204);
  expect(called).toBe(false);
  expect(res.headers.get("set-cookie")).toBeNull();
});
