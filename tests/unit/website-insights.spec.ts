import { expect, test } from "@playwright/test";
import { handleInsightsCollect } from "@/lib/website-insights-collect";
import {
  VISITOR_MAX_AGE,
  clickEvent,
  clientFamily,
  isPublicIp,
  networkFromIpinfo,
  planCollect,
  requestOptedOut,
  resolveIngestUrl,
  sanitizeClientEvent,
  screenBand,
  scrollBand,
} from "@/lib/website-insights";

const NOW = Date.UTC(2026, 9, 8);
const IP = "203.0.113.9";
const MINT = () => "11111111-1111-4111-8111-111111111111";

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
  expect(scrollBand(450, 1000, 400)).toBe(75);
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
  expect(JSON.stringify(event)).not.toContain(IP);
  expect(JSON.stringify(event)).not.toContain("person@example.com");
  expect(JSON.stringify(event)).not.toContain("email=a");
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
  expect(clickEvent({ pageUrl: page, href: null, download: false, button: true, label: "Book a pilot" })?.l).toBe("Book a pilot");
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
    email: "Learner@Example.com",
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
  expect(event?.email).toBe("learner@example.com");
  expect(first.payload.site).toBe("super-cube");
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

test("the ingest URL must be another https host", () => {
  expect(resolveIngestUrl(undefined, "www.super-cube.me")).toBeNull();
  expect(resolveIngestUrl("http://example.com/collect", "www.super-cube.me")).toBeNull();
  expect(resolveIngestUrl("https://www.super-cube.me/api/insights/collect", "www.super-cube.me")).toBeNull();
  expect(resolveIngestUrl("https://user:pass@bigfivegroup.africa/api/insights/collect", "www.super-cube.me")).toBeNull();
  expect(resolveIngestUrl("https://bigfivegroup.africa/api/insights/collect", "www.super-cube.me")).toBe(
    "https://bigfivegroup.africa/api/insights/collect",
  );
});

test("the collect route forwards a visit and sets the 180-day cookie", async () => {
  const calls: { url: string; body?: string; authorization?: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({
      url,
      body: typeof init?.body === "string" ? init.body : undefined,
      authorization: new Headers(init?.headers).get("authorization") ?? undefined,
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
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Mobile",
        "x-forwarded-for": IP,
        cookie: "other=1",
      },
      body: JSON.stringify({
        v: 1,
        e: [
          {
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
        ],
      }),
    }),
    {
      env: {
        NODE_ENV: "production",
        WEBSITE_INSIGHTS_INGEST_URL: "https://bigfivegroup.africa/api/insights/collect",
        WEBSITE_INSIGHTS_INGEST_SECRET: "test-secret",
        IPINFO_TOKEN: "token-not-committed",
      },
      now: NOW,
      mint: MINT,
      fetchImpl,
      sessionEmail: async () => "learner@example.com",
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
    "https://bigfivegroup.africa/api/insights/collect",
  ]);
  const forwarded = calls[1]?.body ?? "";
  const payload = JSON.parse(forwarded) as { site: string; host: string; e: Record<string, unknown>[] };
  expect(payload.site).toBe("super-cube");
  expect(payload.host).toBe("www.super-cube.me");
  expect(payload.e[0]).toMatchObject({
    k: "pageview",
    p: "/pricing",
    screen: "phone",
    device: "mobile",
    os: "iOS",
    city: "Pietermaritzburg",
    organisation: "Example Fibre",
    returning: false,
    email: "learner@example.com",
    utm_source: "linkedin",
    utm_content: "hero",
    utm_term: "leaders",
  });
  expect(forwarded).not.toContain(IP);
  expect(forwarded).not.toContain("spoof@example.com");
  expect(forwarded).not.toContain("-29.6006");
  expect(calls[1]?.authorization).toBe("Bearer test-secret");
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
        WEBSITE_INSIGHTS_INGEST_URL: "https://bigfivegroup.africa/api/insights/collect",
        IPINFO_TOKEN: "token",
      },
      fetchImpl: async () => {
        called = true;
        return new Response("no");
      },
      sessionEmail: async () => "learner@example.com",
      allow: async () => true,
    },
  );
  expect(called).toBe(false);
  expect(res.status).toBe(204);
  const setCookie = res.headers.get("set-cookie") ?? "";
  expect(setCookie).toContain("Max-Age=0");
  expect(setCookie).not.toContain("learner@example.com");
});

test("without the ingest URL nothing is forwarded and no cookie is set", async () => {
  let called = false;
  const res = await handleInsightsCollect(
    new Request("https://www.super-cube.me/api/insights/collect", {
      method: "POST",
      headers: { "x-forwarded-for": IP },
      body: JSON.stringify({ v: 1, e: [{ k: "pageview", p: "/pricing", ns: true }] }),
    }),
    {
      env: { IPINFO_TOKEN: "token" },
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
