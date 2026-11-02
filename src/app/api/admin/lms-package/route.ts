import { NextResponse } from "next/server";
import { requireLmsAdmin } from "@/lib/admin/auth";
import { buildLmsPackage, isLmsPackageFormat } from "@/lib/lms/lms-package";
import type { ProgrammeId } from "@/lib/programmes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function programmeOf(raw: string | null): ProgrammeId {
  return raw === "kids" || raw === "adolescents" || raw === "adults" ? raw : "adults";
}

/** Site-admin download of a Super-Cube® SCORM or xAPI package. */
export async function GET(request: Request) {
  const ctx = await requireLmsAdmin();
  if (!ctx.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (!isLmsPackageFormat(format)) return NextResponse.json({ error: "bad_format" }, { status: 400 });
  const pack = buildLmsPackage(programmeOf(url.searchParams.get("programme")), format);
  return new NextResponse(new Uint8Array(pack.bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${pack.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
