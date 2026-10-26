"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { formatInZone } from "@/lib/lms/cohorts";

type Viewer = "learner" | "facilitator" | "admin";
type Member = { userId?: string; displayName: string; role: string };
type Session = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  joinUrl: string | null;
  attendance?: { userId: string; displayName: string; status: string }[];
  myAttendance?: string | null;
};
type Post = { id: string; body: string; authorName: string; createdAt: string; hidden: boolean; hiddenReason?: string | null };
type Thread = { id: string; title: string; sessionId: string | null; locked: boolean; hidden: boolean; posts: Post[] };
type Detail = {
  viewer: Viewer;
  cohort: {
    id: string;
    name: string;
    orgName: string;
    programmeId: string | null;
    startOn: string;
    timeZone: string;
    description: string | null;
    status: string;
  };
  members: Member[];
  sessions: Session[];
  threads: Thread[];
  roster?: { userId: string; displayName: string }[];
};

const ATTENDANCE = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;

export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [state, setState] = useState<"loading" | "sign_in" | "missing" | "unavailable" | "ready">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/cohorts/${id}`, { cache: "no-store" });
    const body = (await response.json().catch(() => ({}))) as Detail & { error?: string };
    if (response.status === 401) return setState("sign_in");
    if (response.status === 404) return setState("missing");
    if (!response.ok || !body.cohort) return setState("unavailable");
    setDetail(body);
    setState("ready");
  }, [id]);

  useEffect(() => {
    void load().catch(() => setState("unavailable"));
  }, [load]);

  async function send(path: string, payload: unknown, ok: string) {
    setError(null);
    setMessage(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setError(body.message || "That could not be saved.");
      return;
    }
    setMessage(ok);
    await load();
  }

  const staff = detail?.viewer === "facilitator" || detail?.viewer === "admin";

  return (
    <LearnShell title={detail?.cohort.name ?? "Cohort"} subtitle={detail ? `${detail.cohort.orgName} · ${detail.cohort.timeZone}` : "Super-Cube® live cohort"}>
      <p className="mb-4">
        <Link href="/learn/cohorts" className="text-sm font-semibold text-ink underline underline-offset-2">
          All cohorts
        </Link>
      </p>
      {state === "loading" && <p className="learn-meta" role="status">Loading cohort…</p>}
      {state === "sign_in" && (
        <Link href={`/login?next=${encodeURIComponent(`/learn/cohorts/${id}`)}`} className="learn-btn learn-btn-primary">
          Sign in
        </Link>
      )}
      {state === "missing" && <p className="learn-card" role="status">This cohort is not available to you.</p>}
      {state === "unavailable" && <p className="learn-card" role="alert">The cohort could not be loaded.</p>}
      {message && <p className="mb-3 text-sm font-medium text-ink" role="status">{message}</p>}
      {error && <p className="mb-3 text-sm font-medium text-red-800" role="alert">{error}</p>}

      {detail && state === "ready" && (
        <div className="grid gap-4">
          <section className="learn-card" aria-labelledby="cohort-about">
            <h2 id="cohort-about" className="learn-card-title">About this cohort</h2>
            <p className="learn-meta mt-1">
              Starts {detail.cohort.startOn}. Status: {detail.cohort.status}.
              {programmeLabel(detail.cohort.programmeId) ? ` Programme: ${programmeLabel(detail.cohort.programmeId)}.` : ""}
            </p>
            {detail.cohort.description && <p className="mt-2 text-sm leading-relaxed text-ink">{detail.cohort.description}</p>}
            <h3 className="mt-4 text-sm font-semibold text-ink">People</h3>
            <ul className="mt-2 grid gap-1 text-sm text-ink">
              {detail.members.map((member) => (
                <li key={`${member.displayName}-${member.role}-${member.userId ?? "self"}`}>
                  {member.displayName} <span className="text-slate">({member.role === "facilitator" ? "Facilitator" : "Learner"})</span>
                </li>
              ))}
            </ul>
          </section>

          {staff && detail.roster && (
            <form
              className="learn-card grid gap-3"
              aria-labelledby="add-member"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void send(`/api/cohorts/${id}/members`, { userId: form.get("userId"), role: form.get("role") }, "Member added.");
                event.currentTarget.reset();
              }}
            >
              <h2 id="add-member" className="learn-card-title">Add someone from the organisation</h2>
              <p className="learn-meta">Only people who already belong to the organisation can be added. Email addresses are not shown.</p>
              {detail.roster.length === 0 ? (
                <p className="text-sm text-slate">Everyone in the organisation is already in this cohort.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="member-id">
                    Person
                    <select id="member-id" name="userId" required className="min-h-11 rounded-xl border border-line bg-surface px-3">
                      {detail.roster.map((person) => (
                        <option key={person.userId} value={person.userId}>{person.displayName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="member-role">
                    Role
                    <select id="member-role" name="role" className="min-h-11 rounded-xl border border-line bg-surface px-3">
                      <option value="learner">Learner</option>
                      <option value="facilitator">Facilitator</option>
                    </select>
                  </label>
                  <button type="submit" className="learn-btn learn-btn-primary min-h-11">Add</button>
                </div>
              )}
            </form>
          )}

          <section className="grid gap-3" aria-labelledby="sessions-h">
            <h2 id="sessions-h" className="learn-card-title">Live sessions</h2>
            {detail.sessions.length === 0 && <p className="learn-meta">No sessions scheduled yet.</p>}
            <ul className="grid gap-3">
              {detail.sessions.map((session) => (
                <li key={session.id} className="learn-card">
                  <h3 className="font-semibold text-ink">{session.title}</h3>
                  <p className="learn-meta mt-1">
                    <time dateTime={session.startsAt}>{formatInZone(session.startsAt, detail.cohort.timeZone)}</time>
                    {session.endsAt ? ` to ${formatInZone(session.endsAt, detail.cohort.timeZone)}` : ""}
                  </p>
                  {session.joinUrl ? (
                    <a href={session.joinUrl} className="mt-2 inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                      Join live session
                    </a>
                  ) : (
                    <p className="learn-meta mt-2">No join link yet.</p>
                  )}
                  {!staff && (
                    <p className="mt-2 text-sm text-ink">
                      Your attendance: {labelAttendance(session.myAttendance)}
                    </p>
                  )}
                  {staff && (
                    <ul className="mt-3 grid gap-2">
                      {detail.members.map((member) => {
                        const mark = session.attendance?.find((row) => row.userId === member.userId)?.status ?? "";
                        return (
                          <li key={member.userId ?? member.displayName} className="grid items-center gap-2 sm:grid-cols-[1fr_11rem]">
                            <span className="text-sm text-ink">{member.displayName}</span>
                            <label className="sr-only" htmlFor={`att-${session.id}-${member.userId}`}>
                              Attendance for {member.displayName}
                            </label>
                            <select
                              id={`att-${session.id}-${member.userId}`}
                              className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm"
                              value={mark}
                              onChange={(event) => {
                                if (!member.userId || !event.target.value) return;
                                void send(
                                  `/api/cohorts/${id}/attendance`,
                                  { sessionId: session.id, userId: member.userId, status: event.target.value },
                                  "Attendance saved.",
                                );
                              }}
                            >
                              <option value="">Not marked</option>
                              {ATTENDANCE.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {staff && (
            <form
              className="learn-card grid gap-3"
              aria-labelledby="add-session"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const date = String(form.get("date") ?? "");
                const time = String(form.get("time") ?? "");
                void send(
                  `/api/cohorts/${id}/sessions`,
                  { title: form.get("title"), date, time, joinUrl: form.get("joinUrl") },
                  "Session added.",
                );
                event.currentTarget.reset();
              }}
            >
              <h2 id="add-session" className="learn-card-title">Add a session</h2>
              <p className="learn-meta">The date and time use {detail.cohort.timeZone}, the cohort&apos;s time zone.</p>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="new-session-title">
                Title
                <input id="new-session-title" name="title" required minLength={2} maxLength={120} className="min-h-11 rounded-xl border border-line bg-surface px-3" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="new-session-date">
                  Date
                  <input id="new-session-date" name="date" type="date" required className="min-h-11 rounded-xl border border-line bg-surface px-3" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="new-session-time">
                  Time
                  <input id="new-session-time" name="time" type="time" required className="min-h-11 rounded-xl border border-line bg-surface px-3" />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="new-session-join">
                Join link
                <input id="new-session-join" name="joinUrl" type="url" placeholder="https://" className="min-h-11 rounded-xl border border-line bg-surface px-3" />
              </label>
              <button type="submit" className="learn-btn learn-btn-primary min-h-11 w-full sm:w-auto">Add session</button>
            </form>
          )}

          <section className="grid gap-3" aria-labelledby="discuss-h">
            <h2 id="discuss-h" className="learn-card-title">Discussion</h2>
            <form
              className="learn-card grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void send(`/api/cohorts/${id}/threads`, { title: form.get("title"), body: form.get("body"), sessionId: form.get("sessionId") || null }, "Discussion started.");
                event.currentTarget.reset();
              }}
            >
              <h3 className="text-sm font-semibold text-ink">Start a thread</h3>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="thread-title">
                Title
                <input id="thread-title" name="title" required maxLength={140} className="min-h-11 rounded-xl border border-line bg-surface px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="thread-session">
                About a session <span className="font-normal text-slate">(optional)</span>
                <select id="thread-session" name="sessionId" className="min-h-11 rounded-xl border border-line bg-surface px-3">
                  <option value="">Whole cohort</option>
                  {detail.sessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.title}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="thread-body">
                Message
                <textarea id="thread-body" name="body" required maxLength={4000} rows={3} className="rounded-xl border border-line bg-surface px-3 py-2" />
              </label>
              <button type="submit" className="learn-btn learn-btn-primary min-h-11 w-full sm:w-auto">Post thread</button>
            </form>

            <ul className="grid gap-3">
              {detail.threads.map((thread) => (
                <li key={thread.id} className="learn-card">
                  <h3 className="font-semibold text-ink">{thread.title}</h3>
                  {thread.locked && <p className="text-sm text-slate">This discussion is locked.</p>}
                  {thread.hidden && staff && <p className="text-sm text-slate">Hidden from learners.</p>}
                  <ul className="mt-3 grid gap-3">
                    {thread.posts.map((post) => (
                      <li key={post.id} className="rounded-xl border border-line px-3 py-2">
                        <p className="text-xs font-semibold text-slate">
                          {post.authorName}
                          {post.hidden ? " · Hidden" : ""}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.body}</p>
                        {staff && post.hidden && post.hiddenReason && (
                          <p className="mt-1 text-xs text-slate">Reason: {post.hiddenReason}</p>
                        )}
                        {staff && (
                          <button
                            type="button"
                            className="mt-2 min-h-11 text-sm font-semibold text-ink underline underline-offset-2"
                            onClick={() =>
                              void send(
                                `/api/cohorts/${id}/moderation`,
                                { action: post.hidden ? "restore_post" : "hide_post", id: post.id, reason: "Removed by facilitator" },
                                post.hidden ? "Post restored." : "Post hidden from learners.",
                              )
                            }
                          >
                            {post.hidden ? "Restore post" : "Hide post"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!thread.locked && (
                    <form
                      className="mt-3 grid gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        void send(`/api/cohorts/${id}/threads/${thread.id}/posts`, { body: form.get("body") }, "Posted.");
                        event.currentTarget.reset();
                      }}
                    >
                      <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor={`reply-${thread.id}`}>
                        Reply
                        <textarea id={`reply-${thread.id}`} name="body" required maxLength={4000} rows={2} className="rounded-xl border border-line bg-surface px-3 py-2" />
                      </label>
                      <button type="submit" className="learn-btn learn-btn-ghost min-h-11 w-full sm:w-auto">Reply</button>
                    </form>
                  )}
                  {staff && (
                    <button
                      type="button"
                      className="mt-2 min-h-11 text-sm font-semibold text-ink underline underline-offset-2"
                      onClick={() =>
                        void send(
                          `/api/cohorts/${id}/moderation`,
                          { action: thread.locked ? "unlock" : "lock", id: thread.id },
                          thread.locked ? "Discussion unlocked." : "Discussion locked.",
                        )
                      }
                    >
                      {thread.locked ? "Unlock discussion" : "Lock discussion"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </LearnShell>
  );
}

function programmeLabel(id: string | null): string | null {
  if (id === "kids") return "Super-Cube® Kids";
  if (id === "adolescents") return "Super-Cube® Adolescents";
  if (id === "adults") return "Super-Cube® Adults";
  return null;
}

function labelAttendance(status: string | null | undefined): string {
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  if (status === "excused") return "Excused";
  return "Not marked";
}
