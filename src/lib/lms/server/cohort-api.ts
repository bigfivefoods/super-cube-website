/**
 * Cohort reads and writes go through the signed-in user's Supabase client,
 * so Postgres RLS is what allows or refuses them. The service role is not used.
 */
import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cleanJoinUrl, cleanText, expandSchedule, zonedToUtc, type PlannedSession } from "@/lib/lms/cohorts";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Viewer = "learner" | "facilitator" | "admin";

type Gate =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: NextResponse };

export async function gate(): Promise<Gate> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, response: json({ error: "unavailable" }, 503) };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: json({ error: "sign_in" }, 401) };
  return { ok: true, supabase, user };
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

/** Map a Postgres rejection to a response that does not leak SQL. */
export function dbError(error: { message?: string; code?: string }): NextResponse {
  const message = error.message ?? "";
  if (error.code === "42501" || /row-level security|permission denied/i.test(message)) {
    return json({ error: "forbidden" }, 403);
  }
  if (error.code === "PGRST205" || error.code === "42P01" || /schema cache|does not exist/i.test(message)) {
    return json({ error: "not_ready" }, 503);
  }
  if (/join link|schedule|time zone|date and a 24-hour|title|between/i.test(message)) {
    return json({ error: "invalid", message }, 400);
  }
  return json({ error: "invalid" }, 400);
}

type Org = { id: string; name: string };

export async function listCohorts(supabase: SupabaseClient, userId: string) {
  const [{ data: cohorts, error }, staff] = await Promise.all([
    supabase
      .from("cohorts")
      .select("id, name, org_id, programme_id, start_on, timezone, status, organisations(name)")
      .order("start_on", { ascending: true }),
    staffOrgs(supabase, userId),
  ]);
  if (error) return dbError(error);
  return json({
    cohorts: (cohorts ?? []).map((row) => {
      const org = embed(row.organisations);
      return {
        id: row.id as string,
        name: row.name as string,
        orgId: row.org_id as string,
        orgName: org?.name ?? "Organisation",
        programmeId: (row.programme_id as string | null) ?? null,
        startOn: row.start_on as string,
        timeZone: row.timezone as string,
        status: row.status as string,
      };
    }),
    organisations: staff,
  });
}

export async function createCohort(supabase: SupabaseClient, user: User, body: Record<string, unknown>) {
  const orgId = String(body.orgId ?? "");
  if (!isUuid(orgId)) return json({ error: "invalid", message: "Choose an organisation" }, 400);
  const name = cleanText(body.name, 120);
  if (name.length < 2) return json({ error: "invalid", message: "Give the cohort a name" }, 400);
  const startOn = String(body.startOn ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startOn)) {
    return json({ error: "invalid", message: "Choose a start date" }, 400);
  }
  const timeZone = cleanText(body.timeZone, 64) || "Africa/Johannesburg";
  const programme = cleanText(body.programmeId, 20);
  const programmeId = programme === "kids" || programme === "adolescents" || programme === "adults" ? programme : null;
  const description = cleanText(body.description, 2000) || null;

  const { data: created, error } = await supabase
    .from("cohorts")
    .insert({
      org_id: orgId,
      name,
      programme_id: programmeId,
      start_on: startOn,
      timezone: timeZone,
      description,
      status: "scheduled",
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !created) return error ? dbError(error) : json({ error: "invalid" }, 400);

  const displayName = await ownDisplayName(supabase, user, orgId);
  const member = await supabase.from("cohort_members").insert({
    cohort_id: created.id,
    user_id: user.id,
    role: "facilitator",
    display_name: displayName,
  });
  if (member.error) return dbError(member.error);

  const schedule = body.schedule;
  if (schedule && typeof schedule === "object") {
    const plan = schedule as Record<string, unknown>;
    try {
      const sessions = expandSchedule({
        startOn,
        time: String(plan.time ?? ""),
        timeZone,
        count: Number(plan.count),
        intervalDays: Number(plan.intervalDays),
        durationMinutes: Number(plan.durationMinutes),
        title: String(plan.title ?? name),
        joinUrl: plan.joinUrl ? String(plan.joinUrl) : null,
      });
      const inserted = await insertSessions(supabase, user.id, created.id as string, sessions);
      if (inserted) return inserted;
    } catch (error) {
      return json({ error: "invalid", message: error instanceof Error ? error.message : "Check the schedule" }, 400);
    }
  }
  return json({ id: created.id }, 201);
}

export async function cohortDetail(supabase: SupabaseClient, userId: string, cohortId: string) {
  if (!isUuid(cohortId)) return json({ error: "invalid" }, 400);
  const { data: cohort, error } = await supabase
    .from("cohorts")
    .select("id, name, org_id, programme_id, start_on, timezone, description, status, created_by, organisations(name)")
    .eq("id", cohortId)
    .maybeSingle();
  if (error) return dbError(error);
  if (!cohort) return json({ error: "not_found" }, 404);

  const [membersRes, sessionsRes, threadsRes, attendanceRes] = await Promise.all([
    supabase.from("cohort_members").select("user_id, role, display_name").eq("cohort_id", cohortId),
    supabase
      .from("cohort_sessions")
      .select("id, title, starts_at, ends_at, join_url, position")
      .eq("cohort_id", cohortId)
      .order("starts_at", { ascending: true }),
    supabase
      .from("cohort_threads")
      .select("id, title, session_id, locked, hidden, created_at")
      .eq("cohort_id", cohortId)
      .order("created_at", { ascending: true }),
    supabase.from("cohort_attendance").select("session_id, user_id, status"),
  ]);
  for (const result of [membersRes, sessionsRes, threadsRes, attendanceRes]) {
    if (result.error) return dbError(result.error);
  }

  const members = (membersRes.data ?? []) as { user_id: string; role: string; display_name: string | null }[];
  const mine = members.find((member) => member.user_id === userId);
  const viewer: Viewer =
    mine?.role === "facilitator" || (!mine && cohort.created_by === userId)
      ? "facilitator"
      : mine
        ? "learner"
        : "admin";
  const staff = viewer !== "learner";
  const names = new Map(members.map((member) => [member.user_id, member.display_name?.trim() || "Cohort member"]));

  const threadIds = (threadsRes.data ?? []).map((thread) => thread.id as string);
  const postsRes = threadIds.length
    ? await supabase
        .from("cohort_posts")
        .select("id, thread_id, author_id, body, created_at, hidden, hidden_reason")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };
  if (postsRes.error) return dbError(postsRes.error);

  const sessionIds = new Set((sessionsRes.data ?? []).map((session) => session.id as string));
  const attendance = ((attendanceRes.data ?? []) as { session_id: string; user_id: string; status: string }[]).filter(
    (row) => sessionIds.has(row.session_id),
  );

  let roster: { userId: string; displayName: string }[] | undefined;
  if (staff) {
    const { data: orgMembers } = await supabase
      .from("org_members")
      .select("user_id, display_name, role")
      .eq("org_id", cohort.org_id);
    const inCohort = new Set(members.map((member) => member.user_id));
    roster = ((orgMembers ?? []) as { user_id: string; display_name: string | null; role: string }[])
      .filter((member) => !inCohort.has(member.user_id))
      .map((member) => ({
        userId: member.user_id,
        displayName: member.display_name?.trim() || (member.role === "learner" ? "Learner" : "Colleague"),
      }));
  }

  return json({
    viewer,
    cohort: {
      id: cohort.id,
      name: cohort.name,
      orgId: cohort.org_id,
      orgName: embed(cohort.organisations)?.name ?? "Organisation",
      programmeId: cohort.programme_id,
      startOn: cohort.start_on,
      timeZone: cohort.timezone,
      description: cohort.description,
      status: cohort.status,
    },
    members: members.map((member) => ({
      ...(staff ? { userId: member.user_id } : {}),
      displayName: names.get(member.user_id) ?? "Cohort member",
      role: member.role,
    })),
    sessions: (sessionsRes.data ?? []).map((session) => {
      const marks = attendance.filter((row) => row.session_id === session.id);
      return {
        id: session.id,
        title: session.title,
        startsAt: session.starts_at,
        endsAt: session.ends_at,
        joinUrl: session.join_url,
        ...(staff
          ? {
              attendance: marks.map((mark) => ({
                userId: mark.user_id,
                displayName: names.get(mark.user_id) ?? "Cohort member",
                status: mark.status,
              })),
            }
          : { myAttendance: marks.find((mark) => mark.user_id === userId)?.status ?? null }),
      };
    }),
    threads: (threadsRes.data ?? []).map((thread) => ({
      id: thread.id,
      title: thread.title,
      sessionId: thread.session_id,
      locked: thread.locked,
      hidden: thread.hidden,
      posts: ((postsRes.data ?? []) as {
        id: string;
        thread_id: string;
        author_id: string | null;
        body: string;
        created_at: string;
        hidden: boolean;
        hidden_reason: string | null;
      }[])
        .filter((post) => post.thread_id === thread.id)
        .map((post) => ({
          id: post.id,
          body: post.body,
          authorName: post.author_id ? (names.get(post.author_id) ?? "Former member") : "Former member",
          createdAt: post.created_at,
          hidden: post.hidden,
          ...(staff && post.hidden ? { hiddenReason: post.hidden_reason } : {}),
        })),
    })),
    ...(roster ? { roster } : {}),
  });
}

export async function addSessions(
  supabase: SupabaseClient,
  userId: string,
  cohortId: string,
  body: Record<string, unknown>,
) {
  if (!isUuid(cohortId)) return json({ error: "invalid" }, 400);
  const { data: cohort, error } = await supabase.from("cohorts").select("timezone, start_on").eq("id", cohortId).maybeSingle();
  if (error) return dbError(error);
  if (!cohort) return json({ error: "not_found" }, 404);
  let sessions: PlannedSession[];
  try {
    if (body.schedule && typeof body.schedule === "object") {
      const plan = body.schedule as Record<string, unknown>;
      sessions = expandSchedule({
        startOn: String(plan.startOn ?? cohort.start_on),
        time: String(plan.time ?? ""),
        timeZone: String(cohort.timezone),
        count: Number(plan.count),
        intervalDays: Number(plan.intervalDays),
        durationMinutes: Number(plan.durationMinutes),
        title: String(plan.title ?? ""),
        joinUrl: plan.joinUrl ? String(plan.joinUrl) : null,
      });
    } else {
      const title = cleanText(body.title, 120);
      if (title.length < 2) return json({ error: "invalid", message: "Give the session a title" }, 400);
      const starts = zonedToUtc(String(body.date ?? ""), String(body.time ?? ""), String(cohort.timezone));
      const minutes = Number(body.durationMinutes) || 60;
      const length = Number.isInteger(minutes) && minutes >= 15 && minutes <= 180 ? minutes : 60;
      sessions = [
        {
          title,
          startsAt: starts.toISOString(),
          endsAt: new Date(starts.getTime() + length * 60_000).toISOString(),
          joinUrl: cleanJoinUrl(body.joinUrl),
          position: Number(body.position) || 0,
        },
      ];
    }
  } catch (error) {
    return json({ error: "invalid", message: error instanceof Error ? error.message : "Check the session" }, 400);
  }
  const inserted = await insertSessions(supabase, userId, cohortId, sessions);
  if (inserted) return inserted;
  return json({ ok: true });
}

export async function addMember(supabase: SupabaseClient, user: User, cohortId: string, body: Record<string, unknown>) {
  if (!isUuid(cohortId)) return json({ error: "invalid" }, 400);
  const userId = String(body.userId ?? "");
  if (!isUuid(userId)) return json({ error: "invalid", message: "Choose a person from the organisation" }, 400);
  const role = body.role === "facilitator" ? "facilitator" : "learner";
  const { data: cohort } = await supabase.from("cohorts").select("org_id").eq("id", cohortId).maybeSingle();
  if (!cohort) return json({ error: "not_found" }, 404);
  const { data: orgMember } = await supabase
    .from("org_members")
    .select("display_name")
    .eq("org_id", cohort.org_id)
    .eq("user_id", userId)
    .maybeSingle();
  const { error } = await supabase.from("cohort_members").insert({
    cohort_id: cohortId,
    user_id: userId,
    role,
    display_name: orgMember?.display_name?.trim() || (userId === user.id ? await ownDisplayName(supabase, user, cohort.org_id) : "Cohort member"),
  });
  if (error) return dbError(error);
  return json({ ok: true });
}

export async function markAttendance(
  supabase: SupabaseClient,
  userId: string,
  cohortId: string,
  body: Record<string, unknown>,
) {
  const sessionId = String(body.sessionId ?? "");
  const learnerId = String(body.userId ?? "");
  const status = String(body.status ?? "");
  if (!isUuid(sessionId) || !isUuid(learnerId)) return json({ error: "invalid" }, 400);
  if (status !== "present" && status !== "absent" && status !== "excused") {
    return json({ error: "invalid", message: "Attendance is present, absent or excused" }, 400);
  }
  const { data: session } = await supabase
    .from("cohort_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("cohort_id", cohortId)
    .maybeSingle();
  if (!session) return json({ error: "not_found" }, 404);
  const { error } = await supabase.from("cohort_attendance").upsert(
    { session_id: sessionId, user_id: learnerId, status, marked_by: userId, marked_at: new Date().toISOString() },
    { onConflict: "session_id,user_id" },
  );
  if (error) return dbError(error);
  return json({ ok: true });
}

export async function createThread(supabase: SupabaseClient, userId: string, cohortId: string, body: Record<string, unknown>) {
  const title = cleanText(body.title, 140);
  if (title.length < 1) return json({ error: "invalid", message: "Give the discussion a title" }, 400);
  const sessionId = body.sessionId ? String(body.sessionId) : null;
  if (sessionId && !isUuid(sessionId)) return json({ error: "invalid" }, 400);
  const { data, error } = await supabase
    .from("cohort_threads")
    .insert({ cohort_id: cohortId, session_id: sessionId, title, created_by: userId })
    .select("id")
    .single();
  if (error) return dbError(error);
  const opening = cleanText(body.body, 4000);
  if (opening && data) {
    const post = await supabase.from("cohort_posts").insert({ thread_id: data.id, author_id: userId, body: opening });
    if (post.error) return dbError(post.error);
  }
  return json({ id: data?.id }, 201);
}

export async function createPost(
  supabase: SupabaseClient,
  userId: string,
  cohortId: string,
  threadId: string,
  body: Record<string, unknown>,
) {
  if (!isUuid(threadId)) return json({ error: "invalid" }, 400);
  const text = cleanText(body.body, 4000);
  if (text.length < 1) return json({ error: "invalid", message: "Write a message before posting" }, 400);
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await supabase
    .from("cohort_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since);
  if ((count ?? 0) >= 30) return json({ error: "slow_down", message: "Please wait a little before posting again" }, 429);
  const { data: thread } = await supabase
    .from("cohort_threads")
    .select("id")
    .eq("id", threadId)
    .eq("cohort_id", cohortId)
    .maybeSingle();
  if (!thread) return json({ error: "not_found" }, 404);
  const { error } = await supabase.from("cohort_posts").insert({ thread_id: threadId, author_id: userId, body: text });
  if (error) {
    if (/locked|row-level security/i.test(error.message)) {
      return json({ error: "forbidden", message: "This discussion is locked" }, 403);
    }
    return dbError(error);
  }
  return json({ ok: true }, 201);
}

export async function moderate(supabase: SupabaseClient, userId: string, cohortId: string, body: Record<string, unknown>) {
  const action = String(body.action ?? "");
  const id = String(body.id ?? "");
  if (!isUuid(id)) return json({ error: "invalid" }, 400);
  if (action === "lock" || action === "unlock" || action === "hide_thread") {
    const patch =
      action === "lock" ? { locked: true } : action === "unlock" ? { locked: false } : { hidden: true };
    const { error } = await supabase.from("cohort_threads").update(patch).eq("id", id).eq("cohort_id", cohortId);
    if (error) return dbError(error);
    return json({ ok: true });
  }
  if (action === "hide_post" || action === "restore_post") {
    const reason = cleanText(body.reason, 300) || null;
    const { data: post } = await supabase.from("cohort_posts").select("id, thread_id").eq("id", id).maybeSingle();
    if (!post) return json({ error: "not_found" }, 404);
    const { data: thread } = await supabase
      .from("cohort_threads")
      .select("id")
      .eq("id", post.thread_id)
      .eq("cohort_id", cohortId)
      .maybeSingle();
    if (!thread) return json({ error: "not_found" }, 404);
    const { error } = await supabase
      .from("cohort_posts")
      .update(
        action === "hide_post"
          ? { hidden: true, hidden_reason: reason, hidden_by: userId }
          : { hidden: false, hidden_reason: null, hidden_by: null },
      )
      .eq("id", id);
    if (error) return dbError(error);
    return json({ ok: true });
  }
  return json({ error: "invalid" }, 400);
}

async function insertSessions(supabase: SupabaseClient, userId: string, cohortId: string, sessions: PlannedSession[]) {
  if (sessions.length === 0) return null;
  const { error } = await supabase.from("cohort_sessions").insert(
    sessions.map((session) => ({
      cohort_id: cohortId,
      title: session.title,
      starts_at: session.startsAt,
      ends_at: session.endsAt,
      join_url: session.joinUrl,
      position: session.position,
      created_by: userId,
    })),
  );
  return error ? dbError(error) : null;
}

async function staffOrgs(supabase: SupabaseClient, userId: string): Promise<Org[]> {
  const [{ data: mem }, { data: owned }] = await Promise.all([
    supabase.from("org_members").select("role, organisations(id, name)").eq("user_id", userId).in("role", ["coach", "admin"]),
    supabase.from("organisations").select("id, name").eq("owner_user_id", userId),
  ]);
  const byId = new Map<string, Org>();
  for (const row of (mem ?? []) as unknown as { organisations: Org | Org[] | null }[]) {
    const org = embed(row.organisations);
    if (org) byId.set(org.id, org);
  }
  for (const org of (owned ?? []) as Org[]) byId.set(org.id, org);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function ownDisplayName(supabase: SupabaseClient, user: User, orgId: string): Promise<string> {
  const { data } = await supabase
    .from("org_members")
    .select("display_name")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();
  const named = data?.display_name?.trim();
  if (named) return named.slice(0, 80);
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  return (profile?.full_name?.trim() || "Facilitator").slice(0, 80);
}

function embed<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
