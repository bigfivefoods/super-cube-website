"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";
import { V2_SCALE, OBSERVER_DONT_KNOW } from "@/lib/lms/instruments/v2-bank";
import type { ObserverItem } from "@/lib/lms/instruments";
import { RELATIONSHIP_LABELS, type RaterRelationship } from "@/lib/lms/feedback360";

type Load =
  | { kind: "loading" }
  | { kind: "error"; code: string }
  | { kind: "ready"; firstName: string; relationship: RaterRelationship; items: ObserverItem[] }
  | { kind: "done" };

/** Rater form for 360 feedback. No account needed; the link is single-use. */
export default function Rater360Page() {
  const params = useParams();
  const token = String(params.token || "");
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/feedback360/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) setLoad({ kind: "ready", firstName: j.firstName, relationship: j.relationship, items: j.items });
        else setLoad({ kind: "error", code: String(j.error || r.status) });
      })
      .catch(() => setLoad({ kind: "error", code: "unavailable" }));
  }, [token]);

  const byFace = useMemo(() => {
    if (load.kind !== "ready") return [];
    return constructs.map((c) => ({ face: c, items: load.items.filter((i) => i.constructId === c.id) }));
  }, [load]);

  if (load.kind === "loading") return <Shell><p className="text-sm text-muted">Loading…</p></Shell>;
  if (load.kind === "done")
    return (
      <Shell>
        <h1 className="text-2xl font-semibold text-ink">Thank you</h1>
        <p className="mt-2 text-slate">Your feedback has been saved. You can close this page.</p>
      </Shell>
    );
  if (load.kind === "error")
    return (
      <Shell>
        <h1 className="text-2xl font-semibold text-ink">This feedback link can’t be used</h1>
        <p className="mt-2 text-slate">
          {load.code === "already_completed"
            ? "Feedback has already been given with this link. Each link works once."
            : load.code === "closed"
              ? "This feedback request has closed."
              : "The link may be mistyped, expired, or feedback may not be switched on yet."}
        </p>
      </Shell>
    );

  const name = load.firstName || "this person";
  const labels = V2_SCALE.adults;
  const answered = Object.keys(answers).length;

  async function submit() {
    if (load.kind !== "ready") return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/feedback360/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ responses: answers }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok && j.ok) setLoad({ kind: "done" });
    else setErr(String(j.error || "Could not save. Please try again."));
  }

  return (
    <Shell>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Super-Cube® 360 feedback</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Feedback for {name}</h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
        {name} is working on their leadership across the six Super-Cube® faces and asked you, as a{" "}
        <strong>{RELATIONSHIP_LABELS[load.relationship].toLowerCase()}</strong>, for honest feedback. It takes about 8
        minutes. Think about what you have actually seen over the last few months.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.875rem] text-slate">
        <li>{name} never sees your individual answers. They see averages only once at least 3 people have answered.</li>
        <li>Choose “{OBSERVER_DONT_KNOW}” when you have no basis to judge. That is better than guessing.</li>
        <li>This is for development only, never for hiring, pay or disciplinary decisions.</li>
      </ul>
      <div className="mt-6 space-y-6">
        {byFace.map(({ face, items }) => (
          <section key={face.id} className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" style={{ boxShadow: `inset 4px 0 0 ${face.color}` }}>
            <h2 className="face-ink text-[1rem] font-semibold" style={faceInkStyle(face.color)}>{face.name}</h2>
            <div className="mt-3 space-y-5">
              {items.map((i) => (
                <fieldset key={i.id}>
                  <legend className="text-[0.875rem] font-medium leading-relaxed text-ink">{i.prompt}</legend>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {[1, 2, 3, 4, 5, 0].map((v) => {
                      const sel = answers[i.id] === v;
                      const label = v === 0 ? OBSERVER_DONT_KNOW : labels[v - 1];
                      return (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => setAnswers((a) => ({ ...a, [i.id]: v }))}
                          className={`min-h-11 rounded-lg border px-1.5 py-1.5 text-[0.75rem] font-semibold leading-tight ${
                            sel ? "border-ink bg-void text-void-fg" : "border-line-strong bg-surface text-slate"
                          } ${v === 0 ? "italic" : ""}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold disabled:opacity-40"
          disabled={busy || answered < load.items.length}
          onClick={() => void submit()}
        >
          {busy ? "Saving…" : "Submit feedback"}
        </button>
        <span className="text-sm text-muted">{answered}/{load.items.length} answered</span>
      </div>
      {err && <p className="mt-3 text-sm font-medium text-red-700" role="alert">{err}</p>}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl px-4 pb-20 pt-28 lg:pt-32">{children}</main>;
}
