import { NextResponse } from "next/server";
import { buildLmsPackage, isLmsPackageFormat } from "@/lib/lms/lms-package";
import type { ProgrammeId } from "@/lib/programmes";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function programmeOf(raw: string | null): ProgrammeId {
  return raw === "kids" || raw === "adolescents" || raw === "adults" ? raw : "adults";
}

/** Course package for organisation admins. The zip holds the course, not learner data. */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign_in" }, { status: 401 });

  const [{ data: mems }, { data: owned }] = await Promise.all([
    supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "admin").limit(1),
    supabase.from("organisations").select("id").eq("owner_user_id", user.id).limit(1),
  ]);
  if ((mems ?? []).length === 0 && (owned ?? []).length === 0) {
    return NextResponse.json({ error: "not_admin" }, { status: 403 });
  }

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
