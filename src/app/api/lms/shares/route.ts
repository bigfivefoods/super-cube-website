import { NextResponse } from "next/server";
import { requireUser } from "@/lib/lms/server/context";
import {
  MAX_ACTIVE_LINKS,
  MAX_LINKS_PER_HOUR,
  SHARE_LINK_COLUMNS,
  hashShareToken,
  isMinorLearner,
  minorMayShare,
  newShareToken,
  toSummary,
  type ShareLinkRow,
} from "@/lib/lms/server/share-links";
import { DEFAULT_SHARE_DAYS, SHARE_LINK_DAYS, shareLinkPath } from "@/lib/lms/share";
import { getProgramme } from "@/lib/programmes";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const noStore = { "Cache-Control": "no-store" };

/** The signed-in learner's share links (never the tokens). */
export async function GET() {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { data, error } = await ctx.admin
    .from("report_share_links")
    .select(SHARE_LINK_COLUMNS)
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Could not load your links" }, { status: 500 });
  const now = Date.now();
  return NextResponse.json({ links: ((data ?? []) as ShareLinkRow[]).map((r) => toSummary(r, now)) }, { headers: noStore });
}

/** Create an expiring, revocable link. The token is returned once and only its hash is stored. */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  let body: { programmeId?: string; days?: number; label?: string; showName?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const days = (SHARE_LINK_DAYS as readonly number[]).includes(Number(body.days)) ? Number(body.days) : DEFAULT_SHARE_DAYS;
  const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) || null : null;
  const uid = ctx.user.id;

  // Under-18s need a parent or guardian's consent (scope: progress_reports) to share
  const minor = await isMinorLearner(ctx.admin, uid);
  if (minor && !(await minorMayShare(ctx.admin, uid))) {
    return NextResponse.json(
      { error: "consent_required", message: "A parent or guardian needs to give consent before you can share your report." },
      { status: 403 },
    );
  }

  const { data: pre } = await ctx.admin
    .from("lms_attempts")
    .select("id")
    .eq("user_id", uid)
    .eq("programme_id", programme.id)
    .eq("phase", "pre")
    .maybeSingle();
  if (!pre) {
    return NextResponse.json(
      { error: "no_baseline", message: "Take your baseline while signed in, then you can share your growth." },
      { status: 409 },
    );
  }

  const now = Date.now();
  const { data: recent } = await ctx.admin
    .from("report_share_links")
    .select("created_at, expires_at, revoked_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (recent ?? []) as { created_at: string; expires_at: string; revoked_at: string | null }[];
  if (rows.filter((r) => now - Date.parse(r.created_at) < 3_600_000).length >= MAX_LINKS_PER_HOUR) {
    return NextResponse.json(
      { error: "rate_limited", message: "You’ve made a lot of links in the last hour. Try again a little later." },
      { status: 429 },
    );
  }
  if (rows.filter((r) => !r.revoked_at && Date.parse(r.expires_at) > now).length >= MAX_ACTIVE_LINKS) {
    return NextResponse.json(
      { error: "too_many", message: `You have ${MAX_ACTIVE_LINKS} active links. Turn one off first.` },
      { status: 409 },
    );
  }

  const token = newShareToken();
  const { data: created, error } = await ctx.admin
    .from("report_share_links")
    .insert({
      user_id: uid,
      programme_id: programme.id,
      token_hash: hashShareToken(token),
      label,
      // Under-18s: name hidden unless they choose to show it, and then first name only
      show_name: body.showName === undefined ? !minor : Boolean(body.showName),
      expires_at: new Date(now + days * DAY).toISOString(),
    })
    .select(SHARE_LINK_COLUMNS)
    .single();
  if (error || !created) return NextResponse.json({ error: "Could not create the link" }, { status: 500 });

  return NextResponse.json(
    { ok: true, path: shareLinkPath(token), link: toSummary(created as ShareLinkRow, now) },
    { status: 201, headers: noStore },
  );
}
