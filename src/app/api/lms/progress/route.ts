import { NextResponse } from "next/server";
import { getLesson } from "@/lib/lms/curriculum";
import { isSampleLesson } from "@/lib/lms/gates";
import { requireUser } from "@/lib/lms/server/context";
import { getServerEntitlement, isEntitled } from "@/lib/lms/server/entitlement";
import { courseId, getProgramme, type ProgrammeId } from "@/lib/programmes";
import type { ConstructId } from "@/lib/content";

/** Record a completed session on the server (used by the after-test gate). */
export async function POST(request: Request) {
  const ctx = await requireUser();
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const body = (await request.json().catch(() => ({}))) as {
    lessonId?: string;
    constructId?: string;
    programmeId?: string;
  };
  const programme = getProgramme(String(body.programmeId || ""));
  if (!programme) return NextResponse.json({ error: "Unknown programme" }, { status: 400 });
  const constructId = String(body.constructId || "") as ConstructId;
  const lessonId = String(body.lessonId || "");
  const found = getLesson(courseId(programme.id as ProgrammeId, constructId), lessonId);
  if (!found) return NextResponse.json({ error: "Unknown session" }, { status: 400 });

  if (!isSampleLesson(lessonId)) {
    const ent = await getServerEntitlement(ctx.admin, ctx.user.id);
    if (!isEntitled(ent)) {
      return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
  }

  const { error } = await ctx.admin.from("lms_lesson_completions").upsert(
    {
      user_id: ctx.user.id,
      lesson_id: lessonId,
      programme_id: programme.id,
      construct_id: constructId,
    },
    { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
