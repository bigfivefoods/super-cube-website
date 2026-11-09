/**
 * Addresses the tool advertises, and the checks on addresses a platform sends.
 * Public https only, plus a loopback http address so a local Moodle can be registered.
 */
import { isIP } from "node:net";

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);

export type ToolUrls = {
  loginUrl: string;
  launchUrl: string;
  jwksUrl: string;
  deepLinkUrl: string;
  enterUrl: string;
};

export function toolUrls(origin: string): ToolUrls {
  const base = origin.replace(/\/$/, "");
  return {
    loginUrl: `${base}/api/lti/login`,
    launchUrl: `${base}/api/lti/launch`,
    jwksUrl: `${base}/api/lti/jwks`,
    deepLinkUrl: `${base}/lti/deep-link`,
    enterUrl: `${base}/lti/enter`,
  };
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host && proto && /^https?$/.test(proto) && /^[A-Za-z0-9.:-]+$/.test(host)) {
    return `${proto}://${host}`;
  }
  return url.origin;
}

/** True when a browser may be sent to this address (https, or loopback http). */
export function isAllowedPlatformUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.username || url.password || url.hash) return false;
    if (isBlockedHost(url.hostname)) return false;
    if (url.protocol === "https:") return true;
    if (url.protocol === "http:" && LOOPBACK.has(url.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

/** Normalised address, or null when the platform must not be contacted there. */
export function normalisePlatformUrl(raw: string): string | null {
  const text = raw.trim();
  if (!isAllowedPlatformUrl(text)) return null;
  const url = new URL(text);
  url.hash = "";
  return url.href;
}

/** The login request's target link must be this tool's launch URL. */
export function asLaunchUrl(raw: string, origin: string): string | null {
  try {
    const url = new URL(raw);
    const expected = new URL(toolUrls(origin).launchUrl);
    if (url.origin !== expected.origin || url.pathname !== expected.pathname) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (LOOPBACK.has(host)) return false;
  if (!isIP(host)) return false;
  if (host === "169.254.169.254" || host.startsWith("169.254.")) return true;
  if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("127.")) return true;
  const second = Number(host.split(".")[1]);
  if (host.startsWith("172.") && second >= 16 && second <= 31) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return true;
  return false;
}
