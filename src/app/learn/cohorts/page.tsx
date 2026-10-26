"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { cleanText } from "@/lib/lms/cohorts";

type Org = { id: string; name: string };
type Cohort = {
  id: string;
  name: string;
  orgName: string;
  programmeId: string | null;
  startOn: string;
  timeZone: string;
  status: string;
};

type Load =
  | { state: "loading" }
  | { state: "sign_in" }
  | { state: "not_ready" }
  | { state: "unavailable" }
  | { state: "ready"; cohorts: Cohort[]; organisations: Org[] };

export default function CohortsPage() {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/cohorts", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { error?: string; cohorts?: Cohort[]; organisations?: Org[] };
        if (response.status === 401) return setLoad({ state: "sign_in" });
        if (body.error === "not_ready") return setLoad({ state: "not_ready" });
        if (!response.ok) return setLoad({ state: "unavailable" });
        setLoad({ state: "ready", cohorts: body.cohorts ?? [], organisations: body.organisations ?? [] });
      })
      .catch(() => setLoad({ state: "unavailable" }));
  }, []);

  async function create(form: FormData) {
    setBusy(true);
    setError(null);
    const schedule = form.get("withSchedule")
      ? {
          time: String(form.get("time") ?? ""),
          count: Number(form.get("count") || 1),
          intervalDays: Number(form.get("intervalDays") || 7),
          durationMinutes: Number(form.get("duration") || 60),
          title: cleanText(form.get("sessionTitle"), 120) || cleanText(form.get("name"), 120),
          joinUrl: String(form.get("joinUrl") ?? ""),
        }
      : undefined;
    try {
      const response = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: form.get("orgId"),
          name: form.get("name"),
          startOn: form.get("startOn"),
          timeZone: form.get("timeZone") || "Africa/Johannesburg",
          programmeId: form.get("programmeId"),
          description: form.get("description"),
          schedule,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string; error?: string };
      if (!response.ok || !body.id) {
        setError(body.message || "The cohort could not be created.");
        return;
      }
      window.location.assign(`/learn/cohorts/${body.id}`);
    } catch {
      setError("The cohort could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LearnShell
      title="Live cohorts"
      subtitle="Scheduled Super-Cube® sessions for a cohort. Only members, facilitators and organisation admins can see one."
    >
      {load.state === "loading" && (
        <p className="learn-meta" role="status">
          Loading cohorts…
        </p>
      )}
      {load.state === "sign_in" && (
        <p className="learn-card">
          <Link href="/login?next=%2Flearn%2Fcohorts" className="learn-btn learn-btn-primary">
            Sign in
          </Link>
        </p>
      )}
      {load.state === "not_ready" && (
        <p className="learn-card" role="status">
          Live cohorts are not switched on yet. Please check back soon.
        </p>
      )}
      {load.state === "unavailable" && (
        <p className="learn-card" role="alert">
          Cohorts could not be loaded. Please try again in a moment.
        </p>
      )}
      {load.state === "ready" && (
        <div className="grid gap-4">
          {load.cohorts.length === 0 ? (
            <p className="learn-card" data-testid="cohorts-empty">
              You are not in a live cohort yet. A facilitator or organisation admin can add you.
            </p>
          ) : (
            <ul className="grid gap-3" data-testid="cohort-list">
              {load.cohorts.map((cohort) => (
                <li key={cohort.id}>
                  <Link
                    href={`/learn/cohorts/${cohort.id}`}
                    className="learn-card block min-h-11 hover:border-ink/30"
                  >
                    <span className="learn-card-title">{cohort.name}</span>
                    <span className="learn-meta mt-1 block">
                      {cohort.orgName}
                      {" · "}
                      Starts {cohort.startOn}
                      {" · "}
                      <span className="capitalize">{cohort.status}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {load.organisations.length > 0 && (
            <form
              className="learn-card grid gap-3"
              data-testid="cohort-create"
              onSubmit={(event) => {
                event.preventDefault();
                void create(new FormData(event.currentTarget));
              }}
            >
              <h2 className="learn-card-title">Create a cohort</h2>
              <p className="learn-meta">
                Organisation admins and coaches can schedule a start date and live sessions. You become the facilitator.
              </p>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-org">
                Organisation
                <select id="cohort-org" name="orgId" required className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium">
                  {load.organisations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-name">
                Cohort name
                <input id="cohort-name" name="name" required minLength={2} maxLength={120} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-start">
                  Start date
                  <input id="cohort-start" name="startOn" type="date" required className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-zone">
                  Time zone
                  <input
                    id="cohort-zone"
                    name="timeZone"
                    defaultValue="Africa/Johannesburg"
                    required
                    className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-programme">
                Programme
                <select id="cohort-programme" name="programmeId" className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium">
                  <option value="">Not set</option>
                  <option value="adults">Super-Cube® Adults</option>
                  <option value="adolescents">Super-Cube® Adolescents</option>
                  <option value="kids">Super-Cube® Kids</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="cohort-description">
                Description <span className="font-normal text-slate">(optional)</span>
                <textarea id="cohort-description" name="description" maxLength={2000} rows={3} className="rounded-xl border border-line bg-surface px-3 py-2 font-medium" />
              </label>
              <fieldset className="grid gap-3 rounded-xl border border-line p-3">
                <legend className="px-1 text-sm font-semibold text-ink">
                  <label className="inline-flex min-h-11 items-center gap-2">
                    <input type="checkbox" name="withSchedule" />
                    Add a repeating live session
                  </label>
                </legend>
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-title">
                  Session title
                  <input id="session-title" name="sessionTitle" maxLength={120} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-time">
                    Time
                    <input id="session-time" name="time" type="time" defaultValue="09:00" className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-count">
                    Sessions
                    <input id="session-count" name="count" type="number" min={1} max={16} defaultValue={4} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-every">
                    Every (days)
                    <input id="session-every" name="intervalDays" type="number" min={1} max={28} defaultValue={7} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                  </label>
                </div>
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-minutes">
                  Length in minutes
                  <input id="session-minutes" name="duration" type="number" min={15} max={180} defaultValue={60} className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink" htmlFor="session-join">
                  Join link <span className="font-normal text-slate">(https)</span>
                  <input id="session-join" name="joinUrl" type="url" inputMode="url" placeholder="https://" className="min-h-11 rounded-xl border border-line bg-surface px-3 font-medium" />
                </label>
              </fieldset>
              {error && (
                <p role="alert" className="text-sm font-medium text-red-800">
                  {error}
                </p>
              )}
              <button type="submit" className="learn-btn learn-btn-primary min-h-11 w-full sm:w-auto" disabled={busy}>
                {busy ? "Creating…" : "Create cohort"}
              </button>
            </form>
          )}
        </div>
      )}
    </LearnShell>
  );
}
