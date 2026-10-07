import { expect, test } from "@playwright/test";
import { SHARE_TOKEN_RE, isLegacyShareToken, linkStatus, shareRows } from "@/lib/lms/share";
import { formatDateTimeZA, formatDateZA } from "@/lib/datetime";
import { hashShareToken, isMinorBand, newShareToken } from "@/lib/lms/server/share-links";

const legacy = Buffer.from(JSON.stringify({ v: 1, name: "Old Link", preOverall: 61, constructs: [] }), "utf8").toString("base64url");

test("new tokens are random, URL-safe and carry no data", () => {
  const a = newShareToken();
  const b = newShareToken();
  expect(a).toMatch(SHARE_TOKEN_RE);
  expect(a).not.toBe(b);
  expect(hashShareToken(a)).toMatch(/^[0-9a-f]{64}$/);
  expect(hashShareToken(a)).not.toContain(a);
  expect(isLegacyShareToken(a)).toBe(false);
});

test("old scores-in-the-URL tokens are recognised (and never parsed for display)", () => {
  expect(isLegacyShareToken(legacy)).toBe(true);
  expect(isLegacyShareToken("not-a-token")).toBe(false);
  expect(isLegacyShareToken(Buffer.from('{"v":2}').toString("base64url") + "xxxxxxxxxxxxxxxxxxxxxxxx")).toBe(false);
});

test("link status: active, expired, revoked", () => {
  const now = Date.parse("2026-10-07T10:00:00Z");
  expect(linkStatus({ expires_at: "2026-10-08T00:00:00Z", revoked_at: null }, now)).toBe("active");
  expect(linkStatus({ expires_at: "2026-10-07T09:59:59Z", revoked_at: null }, now)).toBe("expired");
  expect(linkStatus({ expires_at: "2026-10-08T00:00:00Z", revoked_at: "2026-10-07T09:00:00Z" }, now)).toBe("revoked");
});

test("rows show pre, post and change per face", () => {
  const s = (constructId: string, score: number) => ({ constructId, name: constructId, color: "#000", rawMean: 0, score, itemCount: 4 }) as never;
  const rows = shareRows([s("choices", 50)], [s("choices", 62.44)]);
  expect(rows).toHaveLength(6);
  expect(rows[0]).toMatchObject({ id: "choices", pre: 50, post: 62.4, delta: 12.4 });
  expect(rows[1]).toMatchObject({ pre: 0, post: null, delta: null });
  expect(isMinorBand("13-17")).toBe(true);
  expect(isMinorBand("under-13")).toBe(true);
  expect(isMinorBand("18-24")).toBe(false);
  expect(isMinorBand(null)).toBe(false);
});

test("SA dates: day month year, three-letter months, SAST", () => {
  expect(formatDateZA("2026-10-07T08:00:00Z")).toBe("7 Oct 2026");
  expect(formatDateZA("2026-09-28T08:00:00Z")).toBe("28 Sep 2026");
  expect(formatDateZA("2026-10-06T22:30:00Z")).toBe("7 Oct 2026"); // already the 7th in SAST
  expect(formatDateTimeZA("2026-10-07T07:43:00Z")).toBe("7 Oct 2026, 09:43");
  expect(formatDateZA(null)).toBe("—");
});
