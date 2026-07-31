import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${base || "COHORT"}${n}`.slice(0, 16);
}

/** Create organisation + make caller admin (authenticated). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 120);
    const kind = ["cohort", "school", "company", "network"].includes(body.kind)
      ? body.kind
      : "cohort";
    const contactEmail = String(body.contactEmail || "").trim() || null;
    const notes = String(body.notes || "").trim().slice(0, 500) || null;
    let code = String(body.code || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 16);

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    if (!code) code = slugCode(name);

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Prefer service role for insert (RLS may block org create for authenticated)
    const admin = createAdminClient();
    const client = admin || supabase;

    const { data: org, error } = await client
      .from("organisations")
      .insert({
        code,
        name,
        kind,
        owner_user_id: user.id,
        contact_email: contactEmail || user.email,
        notes,
        active: true,
      })
      .select("id, code, name, kind")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message.includes("schema cache") ||
            error.message.includes("does not exist")
              ? "Run SUPABASE_RUN_THIS_ORGS_COACH.sql in Supabase SQL Editor first."
              : error.message,
        },
        { status: 400 }
      );
    }

    await client.from("org_members").upsert(
      {
        org_id: org.id,
        user_id: user.id,
        role: "admin",
        display_name: user.email,
      },
      { onConflict: "org_id,user_id" }
    );

    return NextResponse.json({ ok: true, org });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Create failed" },
      { status: 500 }
    );
  }
}
