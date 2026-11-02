"use client";

import { useEffect, useState } from "react";
import { faceInkStyle } from "@/lib/contrast";
import { dirOf, LOCALE_HTML_LANG, type Locale } from "@/lib/i18n/config";
import { fillCopy, lmsText } from "@/lib/i18n/lms/text";
import { LIKERT_LABELS } from "@/lib/lms/assessment-items";

type Face = { id: string; name: string; color: string; tagline: string };
type Load =
  | { kind: "loading" }
  | { kind: "error"; code: string }
  | { kind: "ready"; firstName: string; relationship: "manager" | "peer"; faces: Face[] }
  | { kind: "done" };

export function CheckinRater({ token, locale }: { token: string; locale: Locale }) {
  const t = (s: string) => lmsText(locale, s);
  const fill = (s: string, vars: Record<string, string | number>) => fillCopy(t(s), vars);
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/checkin/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) setLoad({ kind: "ready", firstName: j.firstName, relationship: j.relationship, faces: j.faces });
        else setLoad({ kind: "error", code: String(j.error || "not_found") });
      })
      .catch(() => setLoad({ kind: "error", code: "unavailable" }));
  }, [token]);

  async function submit() {
    if (load.kind !== "ready") return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/checkin/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ responses: answers }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok && j.ok) setLoad({ kind: "done" });
    else setErr(String(j.error || "save_failed"));
  }

  const name = load.kind === "ready" && load.firstName ? load.firstName : t("A colleague");
  const role = load.kind === "ready" ? (load.relationship === "manager" ? t("manager") : t("peer")) : "";

  return (
    <main
      lang={LOCALE_HTML_LANG[locale]}
      dir={dirOf(locale)}
      className="mx-auto max-w-2xl px-4 pb-20 pt-28 lg:pt-32"
      data-testid="checkin-rater"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{t("Super-Cube® check-in")}</p>
      <p className="mt-1 text-[0.8125rem] font-semibold text-ink">{t("Issued by Super-Cube® by Big Five Group.")}</p>

      {load.kind === "loading" && <p className="mt-4 text-sm text-muted">{t("Loading…")}</p>}

      {load.kind === "done" && (
        <>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{t("Thank you")}</h1>
          <p className="mt-2 text-slate">{t("Your ratings have been saved. You can close this page.")}</p>
        </>
      )}

      {load.kind === "error" && (
        <>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{t("This check-in link cannot be used")}</h1>
          <p className="mt-2 text-slate">
            {load.code === "already_completed"
              ? t("Ratings have already been sent with this link. Each link works once.")
              : load.code === "expired"
                ? t("This check-in link has expired.")
                : t("The link may be mistyped or no longer valid.")}
          </p>
        </>
      )}

      {load.kind === "ready" && (
        <>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{fill("A check-in for {name}", { name })}</h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate">
            {fill("{name} asked you, as their {role}, to rate how strongly you see them on each Super-Cube® face. Use the same agreement scale as their self-report. It takes about 3 minutes.", { name, role })}
          </p>
          <p className="mt-2 text-[0.875rem] text-slate">{t("This is for development only, never for hiring, pay or disciplinary decisions.")}</p>
          <div className="mt-6 space-y-4">
            {load.faces.map((face) => (
              <fieldset key={face.id} className="rounded-2xl border border-line border-s-4 bg-elevated p-4 sm:p-5" style={{ borderInlineStartColor: face.color }}>
                <legend className="face-ink px-1 text-[1rem] font-semibold" style={faceInkStyle(face.color)}>{t(face.name)}</legend>
                <p className="text-[0.8125rem] text-slate">{face.tagline}</p>
                <p className="mt-2 text-[0.875rem] font-medium text-ink">{fill("How strongly do you see {name} living this face?", { name })}</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                  {LIKERT_LABELS.map((label, i) => {
                    const value = i + 1;
                    const sel = answers[face.id] === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={sel}
                        onClick={() => setAnswers((a) => ({ ...a, [face.id]: value }))}
                        className={`min-h-11 rounded-lg border px-1.5 py-1.5 text-[0.75rem] font-semibold leading-tight ${
                          sel ? "border-ink bg-void text-void-fg" : "border-line-strong bg-surface text-slate"
                        }`}
                      >
                        {t(label)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold disabled:opacity-40"
              disabled={busy || Object.keys(answers).length < load.faces.length}
              onClick={() => void submit()}
            >
              {busy ? t("Saving…") : t("Submit ratings")}
            </button>
          </div>
          {err && (
            <p className="mt-3 text-sm font-medium text-red-700" role="alert">
              {err === "Please rate every face." ? t(err) : t("The link may be mistyped or no longer valid.")}
            </p>
          )}
        </>
      )}
    </main>
  );
}
