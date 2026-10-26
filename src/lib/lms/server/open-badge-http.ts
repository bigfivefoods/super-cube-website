import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { bakeOpenBadgePng, extractOpenBadge, fallbackBadgePng } from "@/lib/lms/open-badges/bake";
import { achievementBySlug, issuerProfile } from "@/lib/lms/open-badges/document";
import { loadOb3Keys } from "@/lib/lms/open-badges/keys";
import { createAdminClient } from "@/lib/supabase/admin";
import { credentialJson, isCredentialId, lookupOpenBadge } from "@/lib/lms/server/open-badges";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept",
  "X-Robots-Tag": "noindex",
};

export function options() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function issuerResponse() {
  let keys: ReturnType<typeof loadOb3Keys> | null = null;
  try {
    keys = loadOb3Keys();
  } catch (error) {
    console.error("[ob3] issuer key rejected", error instanceof Error ? error.message : "error");
  }
  const profile = issuerProfile(
    undefined,
    keys?.verificationMethod ?? undefined,
    keys?.publicKeyMultibase ?? undefined,
  );
  return NextResponse.json(profile, {
    headers: { ...CORS, "Content-Type": "application/ld+json; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}

export function achievementResponse(slug: string) {
  const achievement = achievementBySlug(decodeURIComponent(slug));
  if (!achievement) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  return NextResponse.json(achievement, {
    headers: { ...CORS, "Content-Type": "application/ld+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

export async function credentialResponse(rawId: string, download: boolean) {
  const id = safeId(rawId);
  if (!id) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  const { check, credential } = await lookupOpenBadge(createAdminClient(), id);
  if (!credential || check.state === "none") {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  }
  if (check.state === "unavailable") {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: CORS });
  }
  const headers: Record<string, string> = {
    ...CORS,
    "Content-Type": "application/vc+ld+json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Credential-Status": check.state,
  };
  if (download) headers["Content-Disposition"] = `attachment; filename="super-cube-badge-${id}.jsonld"`;
  return new NextResponse(credentialJson(credential), { headers });
}

export async function statusResponse(rawId: string) {
  const id = safeId(rawId);
  if (!id) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  const { check } = await lookupOpenBadge(createAdminClient(), id);
  if (check.state === "none") return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  if (check.state === "unavailable") {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: CORS });
  }
  return NextResponse.json(
    {
      id: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.super-cube.me"}/credentials/${encodeURIComponent(id)}/status`,
      type: "CredentialStatus",
      revoked: check.state === "revoked",
      signature: check.state,
    },
    { headers: { ...CORS, "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" } },
  );
}

export async function imageResponse(rawId: string) {
  const id = safeId(rawId);
  if (!id) return new NextResponse("Not found", { status: 404, headers: CORS });
  const { check, credential } = await lookupOpenBadge(createAdminClient(), id);
  if (!credential || check.state === "none") return new NextResponse("Not found", { status: 404, headers: CORS });
  if (check.state === "unavailable") return new NextResponse("Unavailable", { status: 503, headers: CORS });
  const base = await readLogo();
  const baked = bakeOpenBadgePng(base, credentialJson(credential).trim());
  if (!extractOpenBadge(baked)) return new NextResponse("Unavailable", { status: 500, headers: CORS });
  return new NextResponse(new Uint8Array(baked), {
    headers: {
      ...CORS,
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="super-cube-badge-${id}.png"`,
      "X-Credential-Status": check.state,
    },
  });
}

function safeId(raw: string): string | null {
  let id = raw.trim();
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  return isCredentialId(id) ? id : null;
}

async function readLogo(): Promise<Buffer> {
  try {
    return await readFile(join(process.cwd(), "public/brand/logo-mark.png"));
  } catch {
    return fallbackBadgePng();
  }
}
